import { ExternalLink, Globe2, Image as ImageIcon, Mail, Megaphone, Phone, UserRound, Video } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { DisplayMusicPlayer } from "./DisplayMusicPlayer";
import { ProductMedia } from "./ProductMedia";
import { WeatherTimeWidget } from "./WeatherTimeWidget";
import type { DisplayNode } from "../types/displayNode";
import type { Product } from "../types/product";
import type { ShowroomSettings } from "../types/settings";

type DisplayNodeRendererProps = {
  node: DisplayNode;
  settings: ShowroomSettings;
};

const getText = (value: unknown) => (value === null || value === undefined ? "" : String(value).trim());

const getNodeSetting = (node: DisplayNode, key: string) => node.settings?.[key];

const getNodeSettingText = (node: DisplayNode, key: string) => getText(getNodeSetting(node, key));

const getNodeSettingBoolean = (node: DisplayNode, key: string) => {
  const value = getNodeSetting(node, key);

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
  }

  return Boolean(value);
};

const getNodeSettingNumber = (node: DisplayNode, key: string, fallback: number) => {
  const value = Number(getNodeSetting(node, key));
  return Number.isFinite(value) ? value : fallback;
};

const getNodeClassName = (node: DisplayNode, className: string) =>
  `${className} ${getNodeSettingBoolean(node, "locked") ? "display-node-locked" : ""}`.trim();

const getProductUrl = (node: DisplayNode) => {
  if (node.linkUrl) {
    return node.linkUrl;
  }

  if (typeof window === "undefined") {
    return `/product/${node.id}`;
  }

  return `${window.location.origin}/product/${node.id}`;
};

const toProduct = (node: DisplayNode): Product => ({
  id: node.id,
  name: node.title || "Untitled Product",
  category: node.category,
  description: node.body,
  price: node.price,
  specs: Array.isArray(node.specs) ? node.specs : [],
  imageUrl: node.imageUrl,
  modelUrl: node.modelUrl,
  modelEmbedUrl: node.modelEmbedUrl,
  productUrl: node.linkUrl,
  featured: node.featured,
  hidden: node.hidden,
  sortOrder: node.sortOrder,
});

const getCssUrl = (value: string) => (value ? `url("${value}")` : "");

const getNodeStyle = (node: DisplayNode, settings: ShowroomSettings) => {
  const nodeBackgroundImage = getNodeSettingText(node, "backgroundImageUrl");

  return {
    "--node-accent": node.accentColor || settings.accentColor,
    "--node-bg": node.backgroundColor || settings.cardBackgroundColor,
    "--node-bg-image": getCssUrl(nodeBackgroundImage) || "var(--display-card-bg-image, none)",
    "--node-text": node.textColor || settings.textColor,
    "--node-muted": settings.mutedTextColor,
    "--node-border": settings.borderColor,
  } as CSSProperties;
};

