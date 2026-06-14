import { DEFAULT_DISPLAY_LABELS, DEFAULT_SHOWROOM_SETTINGS, type DisplayLabels, type ShowroomSettings } from "../types/settings";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

const STORAGE_KEY = "showroom-settings-v1";
const FALLBACK_MODE_KEY = "showroom-settings-local-fallback-v1";
const CHANNEL_NAME = "showroom-settings";
const SETTINGS_ID = "default";
let useLocalSettingsFallback = false;

const SETTINGS_LOG_PREFIX = "[showroom-settings]";

const logSettings = (message: string, detail?: unknown) => {
  if (detail === undefined) {
    console.log(`${SETTINGS_LOG_PREFIX} ${message}`);
    return;
  }

  console.log(`${SETTINGS_LOG_PREFIX} ${message}`, detail);
};

const normalizeBusinessCards = (cards: unknown) => {
  if (!Array.isArray(cards)) {
    return DEFAULT_SHOWROOM_SETTINGS.businessCards;
  }

  return cards.map((card, index) => {
    const item =
      card && typeof card === "object"
        ? (card as Partial<ShowroomSettings["businessCards"][number]>)
        : {};

    return {
      id: item.id || `business-card-${index + 1}`,
      name: item.name || "",
      role: item.role || "",
      phone: item.phone || "",
      email: item.email || "",
      website: item.website || "",
      note: item.note || "",
      imageUrl: item.imageUrl || "",
      accentColor: item.accentColor || "#55d6c2",
      hidden: item.hidden ?? false,
    };
  });
};

const normalizeLabels = (labels: unknown): DisplayLabels => {
  if (!labels || typeof labels !== "object" || Array.isArray(labels)) {
    return DEFAULT_DISPLAY_LABELS;
  }

  const partialLabels = labels as Partial<DisplayLabels>;

  return {
    ...DEFAULT_DISPLAY_LABELS,
    ...partialLabels,
  };
};

