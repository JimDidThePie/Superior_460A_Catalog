import type { Product } from "../types/product";

const escapeCsv = (value: string | number | boolean) => `"${String(value).replace(/"/g, '""')}"`;

export const productsToCsv = (products: Product[]) => {
  const headers = [
    "name",
    "category",
    "description",
    "price",
    "specs",
    "image_url",
    "model_url",
    "model_embed_url",
    "product_url",
    "featured",
    "hidden",
    "sort_order",
  ];

  const rows = products.map((product) =>
    [
      product.name,
      product.category,
      product.description,
      product.price,
      product.specs.join("; "),
      product.imageUrl,
      product.modelUrl,
      product.modelEmbedUrl,
      product.productUrl,
      product.featured,
      product.hidden,
      product.sortOrder,
    ].map(escapeCsv),
  );

  return [headers.map(escapeCsv), ...rows].map((row) => row.join(",")).join("\n");
};

export const downloadCsv = (products: Product[]) => {
  const blob = new Blob([productsToCsv(products)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "showroom-products.csv";
  link.click();
  URL.revokeObjectURL(url);
};