function ProductNode({ node, settings }: DisplayNodeRendererProps) {
  const product = toProduct(node);
  const productUrl = getProductUrl(node);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(productUrl)}`;
  const specs = Array.isArray(node.specs) ? node.specs : [];
  const showQrCode = settings.showQrCodes;

  return (
    <article
      id={`node-${node.id}`}
      className={getNodeClassName(
        node,
        `display-card display-node display-node-product ${node.featured ? "featured" : ""} ${showQrCode ? "" : "display-card-no-qr"}`,
      )}
      style={getNodeStyle(node, settings)}
    >
      <ProductMedia
        product={product}
        defaultMode={settings.defaultMediaMode}
        settings={settings}
        className="display-media"
        allowToggle={false}
        placeholderLabel={settings.labels.imageFallback}
        modelBadgeLabel={settings.labels.modelBadge}
      />

      <div className="display-card-copy">
        <div className="card-kicker">
          {node.category ? <span>{node.category}</span> : null}
          {node.featured ? <strong>{settings.labels.featuredBadge}</strong> : null}
        </div>
        <h2>{node.title}</h2>
        {node.body ? <p>{node.body}</p> : null}
        <div className="price-row">
          <strong>{node.price || settings.labels.priceFallback}</strong>
          <a href={productUrl} target="_blank" rel="noreferrer">
            {node.buttonLabel || settings.labels.productLink}
          </a>
        </div>
        {specs.length ? (
          <ul>
            {specs.slice(0, 5).map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {showQrCode ? (
        <div className="qr-panel">
          <img src={qrUrl} alt={`QR code for ${node.title}`} loading="lazy" />
          <span>{settings.labels.qrCaption}</span>
        </div>
      ) : null}
    </article>
  );
}

function BusinessCardNode({ node, settings }: DisplayNodeRendererProps) {
  const phone = getNodeSettingText(node, "phone");
  const email = getNodeSettingText(node, "email");
  const website = getNodeSettingText(node, "website");

  return (
    <article
      id={`node-${node.id}`}
      className={getNodeClassName(node, "business-card display-node display-node-business-card")}
      style={getNodeStyle(node, settings)}
    >
      <div className="business-card-photo">
        {node.imageUrl ? <img src={node.imageUrl} alt={node.title || settings.labels.headerLabel} loading="lazy" /> : <UserRound aria-hidden="true" />}
      </div>

      <div className="business-card-copy">
        <h3>{node.title}</h3>
        {node.subtitle ? <p>{node.subtitle}</p> : null}

        <div className="business-card-links">
          {phone ? (
            <span>
              <Phone aria-hidden="true" />
              {phone}
            </span>
          ) : null}
          {email ? (
            <span>
              <Mail aria-hidden="true" />
              {email}
            </span>
          ) : null}
          {website ? (
            <span>
              <Globe2 aria-hidden="true" />
              {website}
            </span>
          ) : null}
        </div>

        {node.body ? <strong>{node.body}</strong> : null}
      </div>
    </article>
  );
}

function ImageNode({ node, settings }: DisplayNodeRendererProps) {
  const [failed, setFailed] = useState(false);
  const imageFit = getNodeSettingText(node, "imageFit") === "contain" ? "contain" : "cover";

  return (
    <article
      id={`node-${node.id}`}
      className={getNodeClassName(node, "display-node media-node display-node-image")}
      style={getNodeStyle(node, settings)}
    >
      <div className="node-media-frame">
        {node.imageUrl && !failed ? (
          <img
            src={node.imageUrl}
            alt={node.title || settings.labels.imageFallback}
            loading="lazy"
            onError={() => setFailed(true)}
            style={{ objectFit: imageFit }}
          />
        ) : (
          <div className="node-placeholder">
            <ImageIcon aria-hidden="true" />
            <span>{settings.labels.imageFallback}</span>
          </div>
        )}
      </div>
      {node.title || node.subtitle || node.body ? (
        <div className="node-copy">
          {node.subtitle ? <p>{node.subtitle}</p> : null}
          {node.title ? <h2>{node.title}</h2> : null}
          {node.body ? <span>{node.body}</span> : null}
        </div>
      ) : null}
    </article>
  );
}

function VideoNode({ node, settings }: DisplayNodeRendererProps) {
  const [failed, setFailed] = useState(false);

  return (
    <article
      id={`node-${node.id}`}
      className={getNodeClassName(node, "display-node media-node display-node-video")}
      style={getNodeStyle(node, settings)}
    >
      <div className="node-media-frame">
        {node.videoUrl && !failed ? (
          <video
            src={node.videoUrl}
            poster={node.imageUrl || undefined}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setFailed(true)}
          />
        ) : node.imageUrl ? (
          <img src={node.imageUrl} alt={node.title || settings.labels.videoFallback} loading="lazy" />
        ) : (
          <div className="node-placeholder">
            <Video aria-hidden="true" />
            <span>{settings.labels.videoFallback}</span>
          </div>
        )}
      </div>
      {node.title || node.subtitle || node.body ? (
        <div className="node-copy">
          {node.subtitle ? <p>{node.subtitle}</p> : null}
          {node.title ? <h2>{node.title}</h2> : null}
          {node.body ? <span>{node.body}</span> : null}
        </div>
      ) : null}
    </article>
  );
}

function AdvertisementNode({ node, settings }: DisplayNodeRendererProps) {
  return (
    <article
      id={`node-${node.id}`}
      className={getNodeClassName(node, "display-node display-node-advertisement")}
      style={getNodeStyle(node, settings)}
    >
      {node.imageUrl ? <img src={node.imageUrl} alt={node.title} loading="lazy" /> : <Megaphone aria-hidden="true" />}
      <div>
        {node.subtitle ? <p>{node.subtitle}</p> : null}
        <h2>{node.title}</h2>
        {node.body ? <span>{node.body}</span> : null}
        {node.linkUrl ? (
          <a href={node.linkUrl} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            {node.buttonLabel || settings.labels.productLink}
          </a>
        ) : null}
      </div>
    </article>
  );
}

function TextNode({ node, settings }: DisplayNodeRendererProps) {
  return (
    <article id={`node-${node.id}`} className={getNodeClassName(node, "display-node display-node-text")} style={getNodeStyle(node, settings)}>
      {node.subtitle ? <p>{node.subtitle}</p> : null}
      {node.title ? <h2>{node.title}</h2> : null}
      {node.body ? <span>{node.body}</span> : null}
    </article>
  );
}

function SectionHeaderNode({ node, settings }: DisplayNodeRendererProps) {
  return (
    <section
      id={`node-${node.id}`}
      className={getNodeClassName(node, `display-node display-node-section-header template-${node.template || "standard"}`)}
      style={getNodeStyle(node, settings)}
    >
      {node.subtitle || node.category ? <p>{node.subtitle || node.category}</p> : null}
      {node.title ? <h2>{node.title}</h2> : null}
      {node.body ? <span>{node.body}</span> : null}
    </section>
  );
}

function BannerNode({ node, settings }: DisplayNodeRendererProps) {
  return (
    <section
      id={`node-${node.id}`}
      className={getNodeClassName(node, "display-node display-node-banner")}
      style={{
        ...getNodeStyle(node, settings),
        backgroundImage: node.imageUrl ? `linear-gradient(90deg, rgba(7, 19, 26, 0.8), rgba(7, 19, 26, 0.18)), url("${node.imageUrl}")` : undefined,
      }}
    >
      {node.subtitle ? <p>{node.subtitle}</p> : null}
      {node.title ? <h2>{node.title}</h2> : null}
      {node.body ? <span>{node.body}</span> : null}
      {node.linkUrl ? (
        <a href={node.linkUrl} target="_blank" rel="noreferrer">
          <ExternalLink aria-hidden="true" />
          {node.buttonLabel || settings.labels.productLink}
        </a>
      ) : null}
    </section>
  );
}

function WeatherTimeNode({ node, settings }: DisplayNodeRendererProps) {
  const title = node.title || getNodeSettingText(node, "headline") || "Current showroom conditions";
  const body =
    node.body ||
    getNodeSettingText(node, "body") ||
    `Live time and local weather for ${settings.locationName || settings.labels.headerLabel}.`;
  const note = getNodeSettingText(node, "note") || (settings.weatherEnabled ? "Updated throughout the day" : "Weather widget is hidden");
  const showMusicPlayer = settings.musicEnabled && settings.musicPlacement === "weather";

  return (
    <article id={`node-${node.id}`} className={getNodeClassName(node, "display-node display-node-weather-time")} style={getNodeStyle(node, settings)}>
      <div className="weather-node-copy">
        {node.subtitle || node.category ? <p>{node.subtitle || node.category}</p> : null}
        <h2>{title}</h2>
        <span>{body}</span>
        <small>{note}</small>
      </div>
      {showMusicPlayer ? <DisplayMusicPlayer settings={settings} placement="weather" /> : <div className="weather-node-fill" />}
      <WeatherTimeWidget settings={settings} />
    </article>
  );
}

function SpacerNode({ node, settings }: DisplayNodeRendererProps) {
  const height = Math.min(Math.max(getNodeSettingNumber(node, "height", 48), 8), 360);
  return (
    <div
      id={`node-${node.id}`}
      className={getNodeClassName(node, "display-node display-node-spacer")}
      style={{ ...getNodeStyle(node, settings), minHeight: height }}
    />
  );
}

export function DisplayNodeRenderer({ node, settings }: DisplayNodeRendererProps) {
  if (node.type === "product") return <ProductNode node={node} settings={settings} />;
  if (node.type === "business_card") return <BusinessCardNode node={node} settings={settings} />;
  if (node.type === "image") return <ImageNode node={node} settings={settings} />;
  if (node.type === "video") return <VideoNode node={node} settings={settings} />;
  if (node.type === "advertisement") return <AdvertisementNode node={node} settings={settings} />;
  if (node.type === "section_header") return <SectionHeaderNode node={node} settings={settings} />;
  if (node.type === "banner") return <BannerNode node={node} settings={settings} />;
  if (node.type === "weather_time") return <WeatherTimeNode node={node} settings={settings} />;
  if (node.type === "spacer") return <SpacerNode node={node} settings={settings} />;

  return <TextNode node={node} settings={settings} />;
}
