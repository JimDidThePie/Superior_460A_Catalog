export const DISPLAY_NODE_TYPES = [
  "product",
  "business_card",
  "image",
  "video",
  "advertisement",
  "text",
  "section_header",
  "banner",
  "weather_time",
  "spacer",
] as const;

export type DisplayNodeType = (typeof DISPLAY_NODE_TYPES)[number];

export type DisplayNodeSettings = Record<string, unknown>;

export type DisplayNode = {
  id: string;
  type: DisplayNodeType;
  title: string;
  subtitle: string;
  body: string;
  category: string;
  price: string;
  specs: string[];
  imageUrl: string;
  videoUrl: string;
  modelUrl: string;
  modelEmbedUrl: string;
  linkUrl: string;
  buttonLabel: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  template: string;
  hidden: boolean;
  featured: boolean;
  sortOrder: number;
  settings: DisplayNodeSettings;
  createdAt?: string;
  updatedAt?: string;
};

export type DisplayNodeInput = Omit<DisplayNode, "id" | "createdAt" | "updatedAt">;

export type DisplayNodeRow = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  category: string | null;
  price: string | null;
  specs: string[] | null;
  image_url: string | null;
  video_url: string | null;
  model_url: string | null;
  model_embed_url: string | null;
  link_url: string | null;
  button_label: string | null;
  accent_color: string | null;
  background_color: string | null;
  text_color: string | null;
  template: string | null;
  hidden: boolean | null;
  featured: boolean | null;
  sort_order: number | null;
  settings: DisplayNodeSettings | null;
  created_at?: string;
  updated_at?: string;
};

export const DISPLAY_NODE_TYPE_LABELS: Record<DisplayNodeType, string> = {
  product: "Product",
  business_card: "Business Card",
  image: "Image",
  video: "Video",
  advertisement: "Advertisement",
  text: "Text",
  section_header: "Section Header",
  banner: "Banner",
  weather_time: "Weather + Time",
  spacer: "Spacer",
};
