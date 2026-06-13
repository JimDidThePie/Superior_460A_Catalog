import { Box, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "../types/product";
import { DEFAULT_SHOWROOM_SETTINGS, type DefaultMediaMode, type ShowroomSettings } from "../types/settings";
import { getProductEmbedUrl, isModelFileUrl, PLACEHOLDER_IMAGE } from "../utils/product";

type ProductMediaProps = {
  product: Product;
  defaultMode?: DefaultMediaMode;
  settings?: ShowroomSettings;
  className?: string;
  allowToggle?: boolean;
  placeholderLabel?: string;
  modelBadgeLabel?: string;
};

type MediaMode = "model" | "image";

const isUsdz = (url: string) => /\.usdz(\?.*)?$/i.test(url.trim());

const getText = (value: unknown) => (value === null || value === undefined ? "" : String(value).trim());

const getFiniteNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const getCameraOrbit = (settings: ShowroomSettings) => {
  const cameraOrbit = getText(settings.cameraOrbit) || DEFAULT_SHOWROOM_SETTINGS.cameraOrbit;
  const parts = cameraOrbit.split(/\s+/);
  const zoom = Math.min(Math.max(getFiniteNumber(settings.defaultZoom, DEFAULT_SHOWROOM_SETTINGS.defaultZoom), 35), 250);

  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]} ${zoom}%`;
  }

  return `0deg 75deg ${zoom}%`;
};

export function ProductMedia({
  product,
  defaultMode = "model-first",
  settings,
  className = "",
  allowToggle = true,
  placeholderLabel = "Image coming soon",
  modelBadgeLabel = "3D",
}: ProductMediaProps) {
  const mediaSettings = {
    ...DEFAULT_SHOWROOM_SETTINGS,
    ...(settings || {}),
    defaultMediaMode: settings?.defaultMediaMode || defaultMode,
  };
  const safeProduct = product && typeof product === "object" ? product : ({} as Product);
  const productName = getText(safeProduct.name) || "Product";
  const imageUrl = getText(safeProduct.imageUrl);
  const modelUrl = getText(safeProduct.modelUrl);
  const embedUrl = useMemo(() => {
    try {
      return getText(getProductEmbedUrl(safeProduct));
    } catch {
      return "";
    }
  }, [safeProduct]);
  const hasImage = Boolean(imageUrl);
  const hasModel = Boolean(embedUrl || (modelUrl && isModelFileUrl(modelUrl)));

  const preferredMode: MediaMode = useMemo(() => {
    if (defaultMode === "image-first" && hasImage) {
      return "image";
    }

    if (hasModel) {
      return "model";
    }

    return "image";
  }, [defaultMode, hasImage, hasModel]);

  const [mode, setMode] = useState<MediaMode>(preferredMode);
  const [modelFailed, setModelFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setMode(preferredMode);
    setModelFailed(false);
    setImageFailed(false);
  }, [preferredMode, safeProduct.id, imageUrl, modelUrl, embedUrl]);

  const showImage = mode === "image" || !hasModel || (modelFailed && mediaSettings.fallbackToImageOnModelError);
  const showToggle = allowToggle && hasImage && hasModel;
  const backgroundColor = getText(mediaSettings.backgroundColor) || DEFAULT_SHOWROOM_SETTINGS.backgroundColor;

  const handleModelError = () => {
    setModelFailed(true);

    if (mediaSettings.fallbackToImageOnModelError) {
      setMode("image");
    }
  };

  const renderPlaceholder = () => (
    <div className="media-placeholder">
      <img src={PLACEHOLDER_IMAGE} alt="" aria-hidden="true" />
      <div>
        <Box aria-hidden="true" />
        <span>{placeholderLabel}</span>
      </div>
    </div>
  );

  const renderImage = () => {
    if (!hasImage || imageFailed) {
      return renderPlaceholder();
    }

    return <img src={imageUrl} alt={productName} loading="lazy" onError={() => setImageFailed(true)} />;
  };

  const renderModel = () => {
    if (modelFailed && !mediaSettings.fallbackToImageOnModelError) {
      return renderPlaceholder();
    }

    if (embedUrl) {
      return (
        <iframe
          title={`${productName} 3D embed`}
          src={embedUrl}
          loading="lazy"
          allow="accelerometer; autoplay; camera; gyroscope; magnetometer; web-share; xr-spatial-tracking"
          allowFullScreen
          onError={handleModelError}
          style={{ backgroundColor }}
        />
      );
    }

    if (modelUrl && isModelFileUrl(modelUrl)) {
      return (
        <model-viewer
          src={modelUrl}
          ios-src={isUsdz(modelUrl) ? modelUrl : undefined}
          poster={mediaSettings.showPosterImageBeforeLoad ? imageUrl || PLACEHOLDER_IMAGE : undefined}
          camera-controls
          camera-orbit={getCameraOrbit(mediaSettings)}
          field-of-view={getText(mediaSettings.fieldOfView) || DEFAULT_SHOWROOM_SETTINGS.fieldOfView}
          exposure={String(getFiniteNumber(mediaSettings.exposure, DEFAULT_SHOWROOM_SETTINGS.exposure))}
          shadow-intensity={String(getFiniteNumber(mediaSettings.shadowIntensity, DEFAULT_SHOWROOM_SETTINGS.shadowIntensity))}
          rotation-per-second={`${getFiniteNumber(mediaSettings.autoRotateSpeed, DEFAULT_SHOWROOM_SETTINGS.autoRotateSpeed)}deg`}
          style={{ backgroundColor }}
          ar
          loading="lazy"
          onError={handleModelError}
          {...(mediaSettings.autoRotateEnabled ? { "auto-rotate": true } : {})}
        />
      );
    }

    return renderImage();
  };

  return (
    <div className={`product-media ${className}`}>
      {showToggle ? (
        <div className="media-toggle" aria-label={`${productName} media view`}>
          <button
            type="button"
            className={!showImage ? "active" : ""}
            disabled={modelFailed}
            onClick={() => setMode("model")}
          >
            <Box aria-hidden="true" />
            3D View
          </button>
          <button type="button" className={showImage ? "active" : ""} onClick={() => setMode("image")}>
            <ImageIcon aria-hidden="true" />
            Image View
          </button>
        </div>
      ) : null}

      <div className="media-frame" style={{ backgroundColor }}>
        {showImage ? renderImage() : renderModel()}
      </div>
      {hasModel && !showImage ? <span className="media-badge">{modelBadgeLabel}</span> : null}
    </div>
  );
}
