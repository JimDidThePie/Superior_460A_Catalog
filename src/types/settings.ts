export type DefaultMediaMode = "model-first" | "image-first";
export type TimeFormat = "12h" | "24h";
export type DisplayTheme = "dark" | "light";
export type MusicMode = "local" | "spotify";
export type MusicPlacement = "header" | "weather";

export type DisplayLabels = {
  headerLabel: string;
  brandMark: string;
  adminLink: string;
  pauseButton: string;
  resumeButton: string;
  allCategories: string;
  slowSpeed: string;
  normalSpeed: string;
  fastSpeed: string;
  veryFastSpeed: string;
  loadingNodes: string;
  emptyNodes: string;
  productLink: string;
  qrCaption: string;
  featuredBadge: string;
  priceFallback: string;
  imageFallback: string;
  videoFallback: string;
  modelBadge: string;
  musicPlay: string;
  musicPause: string;
  musicNext: string;
  musicPrevious: string;
  musicEmpty: string;
  musicBlocked: string;
};

export type BusinessCard = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  website: string;
  note: string;
  imageUrl: string;
  accentColor: string;
  hidden: boolean;
};

export type ShowroomSettings = {
  id: "default";
  pageTitle: string;
  defaultMediaMode: DefaultMediaMode;
  autoRotateEnabled: boolean;
  autoRotateSpeed: number;
  cameraOrbit: string;
  fieldOfView: string;
  exposure: number;
  shadowIntensity: number;
  backgroundColor: string;
  defaultZoom: number;
  showPosterImageBeforeLoad: boolean;
  fallbackToImageOnModelError: boolean;
  showQrCodes: boolean;
  weatherEnabled: boolean;
  locationName: string;
  latitude: string;
  longitude: string;
  timeFormat: TimeFormat;
  autoScrollEnabled: boolean;
  autoScrollSpeed: number;
  autoScrollResetDelay: number;
  displayTheme: DisplayTheme;
  logoUrl: string;
  bannerUrl: string;
  pageBackgroundImageUrl: string;
  headerBackgroundImageUrl: string;
  cardBackgroundImageUrl: string;
  musicEnabled: boolean;
  musicMode: MusicMode;
  musicPlacement: MusicPlacement;
  musicTitle: string;
  musicUrls: string[];
  musicSpotifyEmbedUrl: string;
  musicAutoplay: boolean;
  musicLoop: boolean;
  musicShuffle: boolean;
  musicVolume: number;
  pageBackgroundColor: string;
  headerBackgroundColor: string;
  cardBackgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  borderColor: string;
  labels: DisplayLabels;
  businessCards: BusinessCard[];
};

export const DEFAULT_DISPLAY_LABELS: DisplayLabels = {
  headerLabel: "Pool Equipment Catalog",
  brandMark: "460A",
  adminLink: "Admin",
  pauseButton: "Pause",
  resumeButton: "Resume",
  allCategories: "All",
  slowSpeed: "Slow",
  normalSpeed: "Normal",
  fastSpeed: "Fast",
  veryFastSpeed: "Very fast",
  loadingNodes: "Loading display nodes...",
  emptyNodes: "No visible display nodes yet. Add nodes in the admin dashboard.",
  productLink: "Product Link",
  qrCaption: "Scan for details",
  featuredBadge: "Featured",
  priceFallback: "Ask for price",
  imageFallback: "Image coming soon",
  videoFallback: "Video unavailable",
  modelBadge: "3D",
  musicPlay: "Play",
  musicPause: "Pause",
  musicNext: "Next",
  musicPrevious: "Previous",
  musicEmpty: "Add MP3 or MP4 URLs in admin settings",
  musicBlocked: "Press play to start audio.",
};

export const DEFAULT_SHOWROOM_SETTINGS: ShowroomSettings = {
  id: "default",
  pageTitle: "Showroom Products",
  defaultMediaMode: "model-first",
  autoRotateEnabled: true,
  autoRotateSpeed: 30,
  cameraOrbit: "0deg 75deg 105%",
  fieldOfView: "30deg",
  exposure: 1,
  shadowIntensity: 0.7,
  backgroundColor: "#0b2229",
  defaultZoom: 105,
  showPosterImageBeforeLoad: true,
  fallbackToImageOnModelError: true,
  showQrCodes: true,
  weatherEnabled: true,
  locationName: "Showroom",
  latitude: "40.7128",
  longitude: "-74.0060",
  timeFormat: "12h",
  autoScrollEnabled: true,
  autoScrollSpeed: 1,
  autoScrollResetDelay: 1400,
  displayTheme: "dark",
  logoUrl: "",
  bannerUrl: "",
  pageBackgroundImageUrl: "",
  headerBackgroundImageUrl: "",
  cardBackgroundImageUrl: "",
  musicEnabled: false,
  musicMode: "local",
  musicPlacement: "weather",
  musicTitle: "Showroom Music",
  musicUrls: [],
  musicSpotifyEmbedUrl: "",
  musicAutoplay: false,
  musicLoop: true,
  musicShuffle: false,
  musicVolume: 0.55,
  pageBackgroundColor: "#07131a",
  headerBackgroundColor: "#07131a",
  cardBackgroundColor: "#16262d",
  textColor: "#f7fbfc",
  mutedTextColor: "#b8d7dc",
  accentColor: "#55d6c2",
  borderColor: "#2a4650",
  labels: DEFAULT_DISPLAY_LABELS,
  businessCards: [
    {
      id: "sales-desk",
      name: "Sales Desk",
      role: "Pool Equipment Specialist",
      phone: "(555) 010-460A",
      email: "sales@example.com",
      website: "example.com",
      note: "Scan a product QR code or ask us for a package quote.",
      imageUrl: "",
      accentColor: "#55d6c2",
      hidden: false,
    },
    {
      id: "service-team",
      name: "Service Team",
      role: "Installations & Support",
      phone: "(555) 011-460A",
      email: "service@example.com",
      website: "example.com/service",
      note: "Need help choosing the right replacement part?",
      imageUrl: "",
      accentColor: "#f4d35e",
      hidden: false,
    },
  ],
};
