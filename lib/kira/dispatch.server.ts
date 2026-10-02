import { getSql } from "@/lib/db";
import { FALLBACK_BOT_TOKEN } from "./defaults.server";
import { sendTelegramPhoto } from "./telegram.server";
import {
  toHistory,
  toPublicSettings,
  toQueueItem,
  toSlot,
  type HistoryRow,
  type QueueRow,
  type SettingsRow,
  type SlotRow,
} from "./db-map";
import { dayKey, iso, pickSlotTimes } from "./time";
import type { DashboardData, DispatchResult, PublicSettings } from "./types";

async function loadSettingsRow(): Promise<SettingsRow> {
  const sql = await getSql();
  const rows = await sql<SettingsRow>`select * from kira_settings where id = 1`;
  let row = rows[0];
  if (!row) {
    await sql`insert into kira_settings (id) values (1) on conflict (id) do nothing`;
    const again = await sql<SettingsRow>`select * from kira_settings where id = 1`;
    row = again[0];
  }
  if (!row) throw new Error("Não foi possível carregar as configurações.");

  const envToken =
    typeof process !== "undefined"
      ? process.env.TELEGRAM_BOT_TOKEN?.trim()
      : undefined;
  if (!row.bot_token?.trim()) {
    const seed = envToken || FALLBACK_BOT_TOKEN;
    if (seed) {
      await sql`update kira_settings set bot_token = ${seed}, updated_at = now() where id = 1`;
      row = { ...row, bot_token: seed };
    }
  }
  return row;
}

export async function getSettingsInternal() {
  return loadSettingsRow();
}

export async function ensureTodaySlots(now = new Date()): Promise<void> {
  const sql = await getSql();
  const settings = await loadSettingsRow();
  const key = dayKey(now, settings.timezone);
  const existing = await sql<{ n: number }>`
    select count(*)::int as n from daily_slots where day_key = ${key}
  `;
  if ((existing[0]?.n ?? 0) > 0) return;

  const times = pickSlotTimes({
    now,
    timeZone: settings.timezone,
    startHour: settings.window_start_hour,
    endHour: settings.window_end_hour,
    count: settings.max_posts_per_day,
    minGapMinutes: settings.min_gap_minutes,
  });

  for (let i = 0; i < times.length; i += 1) {
    await sql`
      insert into daily_slots (day_key, slot_index, fire_at, status)
      values (${key}, ${i}, ${times[i].toISOString()}, 'pending')
      on conflict (day_key, slot_index) do nothing
    `;
  }
}

async function loadDashboard(): Promise<DashboardData> {
  const sql = await getSql();
  await ensureTodaySlots();
  const settingsRow = await loadSettingsRow();
  const settings: PublicSettings = toPublicSettings(settingsRow);
  const today = dayKey(new Date(), settings.timezone);

  const queueRows = await sql<QueueRow>`
    select * from queue_items
    where status in ('queued', 'paused', 'posting', 'failed')
    order by sort_order asc, created_at asc
  `;
  const slotRows = await sql<SlotRow>`
    select s.*, q.anime_name
    from daily_slots s
    left join queue_items q on q.id = s.queue_item_id
    where s.day_key = ${today}
    order by s.slot_index asc
  `;
  const historyRows = await sql<HistoryRow>`
    select * from post_history
    order by posted_at desc
    limit 24
  `;

  const slots = slotRows.map(toSlot);
  const postedToday = slots.filter((s) => s.status === "fired").length;
  const queuedCount = queueRows.filter((q) => q.status === "queued").length;
  const remainingToday = slots.filter((s) => s.status === "pending").length;
  const nextPending = slots.find((s) => s.status === "pending");

  return {
    settings,
    queue: queueRows.map(toQueueItem),
    slots,
    history: historyRows.map(toHistory),
    todayKey: today,
    postedToday,
    remainingToday,
    queuedCount,
    nextFireAt: nextPending?.fireAt ?? null,
  };
}

export async function readDashboard(): Promise<DashboardData> {
  return loadDashboard();
}

export async function runDispatcher(now = new Date()): Promise<DispatchResult> {
  const sql = await getSql();
  const settings = await loadSettingsRow();
  await ensureTodaySlots(now);
  const today = dayKey(now, settings.timezone);
  const messages: string[] = [];
  let fired = 0;

  const due = await sql<SlotRow>`
    select * from daily_slots
    where day_key = ${today}
      and status = 'pending'
      and fire_at <= ${now.toISOString()}
    order by fire_at asc, slot_index asc
  `;

  for (const slot of due) {
    const claimed = await sql<QueueRow>`
      update queue_items
      set status = 'posting', updated_at = now()
      where id = (
        select id from queue_items
        where status = 'queued'
        order by random()
        limit 1
      )
      returning *
    `;
    const item = claimed[0];
    if (!item) {
      messages.push("Horário chegou, mas a fila está vazia.");
      break;
    }

    const result = await sendTelegramPhoto({
      botToken: settings.bot_token,
      chatId: settings.chat_id,
      photo: item.image_url,
      caption: item.caption,
    });

    if (!result.ok) {
      await sql`
        update queue_items
        set status = 'failed',
            error_message = ${result.description},
            updated_at = now()
        where id = ${item.id}
      `;
      messages.push(`${item.anime_name}: ${result.description}`);
      continue;
    }

    await sql`
      update queue_items
      set status = 'posted',
          posted_at = now(),
          error_message = null,
          updated_at = now()
      where id = ${item.id}
    `;
    await sql`
      update daily_slots
      set status = 'fired', queue_item_id = ${item.id}
      where id = ${slot.id}
    `;
    await sql`
      insert into post_history (queue_item_id, anime_name, image_url, caption, source, telegram_ok)
      values (${item.id}, ${item.anime_name}, ${item.image_url}, ${item.caption}, 'queue', true)
    `;
    fired += 1;
    messages.push(`Publicado da fila: ${item.anime_name}`);
  }

  const dashboard = await loadDashboard();
  return { fired, remaining: dashboard.remainingToday, messages };
}

export async function consumeManualSlot(now = new Date()): Promise<boolean> {
  const sql = await getSql();
  const settings = await loadSettingsRow();
  await ensureTodaySlots(now);
  const today = dayKey(now, settings.timezone);
  const pending = await sql<{ id: number }>`
    select id from daily_slots
    where day_key = ${today} and status = 'pending'
    order by fire_at asc
    limit 1
  `;
  const slotId = pending[0]?.id;
  if (slotId == null) return false;
  await sql`update daily_slots set status = 'fired' where id = ${slotId}`;
  return true;
}

export { iso };
