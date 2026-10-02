-- Painel Kira: settings, posting queue, daily random slots, history.

create table if not exists kira_settings (
  id integer primary key default 1,
  bot_token text not null default '',
  chat_id text not null default '@YggdrasilAnimes',
  channel_link text not null default 'https://t.me/YggdrasilAnimes',
  news_channel_link text not null default 'https://t.me/YggdrasilNoticias',
  whatsapp_channel_link text not null default 'https://whatsapp.com/channel/0029Vb5uXjA3AzNJGxm09l05',
  max_posts_per_day integer not null default 2,
  window_start_hour integer not null default 9,
  window_end_hour integer not null default 22,
  timezone text not null default 'America/Sao_Paulo',
  min_gap_minutes integer not null default 180,
  updated_at timestamptz not null default now(),
  constraint kira_settings_singleton check (id = 1)
);

insert into kira_settings (id) values (1) on conflict (id) do nothing;

create table if not exists queue_items (
  id serial primary key,
  anime_name text not null,
  title_romaji text not null default '',
  title_english text not null default '',
  title_native text not null default '',
  year_label text not null default '',
  episodes_label text not null default '',
  genres_label text not null default '',
  invite_link text not null,
  image_url text not null,
  image_urls text not null default '[]',
  caption text not null,
  threads_text text not null default '',
  status text not null default 'queued',
  sort_order integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  posted_at timestamptz
);

create index if not exists queue_items_status_idx on queue_items (status, created_at);

create table if not exists daily_slots (
  id serial primary key,
  day_key text not null,
  slot_index integer not null,
  fire_at timestamptz not null,
  queue_item_id integer,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (day_key, slot_index)
);

create index if not exists daily_slots_day_idx on daily_slots (day_key, status);

create table if not exists post_history (
  id serial primary key,
  queue_item_id integer,
  anime_name text not null,
  image_url text not null,
  caption text not null,
  posted_at timestamptz not null default now(),
  source text not null,
  telegram_ok boolean not null default true,
  telegram_error text
);

create index if not exists post_history_posted_idx on post_history (posted_at desc);
