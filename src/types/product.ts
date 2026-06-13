export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  specs: string[];
  imageUrl: string;
  modelUrl: string;
  modelEmbedUrl: string;
  productUrl: string;
  featured: boolean;
  hidden: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  specs: string[];
  image_url: string;
  model_url: string;
  model_embed_url: string;
  product_url: string;
  featured: boolean;
  hidden: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};
