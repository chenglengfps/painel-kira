import type {
  DaySlot,
  HistoryItem,
  PublicSettings,
  QueueItem,
  QueueStatus,
  SlotStatus,
  PostSource,
} from "./types";
import { iso } from "./time";

export type SettingsRow = {
  bot_token: string;
  chat_id: string;
  channel_link: string;
  news_channel_link: string;
  whatsapp_channel_link: string;
  max_posts_per_day: number;
  window_start_hour: number;
  window_end_hour: number;
  timezone: string;
  min_gap_minutes: number;
};

export type QueueRow = {
  id: number;
  anime_name: string;
  title_romaji: string;
  title_english: string;
  title_native: string;
  year_label: string;
  episodes_label: string;
  genres_label: string;
  invite_link: string;
  image_url: string;
  image_urls: string;
  caption: string;
  threads_text: string;
  status: string;
  sort_order: number;
  error_message: string | null;
  created_at: unknown;
  updated_at: unknown;
  posted_at: unknown;
};

export type SlotRow = {
  id: number;
  day_key: string;
  slot_index: number;
  fire_at: unknown;
  queue_item_id: number | null;
  status: string;
  anime_name?: string | null;
};

export type HistoryRow = {
  id: number;
  queue_item_id: number | null;
  anime_name: string;
  image_url: string;
  caption: string;
  posted_at: unknown;
  source: string;
  telegram_ok: boolean;
  telegram_error: string | null;
};

function maskToken(token: string): string {
  const t = token.trim();
  if (!t) return "";
  if (t.length <= 10) return "••••";
  return `${t.slice(0, 4)}••••${t.slice(-4)}`;
}

export function toPublicSettings(row: SettingsRow): PublicSettings {
  const token = row.bot_token?.trim() ?? "";
  return {
    hasBotToken: token.length > 0,
    botTokenHint: maskToken(token),
    chatId: row.chat_id,
    channelLink: row.channel_link,
    newsChannelLink: row.news_channel_link,
    whatsappChannelLink: row.whatsapp_channel_link,
    maxPostsPerDay: Number(row.max_posts_per_day),
    windowStartHour: Number(row.window_start_hour),
    windowEndHour: Number(row.window_end_hour),
    timezone: row.timezone,
    minGapMinutes: Number(row.min_gap_minutes),
  };
}

function parseUrls(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function toQueueItem(row: QueueRow): QueueItem {
  return {
    id: Number(row.id),
    animeName: row.anime_name,
    titleRomaji: row.title_romaji,
    titleEnglish: row.title_english,
    titleNative: row.title_native,
    yearLabel: row.year_label,
    episodesLabel: row.episodes_label,
    genresLabel: row.genres_label,
    inviteLink: row.invite_link,
    imageUrl: row.image_url,
    imageUrls: parseUrls(row.image_urls),
    caption: row.caption,
    threadsText: row.threads_text,
    status: row.status as QueueStatus,
    sortOrder: Number(row.sort_order),
    errorMessage: row.error_message,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    updatedAt: iso(row.updated_at) ?? new Date().toISOString(),
    postedAt: iso(row.posted_at),
  };
}

export function toSlot(row: SlotRow): DaySlot {
  return {
    id: Number(row.id),
    dayKey: row.day_key,
    slotIndex: Number(row.slot_index),
    fireAt: iso(row.fire_at) ?? new Date().toISOString(),
    queueItemId: row.queue_item_id == null ? null : Number(row.queue_item_id),
    status: row.status as SlotStatus,
    animeName: row.anime_name ?? null,
  };
}

export function toHistory(row: HistoryRow): HistoryItem {
  return {
    id: Number(row.id),
    queueItemId: row.queue_item_id == null ? null : Number(row.queue_item_id),
    animeName: row.anime_name,
    imageUrl: row.image_url,
    caption: row.caption,
    postedAt: iso(row.posted_at) ?? new Date().toISOString(),
    source: row.source as PostSource,
    telegramOk: Boolean(row.telegram_ok),
    telegramError: row.telegram_error,
  };
}