const normalizeMusicUrls = (urls: unknown) => {
  if (Array.isArray(urls)) {
    return urls.map((url) => String(url).trim()).filter(Boolean);
  }

  if (typeof urls === "string") {
    return urls
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return DEFAULT_SHOWROOM_SETTINGS.musicUrls;
};

const normalizeVolume = (volume: unknown) => {
  const value = Number(volume);

  if (!Number.isFinite(value)) {
    return DEFAULT_SHOWROOM_SETTINGS.musicVolume;
  }

  return Math.min(Math.max(value, 0), 1);
};

const normalizeColor = (color: unknown, fallback: string) => {
  if (typeof color !== "string") {
    return fallback;
  }

  const trimmedColor = color.trim();
  const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(trimmedColor);

  if (shortHexMatch) {
    return `#${shortHexMatch[1]
      .split("")
      .map((character) => `${character}${character}`)
      .join("")}`;
  }

  if (/^#[0-9a-f]{6}$/i.test(trimmedColor)) {
    return trimmedColor;
  }

  return fallback;
};

export const normalizeSettings = (settings?: Partial<ShowroomSettings> | null): ShowroomSettings => ({
  ...DEFAULT_SHOWROOM_SETTINGS,
  ...settings,
  id: "default",
  pageTitle: settings?.pageTitle ?? DEFAULT_SHOWROOM_SETTINGS.pageTitle,
  defaultMediaMode: settings?.defaultMediaMode === "image-first" ? "image-first" : "model-first",
  autoRotateEnabled: settings?.autoRotateEnabled ?? DEFAULT_SHOWROOM_SETTINGS.autoRotateEnabled,
  autoRotateSpeed: Number.isFinite(Number(settings?.autoRotateSpeed))
    ? Number(settings?.autoRotateSpeed)
    : DEFAULT_SHOWROOM_SETTINGS.autoRotateSpeed,
  cameraOrbit: settings?.cameraOrbit ?? DEFAULT_SHOWROOM_SETTINGS.cameraOrbit,
  fieldOfView: settings?.fieldOfView ?? DEFAULT_SHOWROOM_SETTINGS.fieldOfView,
  exposure: Number.isFinite(Number(settings?.exposure))
    ? Number(settings?.exposure)
    : DEFAULT_SHOWROOM_SETTINGS.exposure,
  shadowIntensity: Number.isFinite(Number(settings?.shadowIntensity))
    ? Number(settings?.shadowIntensity)
    : DEFAULT_SHOWROOM_SETTINGS.shadowIntensity,
  backgroundColor: normalizeColor(settings?.backgroundColor, DEFAULT_SHOWROOM_SETTINGS.backgroundColor),
  defaultZoom: Number.isFinite(Number(settings?.defaultZoom))
    ? Number(settings?.defaultZoom)
    : DEFAULT_SHOWROOM_SETTINGS.defaultZoom,
  showPosterImageBeforeLoad:
    settings?.showPosterImageBeforeLoad ?? DEFAULT_SHOWROOM_SETTINGS.showPosterImageBeforeLoad,
  fallbackToImageOnModelError:
    settings?.fallbackToImageOnModelError ?? DEFAULT_SHOWROOM_SETTINGS.fallbackToImageOnModelError,
  showQrCodes: settings?.showQrCodes ?? DEFAULT_SHOWROOM_SETTINGS.showQrCodes,
  weatherEnabled: settings?.weatherEnabled ?? DEFAULT_SHOWROOM_SETTINGS.weatherEnabled,
  timeFormat: settings?.timeFormat === "24h" ? "24h" : "12h",
  displayTheme: settings?.displayTheme === "light" ? "light" : "dark",
  autoScrollEnabled: settings?.autoScrollEnabled ?? DEFAULT_SHOWROOM_SETTINGS.autoScrollEnabled,
  autoScrollSpeed: Number.isFinite(Number(settings?.autoScrollSpeed))
    ? Number(settings?.autoScrollSpeed)
    : DEFAULT_SHOWROOM_SETTINGS.autoScrollSpeed,
  autoScrollResetDelay: Number.isFinite(Number(settings?.autoScrollResetDelay))
    ? Number(settings?.autoScrollResetDelay)
    : DEFAULT_SHOWROOM_SETTINGS.autoScrollResetDelay,
  latitude: settings?.latitude ?? DEFAULT_SHOWROOM_SETTINGS.latitude,
  longitude: settings?.longitude ?? DEFAULT_SHOWROOM_SETTINGS.longitude,
  locationName: settings?.locationName ?? DEFAULT_SHOWROOM_SETTINGS.locationName,
  logoUrl: settings?.logoUrl ?? "",
  bannerUrl: settings?.bannerUrl ?? "",
  pageBackgroundImageUrl: settings?.pageBackgroundImageUrl ?? "",
  headerBackgroundImageUrl: settings?.headerBackgroundImageUrl ?? "",
  cardBackgroundImageUrl: settings?.cardBackgroundImageUrl ?? "",
  musicEnabled: settings?.musicEnabled ?? DEFAULT_SHOWROOM_SETTINGS.musicEnabled,
  musicMode: settings?.musicMode === "spotify" ? "spotify" : "local",
  musicPlacement: settings?.musicPlacement === "header" ? "header" : "weather",
  musicTitle: settings?.musicTitle ?? DEFAULT_SHOWROOM_SETTINGS.musicTitle,
  musicUrls: normalizeMusicUrls(settings?.musicUrls),
  musicSpotifyEmbedUrl: settings?.musicSpotifyEmbedUrl ?? "",
  musicAutoplay: settings?.musicAutoplay ?? DEFAULT_SHOWROOM_SETTINGS.musicAutoplay,
  musicLoop: settings?.musicLoop ?? DEFAULT_SHOWROOM_SETTINGS.musicLoop,
  musicShuffle: settings?.musicShuffle ?? DEFAULT_SHOWROOM_SETTINGS.musicShuffle,
  musicVolume: normalizeVolume(settings?.musicVolume),
  pageBackgroundColor: normalizeColor(settings?.pageBackgroundColor, DEFAULT_SHOWROOM_SETTINGS.pageBackgroundColor),
  headerBackgroundColor: normalizeColor(settings?.headerBackgroundColor, DEFAULT_SHOWROOM_SETTINGS.headerBackgroundColor),
  cardBackgroundColor: normalizeColor(settings?.cardBackgroundColor, DEFAULT_SHOWROOM_SETTINGS.cardBackgroundColor),
  textColor: normalizeColor(settings?.textColor, DEFAULT_SHOWROOM_SETTINGS.textColor),
  mutedTextColor: normalizeColor(settings?.mutedTextColor, DEFAULT_SHOWROOM_SETTINGS.mutedTextColor),
  accentColor: normalizeColor(settings?.accentColor, DEFAULT_SHOWROOM_SETTINGS.accentColor),
  borderColor: normalizeColor(settings?.borderColor, DEFAULT_SHOWROOM_SETTINGS.borderColor),
  labels: normalizeLabels(settings?.labels),
  businessCards: normalizeBusinessCards(settings?.businessCards),
});

const getLocalSettings = () => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SHOWROOM_SETTINGS));
    return DEFAULT_SHOWROOM_SETTINGS;
  }

  try {
    return normalizeSettings(JSON.parse(saved) as Partial<ShowroomSettings>);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SHOWROOM_SETTINGS));
    return DEFAULT_SHOWROOM_SETTINGS;
  }
};

const saveLocalSettings = (settings: ShowroomSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(settings);
    channel.close();
  }
};

const isLocalSettingsFallbackEnabled = () => {
  if (useLocalSettingsFallback) {
    return true;
  }

  try {
    return localStorage.getItem(FALLBACK_MODE_KEY) === "true";
  } catch {
    return false;
  }
};

const enableLocalSettingsFallback = (reason: string) => {
  useLocalSettingsFallback = true;

  try {
    localStorage.setItem(FALLBACK_MODE_KEY, "true");
  } catch {
    // localStorage can be unavailable in unusual browser privacy modes.
  }

  console.warn("Supabase settings write failed; using local showroom settings.", reason);
};

