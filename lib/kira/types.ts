export type QueueStatus = "queued" | "paused" | "posting" | "posted" | "failed";
export type SlotStatus = "pending" | "fired" | "skipped";
export type PostSource = "queue" | "manual";

export type PublicSettings = {
  hasBotToken: boolean;
  botTokenHint: string;
  chatId: string;
  channelLink: string;
  newsChannelLink: string;
  whatsappChannelLink: string;
  maxPostsPerDay: number;
  windowStartHour: number;
  windowEndHour: number;
  timezone: string;
  minGapMinutes: number;
};

export type QueueItem = {
  id: number;
  animeName: string;
  titleRomaji: string;
  titleEnglish: string;
  titleNative: string;
  yearLabel: string;
  episodesLabel: string;
  genresLabel: string;
  inviteLink: string;
  imageUrl: string;
  imageUrls: string[];
  caption: string;
  threadsText: string;
  status: QueueStatus;
  sortOrder: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  postedAt: string | null;
};

export type DaySlot = {
  id: number;
  dayKey: string;
  slotIndex: number;
  fireAt: string;
  queueItemId: number | null;
  status: SlotStatus;
  animeName: string | null;
};

export type HistoryItem = {
  id: number;
  queueItemId: number | null;
  animeName: string;
  imageUrl: string;
  caption: string;
  postedAt: string;
  source: PostSource;
  telegramOk: boolean;
  telegramError: string | null;
};

export type AnimeSearchResult = {
  titleRomaji: string;
  titleEnglish: string;
  titleNative: string;
  yearLabel: string;
  episodesLabel: string;
  genresLabel: string;
  genres: string[];
  studios: string[];
  startYear: number | null;
  imageUrls: string[];
  caption: string;
  threadsText: string;
};

export type DashboardData = {
  settings: PublicSettings;
  queue: QueueItem[];
  slots: DaySlot[];
  history: HistoryItem[];
  todayKey: string;
  postedToday: number;
  remainingToday: number;
  queuedCount: number;
  nextFireAt: string | null;
};

export type DispatchResult = {
  fired: number;
  remaining: number;
  messages: string[];
};

export type EnqueueInput = {
  animeName: string;
  titleRomaji: string;
  titleEnglish: string;
  titleNative: string;
  yearLabel: string;
  episodesLabel: string;
  genresLabel: string;
  inviteLink: string;
  imageUrl: string;
  imageUrls: string[];
  caption: string;
  threadsText: string;
};
