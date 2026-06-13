import type { Product } from "../types/product";

export const PLACEHOLDER_IMAGE = "/images/product-fallback.svg";

export const getProductImage = (product: Product) => String(product.imageUrl || "") || PLACEHOLDER_IMAGE;

export const getProductDetailUrl = (product: Product) => {
  const productUrl = String(product.productUrl || "");

  if (productUrl) {
    return productUrl;
  }

  if (typeof window === "undefined") {
    return `/product/${product.id}`;
  }

  return `${window.location.origin}/product/${product.id}`;
};

export const isModelFileUrl = (url: string) => /\.(glb|gltf|usdz)(\?.*)?$/i.test(url.trim());

export const getProductEmbedUrl = (product: Product) => {
  const rawEmbed = String(product.modelEmbedUrl || "").trim();

  if (!rawEmbed) {
    return "";
  }

  const iframeMatch = rawEmbed.match(/src=["']([^"']+)["']/i);
  return iframeMatch?.[1] || rawEmbed;
};

export const specsToText = (specs: string[]) => specs.join("\n");

export const textToSpecs = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
