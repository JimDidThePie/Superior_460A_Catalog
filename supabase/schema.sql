create extension if not exists "pgcrypto";

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null default '',
  category text not null default '',
  description text not null default '',
  price text not null default '',
  specs text[] not null default '{}',
  image_url text not null default '',
  model_url text not null default '',
  model_embed_url text not null default '',
  product_url text not null default '',
  featured boolean not null default false,
  hidden boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.showroom_settings (
  id text primary key default 'default',
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

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists display_nodes_set_updated_at on public.display_nodes;
create trigger display_nodes_set_updated_at
before update on public.display_nodes
for each row execute function public.set_updated_at();

drop trigger if exists showroom_settings_set_updated_at on public.showroom_settings;
create trigger showroom_settings_set_updated_at
before update on public.showroom_settings
for each row execute function public.set_updated_at();

insert into public.showroom_settings (id, settings)
values (
  'default',
  '{
    "id": "default",
    "pageTitle": "Showroom Products",
    "defaultMediaMode": "model-first",
    "autoRotateEnabled": true,
    "autoRotateSpeed": 30,
    "cameraOrbit": "0deg 75deg 105%",
    "fieldOfView": "30deg",
    "exposure": 1,
    "shadowIntensity": 0.7,
    "backgroundColor": "#0b2229",
    "defaultZoom": 105,
    "showPosterImageBeforeLoad": true,
    "fallbackToImageOnModelError": true,
    "showQrCodes": true,
    "weatherEnabled": true,
    "locationName": "Showroom",
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "timeFormat": "12h",
    "autoScrollEnabled": true,
    "autoScrollSpeed": 1,
    "autoScrollResetDelay": 1400,
    "displayTheme": "dark",
    "logoUrl": "",
    "bannerUrl": "",
    "pageBackgroundImageUrl": "",
    "headerBackgroundImageUrl": "",
    "cardBackgroundImageUrl": "",
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
    "textColor": "#f7fbfc",
    "mutedTextColor": "#b8d7dc",
    "accentColor": "#55d6c2",
    "borderColor": "#2a4650",
    "labels": {
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
    },
    "businessCards": [
      {
        "id": "sales-desk",
        "name": "Sales Desk",
        "role": "Pool Equipment Specialist",
        "phone": "(555) 010-460A",
        "email": "sales@example.com",
        "website": "example.com",
        "note": "Scan a product QR code or ask us for a package quote.",
        "imageUrl": "",
        "accentColor": "#55d6c2",
        "hidden": false
      },
      {
        "id": "service-team",
        "name": "Service Team",
        "role": "Installations & Support",
        "phone": "(555) 011-460A",
        "email": "service@example.com",
        "website": "example.com/service",
        "note": "Need help choosing the right replacement part?",
        "imageUrl": "",
        "accentColor": "#f4d35e",
        "hidden": false
      }
    ]
  }'::jsonb
)
on conflict (id) do nothing;

do $$
begin
  alter publication supabase_realtime add table public.products;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.display_nodes;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.showroom_settings;
exception
  when duplicate_object then null;
end $$;

-- This starter keeps policies open so the local password-protected admin can work immediately.
-- For public internet deployment, enable Supabase Auth and replace these with authenticated write policies.
alter table public.products disable row level security;
alter table public.display_nodes disable row level security;
alter table public.showroom_settings disable row level security;