const clearLocalSettingsFallback = () => {
  useLocalSettingsFallback = false;

  try {
    localStorage.removeItem(FALLBACK_MODE_KEY);
  } catch {
    // localStorage can be unavailable in unusual browser privacy modes.
  }
};

const syncLocalSettingsToSupabase = async () => {
  if (!supabase) {
    return null;
  }

  const settings = getLocalSettings();
  const { data, error } = await supabase
    .from("showroom_settings")
    .upsert({ id: SETTINGS_ID, settings }, { onConflict: "id" })
    .select("settings")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  clearLocalSettingsFallback();
  return normalizeSettings((data?.settings as Partial<ShowroomSettings> | null) || settings);
};

export const getShowroomSettings = async (): Promise<ShowroomSettings> => {
  logSettings("settings load started", { source: isSupabaseConfigured ? "supabase" : "localStorage" });

  if (!isSupabaseConfigured || !supabase) {
    const localSettings = getLocalSettings();
    logSettings("settings load succeeded", { source: "localStorage" });
    return localSettings;
  }

  if (isLocalSettingsFallbackEnabled()) {
    try {
      const syncedSettings = await syncLocalSettingsToSupabase();
      if (syncedSettings) {
        logSettings("settings fallback sync succeeded", { source: "supabase" });
        return syncedSettings;
      }
    } catch (syncError) {
      console.warn("Supabase settings fallback sync failed.", (syncError as Error).message);
      const localSettings = getLocalSettings();
      logSettings("settings load succeeded", { source: "localStorage" });
      return localSettings;
    }
  }

  const { data, error } = await supabase
    .from("showroom_settings")
    .select("settings")
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (error) {
    console.warn("Supabase settings failed, using local defaults.", error.message);
    enableLocalSettingsFallback(error.message);
    const localSettings = getLocalSettings();
    logSettings("settings load failed; using localStorage fallback", error.message);
    return localSettings;
  }

  const loadedSettings = normalizeSettings((data?.settings as Partial<ShowroomSettings> | null) || DEFAULT_SHOWROOM_SETTINGS);
  logSettings("settings load succeeded", { source: "supabase", keys: Object.keys(loadedSettings) });
  return loadedSettings;
};

export const saveShowroomSettings = async (
  nextSettings: ShowroomSettings | Partial<ShowroomSettings>,
): Promise<ShowroomSettings> => {
  const settings = normalizeSettings(nextSettings);
  logSettings("settings save started", { source: isSupabaseConfigured ? "supabase" : "localStorage", id: SETTINGS_ID });

  if (!isSupabaseConfigured || !supabase) {
    saveLocalSettings(settings);
    logSettings("settings save succeeded", { source: "localStorage", id: SETTINGS_ID });
    return settings;
  }

  const { data, error } = await supabase
    .from("showroom_settings")
    .update({ settings })
    .eq("id", SETTINGS_ID)
    .select("settings")
    .maybeSingle();

  if (error) {
    logSettings("settings save failed", error.message);
    enableLocalSettingsFallback(error.message);
    saveLocalSettings(settings);
    logSettings("settings save succeeded", { source: "localStorage", id: SETTINGS_ID });
    return settings;
  }

  if (!data) {
    const { error: insertError } = await supabase
      .from("showroom_settings")
      .insert({ id: SETTINGS_ID, settings });

    if (insertError) {
      logSettings("settings save failed", insertError.message);
      enableLocalSettingsFallback(insertError.message);
      saveLocalSettings(settings);
      logSettings("settings save succeeded", { source: "localStorage", id: SETTINGS_ID });
      return settings;
    }
  }

  logSettings("settings save succeeded", { source: "supabase", id: SETTINGS_ID });
  clearLocalSettingsFallback();
  return normalizeSettings((data?.settings as Partial<ShowroomSettings> | null) || settings);
};

export const subscribeShowroomSettings = (onChange: (settings: ShowroomSettings) => void) => {
  const localChannel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;

  if (localChannel) {
    localChannel.onmessage = (event) => {
      console.log("Local showroom_settings change:", event.data);
      useLocalSettingsFallback = true;
      onChange(normalizeSettings(event.data as Partial<ShowroomSettings>));
    };
  }

  if (!isSupabaseConfigured || !supabase) {
    return () => {
      localChannel?.close();
    };
  }

  const client = supabase;
  const channel = client
    .channel("showroom_settings_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "showroom_settings" },
      (payload) => {
        console.log("Realtime showroom_settings change:", payload);
        clearLocalSettingsFallback();
        void getShowroomSettings()
          .then(onChange)
          .catch((error) => console.error("Realtime showroom_settings reload failed:", error));
      },
    )
    .subscribe((status, error) => {
      console.log("showroom_settings realtime status:", status, error || "");
    });

  return () => {
    localChannel?.close();
    void client.removeChannel(channel);
  };
};
