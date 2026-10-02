import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AnimeSearchResult, DashboardData, DispatchResult } from "./types";

const enqueueSchema = z.object({
  animeName: z.string().min(1),
  titleRomaji: z.string(),
  titleEnglish: z.string(),
  titleNative: z.string(),
  yearLabel: z.string(),
  episodesLabel: z.string(),
  genresLabel: z.string(),
  inviteLink: z.string().min(1),
  imageUrl: z.string().min(1),
  imageUrls: z.array(z.string()),
  caption: z.string().min(1),
  threadsText: z.string(),
});

const idSchema = z.object({ id: z.number().int().positive() });

const settingsSchema = z.object({
  botToken: z.string(),
  chatId: z.string().min(1),
  channelLink: z.string().min(1),
  newsChannelLink: z.string().min(1),
  whatsappChannelLink: z.string(),
  maxPostsPerDay: z.number().int().min(1).max(8),
  windowStartHour: z.number().int().min(0).max(23),
  windowEndHour: z.number().int().min(1).max(24),
  minGapMinutes: z.number().int().min(30).max(720),
});

export const getDashboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardData> => {
    const { readDashboard } = await import("./dispatch.server");
    return readDashboard();
  },
);

export const processQueue = createServerFn({ method: "POST" }).handler(
  async (): Promise<DispatchResult> => {
    const { runDispatcher } = await import("./dispatch.server");
    return runDispatcher();
  },
);

export const searchAnime = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({ query: z.string().min(1), inviteLink: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }): Promise<AnimeSearchResult> => {
    const { searchAnimeAction } = await import("./actions.server");
    return searchAnimeAction(data);
  });

export const enqueuePost = createServerFn({ method: "POST" })
  .validator((d) => enqueueSchema.parse(d))
  .handler(async ({ data }) => {
    const { enqueueAction } = await import("./actions.server");
    return enqueueAction(data);
  });

export const postNow = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        fromQueueId: z.number().int().positive().optional(),
        draft: enqueueSchema.optional(),
        force: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { postNowAction } = await import("./actions.server");
    return postNowAction(data);
  });

export const pauseQueueItem = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({ id: z.number().int().positive(), paused: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { pauseAction } = await import("./actions.server");
    return pauseAction(data.id, data.paused);
  });

export const removeQueueItem = createServerFn({ method: "POST" })
  .validator((d) => idSchema.parse(d))
  .handler(async ({ data }) => {
    const { removeAction } = await import("./actions.server");
    return removeAction(data.id);
  });

export const retryQueueItem = createServerFn({ method: "POST" })
  .validator((d) => idSchema.parse(d))
  .handler(async ({ data }) => {
    const { retryAction } = await import("./actions.server");
    return retryAction(data.id);
  });

export const saveSettings = createServerFn({ method: "POST" })
  .validator((d) => settingsSchema.parse(d))
  .handler(async ({ data }) => {
    const { saveSettingsAction } = await import("./actions.server");
    return saveSettingsAction(data);
  });
