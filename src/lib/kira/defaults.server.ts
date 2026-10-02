/** Server-only fallbacks. Token comes from env, never committed. */

export const DEFAULT_CHAT_ID = "@YggdrasilAnimes";
export const DEFAULT_CHANNEL_LINK = "https://t.me/YggdrasilAnimes";
export const DEFAULT_NEWS_LINK = "https://t.me/YggdrasilNoticias";
export const DEFAULT_WHATSAPP_LINK =
  "https://whatsapp.com/channel/0029Vb5uXjA3AzNJGxm09l05";

export const FALLBACK_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ?? "";
