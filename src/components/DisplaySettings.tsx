import { MonitorCog } from "lucide-react";
import { ImageDropField } from "./ImageDropField";
import type { ShowroomSettings } from "../types/settings";

type DisplaySettingsProps = {
  settings: ShowroomSettings;
  onChange: (settings: Partial<ShowroomSettings>) => void;
  saving?: boolean;
  saveStatus?: string;
  error?: string;
};

export function DisplaySettings({ settings, onChange, saving = false, saveStatus = "", error = "" }: DisplaySettingsProps) {
  const visibleSaveStatus = error ? `Save failed: ${error}` : saveStatus || (saving ? "Saving..." : "Settings save automatically.");

  const updateLabel = (field: keyof ShowroomSettings["labels"], value: string) => {
    onChange({
      labels: {
        ...settings.labels,
        [field]: value,
      },
    });
  };

  return (
    <section className="admin-panel">
      <div className="panel-heading">
        <div>
          <p>Showroom display</p>
          <h2>Settings</h2>
        </div>
        <MonitorCog aria-hidden="true" />
      </div>

      <div className="settings-grid">
        <label className="wide">
          Page title
          <span>Shown in the display header and browser tab.</span>
          <input
            value={settings.pageTitle}
            onChange={(event) => onChange({ pageTitle: event.target.value })}
            placeholder="Showroom Products"
          />
        </label>

        <label>
          Default media mode
          <select
            value={settings.defaultMediaMode}
            onChange={(event) => onChange({ defaultMediaMode: event.target.value as ShowroomSettings["defaultMediaMode"] })}
          >
            <option value="model-first">3D first</option>
            <option value="image-first">Image first</option>
          </select>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.autoRotateEnabled}
            onChange={(event) => onChange({ autoRotateEnabled: event.target.checked })}
          />
          <span>Auto-rotate 3D models</span>
        </label>

        <label>
          Rotation speed
          <span>Degrees per second for model_url files.</span>
          <input
            type="number"
            min="0"
            max="180"
            step="5"
            value={settings.autoRotateSpeed}
            onChange={(event) => onChange({ autoRotateSpeed: Number(event.target.value) })}
          />
        </label>

        <label>
          Model brightness / exposure
          <span>Higher values brighten model_url lighting.</span>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={settings.exposure}
            onChange={(event) => onChange({ exposure: Number(event.target.value) })}
          />
          <strong>{settings.exposure.toFixed(1)}</strong>
        </label>

        <label>
          Shadow strength
          <span>0 removes shadows, 1 makes them strongest.</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.shadowIntensity}
            onChange={(event) => onChange({ shadowIntensity: Number(event.target.value) })}
          />
          <strong>{settings.shadowIntensity.toFixed(2)}</strong>
        </label>

        <label>
          Camera zoom
          <span>Lower is closer, higher is pulled back.</span>
          <input
            type="range"
            min="45"
            max="180"
            step="5"
            value={settings.defaultZoom}
            onChange={(event) => onChange({ defaultZoom: Number(event.target.value) })}
          />
          <strong>{settings.defaultZoom}%</strong>
        </label>

        <label>
          Field of view
          <span>Use values like 25deg, 30deg, or 45deg.</span>
          <input
            value={settings.fieldOfView}
            onChange={(event) => onChange({ fieldOfView: event.target.value })}
            placeholder="30deg"
          />
        </label>

        <label>
          Model media background
          <span>Applies behind model_url and embed frames.</span>
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(event) => onChange({ backgroundColor: event.target.value })}
          />
        </label>

        <label>
          Page background
          <input
            type="color"
            value={settings.pageBackgroundColor}
            onChange={(event) => onChange({ pageBackgroundColor: event.target.value })}
          />
        </label>

        <label>
          Header background
          <input
            type="color"
            value={settings.headerBackgroundColor}
            onChange={(event) => onChange({ headerBackgroundColor: event.target.value })}
          />
        </label>

        <label>
          Card background
          <input
            type="color"
            value={settings.cardBackgroundColor}
            onChange={(event) => onChange({ cardBackgroundColor: event.target.value })}
          />
        </label>

        <label>
          Text color
          <input
            type="color"
            value={settings.textColor}
            onChange={(event) => onChange({ textColor: event.target.value })}
          />
        </label>

        <label>
          Muted text color
          <input
            type="color"
            value={settings.mutedTextColor}
            onChange={(event) => onChange({ mutedTextColor: event.target.value })}
          />
        </label>

        <label>
          Accent color
          <input
            type="color"
            value={settings.accentColor}
            onChange={(event) => onChange({ accentColor: event.target.value })}
          />
        </label>

        <label>
          Border color
          <input
            type="color"
            value={settings.borderColor}
            onChange={(event) => onChange({ borderColor: event.target.value })}
          />
        </label>

        <ImageDropField
          className="wide"
          label="Page background image / GIF"
          description="Optional background image for the whole display page."
          value={settings.pageBackgroundImageUrl}
          onChange={(value) => onChange({ pageBackgroundImageUrl: value })}
          placeholder="https://example.com/page-background.jpg"
        />

        <ImageDropField
          className="wide"
          label="Header background image / GIF"
          description="Optional background image behind the display header."
          value={settings.headerBackgroundImageUrl}
          onChange={(value) => onChange({ headerBackgroundImageUrl: value })}
          placeholder="https://example.com/header-background.jpg"
        />

        <ImageDropField
          className="wide"
          label="Default node background image / GIF"
          description="Used behind nodes that do not have their own background image."
          value={settings.cardBackgroundImageUrl}
          onChange={(value) => onChange({ cardBackgroundImageUrl: value })}
          placeholder="https://example.com/node-background.jpg"
        />

        <label>
          Default camera orbit
          <span>Advanced model-viewer orbit, for example 0deg 75deg 105%.</span>
          <input
            value={settings.cameraOrbit}
            onChange={(event) => onChange({ cameraOrbit: event.target.value })}
            placeholder="0deg 75deg 105%"
          />
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.showPosterImageBeforeLoad}
            onChange={(event) => onChange({ showPosterImageBeforeLoad: event.target.checked })}
          />
          <span>Show poster image before 3D load</span>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.fallbackToImageOnModelError}
            onChange={(event) => onChange({ fallbackToImageOnModelError: event.target.checked })}
          />
          <span>Fallback to image on 3D error</span>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.showQrCodes}
            onChange={(event) => onChange({ showQrCodes: event.target.checked })}
          />
          <span>Show product QR codes</span>
        </label>

        <label>
          Auto-scroll speed
          <span>Fine tune the display crawl speed from very slow to fast.</span>
          <input
            type="range"
            min="0.25"
            max="6"
            step="0.25"
            value={settings.autoScrollSpeed}
            onChange={(event) => onChange({ autoScrollSpeed: Number(event.target.value) })}
          />
          <strong>{Number(settings.autoScrollSpeed || 1).toFixed(2)}x</strong>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.autoScrollEnabled}
            onChange={(event) => onChange({ autoScrollEnabled: event.target.checked })}
          />
          <span>Enable auto-scroll</span>
        </label>

        <label>
          Auto-scroll reset delay
          <span>Milliseconds to pause at the bottom before returning to the top.</span>
          <input
            type="number"
            min="0"
            max="10000"
            step="100"
            value={settings.autoScrollResetDelay}
            onChange={(event) => onChange({ autoScrollResetDelay: Number(event.target.value) })}
          />
        </label>

        <label>
          Display theme
          <select
            value={settings.displayTheme}
            onChange={(event) => onChange({ displayTheme: event.target.value as ShowroomSettings["displayTheme"] })}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>

        <label>
          Time format
          <select
            value={settings.timeFormat}
            onChange={(event) => onChange({ timeFormat: event.target.value as ShowroomSettings["timeFormat"] })}
          >
            <option value="12h">12-hour</option>
            <option value="24h">24-hour</option>
          </select>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.weatherEnabled}
            onChange={(event) => onChange({ weatherEnabled: event.target.checked })}
          />
          <span>Show weather widget</span>
        </label>

        <label>
          Weather Widget Size
          <span>Controls how much room the weather/time node uses on the display.</span>
          <select
            value={settings.weatherWidgetSize}
            onChange={(event) => onChange({ weatherWidgetSize: event.target.value as ShowroomSettings["weatherWidgetSize"] })}
          >
            <option value="hidden">Hidden</option>
            <option value="compact">Compact</option>
            <option value="half">Half</option>
            <option value="full">Full</option>
          </select>
        </label>

        <label>
          Showroom location
          <input
            value={settings.locationName}
            onChange={(event) => onChange({ locationName: event.target.value })}
            placeholder="460A Pool Showroom"
          />
        </label>

        <label>
          Latitude
          <input
            value={settings.latitude}
            onChange={(event) => onChange({ latitude: event.target.value })}
            inputMode="decimal"
            placeholder="40.7128"
          />
        </label>

        <label>
          Longitude
          <input
            value={settings.longitude}
            onChange={(event) => onChange({ longitude: event.target.value })}
            inputMode="decimal"
            placeholder="-74.0060"
          />
        </label>

        <ImageDropField
          className="wide"
          label="Logo image / GIF"
          description="Optional image for the display header logo."
          value={settings.logoUrl}
          onChange={(value) => onChange({ logoUrl: value })}
          placeholder="https://example.com/logo.png"
        />

        <ImageDropField
          className="wide"
          label="Banner image / GIF"
          description="Optional wide image for the display header banner."
          value={settings.bannerUrl}
          onChange={(value) => onChange({ bannerUrl: value })}
          placeholder="https://example.com/banner.jpg"
        />

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.musicEnabled}
            onChange={(event) => onChange({ musicEnabled: event.target.checked })}
          />
          <span>Show music player</span>
        </label>

        <label>
          Music source
          <select
            value={settings.musicMode}
            onChange={(event) => onChange({ musicMode: event.target.value as ShowroomSettings["musicMode"] })}
          >
            <option value="local">MP3 / MP4 URLs</option>
            <option value="spotify">Spotify embed</option>
          </select>
        </label>

        <label>
          Music placement
          <select
            value={settings.musicPlacement}
            onChange={(event) => onChange({ musicPlacement: event.target.value as ShowroomSettings["musicPlacement"] })}
          >
            <option value="weather">Weather node empty space</option>
            <option value="header">Under display header</option>
          </select>
        </label>

        <label className="wide">
          Music player title
          <input
            value={settings.musicTitle}
            onChange={(event) => onChange({ musicTitle: event.target.value })}
            placeholder="Showroom Music"
          />
        </label>

        <label className="wide">
          MP3 / MP4 file URLs
          <span>One URL per line. Use files in public/music, Supabase Storage public URLs, or any direct media URL.</span>
          <textarea
            value={settings.musicUrls.join("\n")}
            onChange={(event) =>
              onChange({
                musicUrls: event.target.value
                  .split(/\r?\n|,/)
                  .map((url) => url.trim())
                  .filter(Boolean),
              })
            }
            placeholder={"/music/song-one.mp3\n/music/promo-audio.mp4"}
          />
        </label>

        <label className="wide">
          Spotify embed or playlist URL
          <span>Paste a Spotify playlist, album, artist, track, or embed URL.</span>
          <input
            value={settings.musicSpotifyEmbedUrl}
            onChange={(event) => onChange({ musicSpotifyEmbedUrl: event.target.value })}
            placeholder="https://open.spotify.com/playlist/..."
          />
        </label>

        <label>
          Music volume
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.musicVolume}
            onChange={(event) => onChange({ musicVolume: Number(event.target.value) })}
          />
          <strong>{Math.round(settings.musicVolume * 100)}%</strong>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.musicAutoplay}
            onChange={(event) => onChange({ musicAutoplay: event.target.checked })}
          />
          <span>Try autoplay</span>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.musicLoop}
            onChange={(event) => onChange({ musicLoop: event.target.checked })}
          />
          <span>Loop playlist</span>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.musicShuffle}
            onChange={(event) => onChange({ musicShuffle: event.target.checked })}
          />
          <span>Shuffle playlist</span>
        </label>
      </div>

      <div className="display-copy-editor">
        <div className="section-heading-row">
          <div>
            <p>Display text</p>
            <h3>Copy Labels</h3>
          </div>
        </div>

        <div className="settings-grid">
          <label>
            Header label
            <input value={settings.labels.headerLabel} onChange={(event) => updateLabel("headerLabel", event.target.value)} />
          </label>

          <label>
            Brand mark
            <input value={settings.labels.brandMark} onChange={(event) => updateLabel("brandMark", event.target.value)} />
          </label>

          <label>
            Admin link
            <input value={settings.labels.adminLink} onChange={(event) => updateLabel("adminLink", event.target.value)} />
          </label>

          <label>
            Pause button
            <input value={settings.labels.pauseButton} onChange={(event) => updateLabel("pauseButton", event.target.value)} />
          </label>

          <label>
            Resume button
            <input value={settings.labels.resumeButton} onChange={(event) => updateLabel("resumeButton", event.target.value)} />
          </label>

          <label>
            All categories
            <input value={settings.labels.allCategories} onChange={(event) => updateLabel("allCategories", event.target.value)} />
          </label>

          <label>
            Slow speed
            <input value={settings.labels.slowSpeed} onChange={(event) => updateLabel("slowSpeed", event.target.value)} />
          </label>

          <label>
            Normal speed
            <input value={settings.labels.normalSpeed} onChange={(event) => updateLabel("normalSpeed", event.target.value)} />
          </label>

          <label>
            Fast speed
            <input value={settings.labels.fastSpeed} onChange={(event) => updateLabel("fastSpeed", event.target.value)} />
          </label>

          <label>
            Very fast speed
            <input value={settings.labels.veryFastSpeed} onChange={(event) => updateLabel("veryFastSpeed", event.target.value)} />
          </label>

          <label className="wide">
            Loading message
            <input value={settings.labels.loadingNodes} onChange={(event) => updateLabel("loadingNodes", event.target.value)} />
          </label>

          <label className="wide">
            Empty message
            <input value={settings.labels.emptyNodes} onChange={(event) => updateLabel("emptyNodes", event.target.value)} />
          </label>

          <label>
            Product link
            <input value={settings.labels.productLink} onChange={(event) => updateLabel("productLink", event.target.value)} />
          </label>

          <label>
            QR caption
            <input value={settings.labels.qrCaption} onChange={(event) => updateLabel("qrCaption", event.target.value)} />
          </label>

          <label>
            Featured badge
            <input value={settings.labels.featuredBadge} onChange={(event) => updateLabel("featuredBadge", event.target.value)} />
          </label>

          <label>
            Price fallback
            <input value={settings.labels.priceFallback} onChange={(event) => updateLabel("priceFallback", event.target.value)} />
          </label>

          <label>
            Image fallback
            <input value={settings.labels.imageFallback} onChange={(event) => updateLabel("imageFallback", event.target.value)} />
          </label>

          <label>
            Video fallback
            <input value={settings.labels.videoFallback} onChange={(event) => updateLabel("videoFallback", event.target.value)} />
          </label>

          <label>
            Model badge
            <input value={settings.labels.modelBadge} onChange={(event) => updateLabel("modelBadge", event.target.value)} />
          </label>

          <label className="wide">
            Music empty message
            <input value={settings.labels.musicEmpty} onChange={(event) => updateLabel("musicEmpty", event.target.value)} />
          </label>

          <label className="wide">
            Music blocked message
            <input value={settings.labels.musicBlocked} onChange={(event) => updateLabel("musicBlocked", event.target.value)} />
          </label>

          <label>
            Music play
            <input value={settings.labels.musicPlay} onChange={(event) => updateLabel("musicPlay", event.target.value)} />
          </label>

          <label>
            Music pause
            <input value={settings.labels.musicPause} onChange={(event) => updateLabel("musicPause", event.target.value)} />
          </label>

          <label>
            Music previous
            <input value={settings.labels.musicPrevious} onChange={(event) => updateLabel("musicPrevious", event.target.value)} />
          </label>

          <label>
            Music next
            <input value={settings.labels.musicNext} onChange={(event) => updateLabel("musicNext", event.target.value)} />
          </label>
        </div>
      </div>

      <p className={error ? "form-error" : "save-status"}>{visibleSaveStatus}</p>
    </section>
  );
}
