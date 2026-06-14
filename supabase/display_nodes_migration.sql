create extension if not exists "pgcrypto";

create table if not exists public.display_nodes (
  id text primary key default gen_random_uuid()::text,
  type text not null default 'text' check (
    type in (
      'product',
      'business_card',
      'image',
      'video',
      'advertisement',
      'text',
      'section_header',
      'banner',
      'weather_time',
      'spacer'
    )
  ),
  title text not null default '',
  subtitle text not null default '',
  body text not null default '',
  category text not null default '',
  price text not null default '',
  specs text[] not null default '{}',
  image_url text not null default '',
  video_url text not null default '',
  model_url text not null default '',
  model_embed_url text not null default '',
  link_url text not null default '',
  button_label text not null default '',
  accent_color text not null default '',
  background_color text not null default '',
  text_color text not null default '',
  template text not null default 'standard',
  hidden boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists display_nodes_set_updated_at on public.display_nodes;
create trigger display_nodes_set_updated_at
before update on public.display_nodes
for each row execute function public.set_updated_at();

insert into public.display_nodes (
  id,
  type,
  title,
  subtitle,
  body,
  category,
  accent_color,
  template,
  hidden,
  featured,
  sort_order,
  settings
) values
(
  'showroom-intro',
  'section_header',
  'Pool equipment, accessories, upgrades, and service-ready product details.',
  'Showroom board',
  'Browse featured equipment, helpful contacts, and showroom updates from one editable display.',
  '',
  '#55d6c2',
  'intro',
  false,
  true,
  1,
  '{}'::jsonb
),
(
  'weather-time',
  'weather_time',
  '',
  '',
  '',
  '',
  '',
  'compact',
  false,
  false,
  4,
  '{}'::jsonb
)
on conflict (id) do nothing;

insert into public.display_nodes (
  id,
  type,
  title,
  subtitle,
  body,
  category,
  price,
  specs,
  image_url,
  model_url,
  model_embed_url,
  link_url,
  button_label,
  accent_color,
  template,
  hidden,
  featured,
  sort_order,
  settings
)
select
  id,
  'product',
  name,
  '',
  description,
  category,
  price,
  specs,
  image_url,
  model_url,
  model_embed_url,
  product_url,
  '',
  case when featured then '#f4d35e' else '#55d6c2' end,
  case when featured then 'product-feature' else 'product-standard' end,
  hidden,
  featured,
  sort_order + 10,
  '{}'::jsonb
from public.products
on conflict (id) do nothing;

with cards as (
  select
    coalesce(card->>'id', 'business-card-' || ordinality::text) as card_id,
    card,
    ordinality
  from public.showroom_settings,
    jsonb_array_elements(coalesce(settings->'businessCards', '[]'::jsonb)) with ordinality as card_rows(card, ordinality)
  where id = 'default'
)
insert into public.display_nodes (
  id,
  type,
  title,
  subtitle,
  body,
  category,
  image_url,
  accent_color,
  template,
  hidden,
  featured,
  sort_order,
  settings
)
select
  card_id,
  'business_card',
  coalesce(card->>'name', ''),
  coalesce(card->>'role', ''),
  coalesce(card->>'note', ''),
  'Showroom Team',
  coalesce(card->>'imageUrl', ''),
  coalesce(card->>'accentColor', '#55d6c2'),
  'contact',
  coalesce((card->>'hidden')::boolean, false),
  false,
  ordinality::integer + 1,
  jsonb_build_object(
    'phone', coalesce(card->>'phone', ''),
    'email', coalesce(card->>'email', ''),
    'website', coalesce(card->>'website', '')
  )
from cards
on conflict (id) do nothing;

update public.showroom_settings
set settings = jsonb_set(
  '{
    "autoScrollEnabled": true,
    "autoScrollSpeed": 1,
    "autoScrollResetDelay": 1400,
    "showQrCodes": true,
    "musicEnabled": false,
    "musicMode": "local",
    "musicPlacement": "weather",
    "musicTitle": "Showroom Music",
    "musicUrls": [],
    "musicSpotifyEmbedUrl": "",
    "musicAutoplay": false,
    "musicLoop": true,
    "musicShuffle": false,
    "musicVolume": 0.55,
    "pageBackgroundColor": "#07131a",
    "headerBackgroundColor": "#07131a",
    "cardBackgroundColor": "#16262d",
    "pageBackgroundImageUrl": "",
    "headerBackgroundImageUrl": "",
    "cardBackgroundImageUrl": "",
    "textColor": "#f7fbfc",
    "mutedTextColor": "#b8d7dc",
    "accentColor": "#55d6c2",
    "borderColor": "#2a4650"
  }'::jsonb || settings,
  '{labels}',
  '{
    "headerLabel": "Pool Equipment Catalog",
    "brandMark": "460A",
    "adminLink": "Admin",
    "pauseButton": "Pause",
    "resumeButton": "Resume",
    "allCategories": "All",
    "slowSpeed": "Slow",
    "normalSpeed": "Normal",
    "fastSpeed": "Fast",
    "veryFastSpeed": "Very fast",
    "loadingNodes": "Loading display nodes...",
    "emptyNodes": "No visible display nodes yet. Add nodes in the admin dashboard.",
    "productLink": "Product Link",
    "qrCaption": "Scan for details",
    "featuredBadge": "Featured",
    "priceFallback": "Ask for price",
    "imageFallback": "Image coming soon",
    "videoFallback": "Video unavailable",
    "modelBadge": "3D",
    "musicPlay": "Play",
    "musicPause": "Pause",
    "musicNext": "Next",
    "musicPrevious": "Previous",
    "musicEmpty": "Add MP3 or MP4 URLs in admin settings",
    "musicBlocked": "Press play to start audio."
  }'::jsonb || coalesce(settings->'labels', '{}'::jsonb),
  true
)
where id = 'default';

do $$
begin
  alter publication supabase_realtime add table public.display_nodes;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- Supabase Auth + RLS policies live in supabase/auth_rls_policies.sql.
-- Run that file after this migration so /display is public read-only and /admin writes require login.
