# Showroom Product Catalog

Web catalog for a showroom TV with a separate admin dashboard. It runs locally from a PC/mini PC, can be copied to a USB after building, and can optionally use Supabase for database, storage URLs, and real-time updates.

## Run Locally

```powershell
cd C:\Users\jorda\OneDrive\Documents\Jordan\showroom-catalog-new
npm install
npm run dev
```

Open:

- TV display: `http://localhost:5173/display`
- Admin dashboard: `http://localhost:5173/admin`
- Login: `http://localhost:5173/login`

Default admin password:

```text
admin123
```

Change it by copying `.env.example` to `.env` and setting `VITE_ADMIN_PASSWORD`.

You can also double-click `start-showroom.bat`. It installs dependencies the first time, opens the display page, and starts the local dev server.

## Build For Showroom / USB

```powershell
npm run build
```

Then run:

```text
start-showroom-usb.bat
```

That serves the built `dist` folder at:

```text
http://localhost:4173/display
```

For a TV, connect a mini PC or laptop by HDMI, open `/display`, and put the browser in full screen with `F11`.

## Product Media

Each product supports:

- `image_url`: jpg, jpeg, png, webp, svg
- `model_url`: glb, gltf, usdz
- `model_embed_url`: iframe/share embed links, including Kiri Engine embeds

If a product has both image and 3D media, the product card shows a `3D View` / `Image View` toggle. The global default is controlled in Admin > Display Settings.

Fallback behavior:

- 3D model or embed is shown first when the default is `3D first`
- if the 3D model fails, the image is shown
- if the image fails, the built-in placeholder is shown

## 3D Display Settings

Go to `/admin` and open Display Settings to adjust:

- auto-rotate on/off
- rotation speed
- model brightness/exposure
- shadow strength
- camera zoom
- field of view
- model background color
- default camera orbit
- poster image before load
- fallback to product image on model error
- default media mode: `3D first` or `Image first`

These settings apply to products using `model_url`. Embed links from `model_embed_url`, including Kiri Engine iframes, keep their own internal camera controls, but use the shared media frame background and fallback handling where the browser reports an iframe load error.

## Add A Product Image

Go to `/admin`, open the product form, and paste an image URL into `Image URL`.

You can also choose a local image file in the form. For a simple local/USB setup, that image is saved into browser storage as a data URL. For a larger catalog, upload images to Supabase Storage or your website/CDN and paste the public URL.

## Add A 3D Model

Paste a public `.glb`, `.gltf`, or `.usdz` URL into `3D Model URL`.

Best browser support is usually `.glb`. USDZ is mostly useful for Apple AR viewing.

## Add A Kiri Engine Embed

Copy the Kiri Engine share/embed link. Paste either the plain embed URL or the full iframe code into `3D Embed URL`.

The app will pull the iframe `src` automatically if you paste full iframe HTML.

## Weather And Time

Go to `/admin` and edit Display Settings:

- turn weather on/off
- set location name
- set latitude and longitude
- choose 12-hour or 24-hour time

Weather uses Open-Meteo and does not need an API key. If weather cannot load, the display still shows the current date and time.

## Page Title And Business Cards

Go to `/admin` and open Display Settings.

You can change:

- Page title shown in the browser tab
- Large display header title
- Business cards shown together on the TV display

Each business card supports:

- name
- role/title
- phone
- email
- website
- short note
- photo/logo URL
- accent color
- hide/show

The business-card display node appears on `/display` above the product list and can show several cards at once.

## Supabase Setup

The app works without Supabase using browser storage. To enable Supabase:

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Optional: run `supabase/seed.sql`.
4. Copy `.env.example` to `.env`.
5. Fill in:

```text
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_PASSWORD=your-admin-password
```

6. Restart the dev server.

The starter schema leaves row level security disabled so the local admin page works immediately with the anon key. If you deploy this publicly, enable Supabase Auth and add authenticated write policies.

## Customize Design

Most display styling is in:

```text
src/styles.css
```

The main display page is:

```text
src/pages/DisplayPage.tsx
```

Reusable display widgets live in:

```text
src/components/ProductMedia.tsx
src/components/WeatherTimeWidget.tsx
src/components/DisplaySettings.tsx
```

## Test Checklist

1. Run `npm install`.
2. Run `npm run dev`.
3. Open `/display`.
4. Open `/admin` in another tab.
5. Log in with the admin password.
6. Add/edit/hide/reorder a product.
7. Confirm the display tab updates.
8. Change display theme, scroll speed, media mode, logo/banner, and weather settings.
9. Run `npm run build`.
10. Run `start-showroom-usb.bat` and open `http://localhost:4173/display`.
