insert into public.showroom_settings (id, settings)
values (
  'default',
  '{
    "pageBackgroundImageUrl": "",
    "headerBackgroundImageUrl": "",
    "cardBackgroundImageUrl": "",
    "musicPlacement": "weather"
  }'::jsonb
)
on conflict (id) do update
set settings = excluded.settings || coalesce(showroom_settings.settings, '{}'::jsonb);
