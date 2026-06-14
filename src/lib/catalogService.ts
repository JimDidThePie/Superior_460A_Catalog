import { demoProducts } from "../data/demoProducts";
import type { Product, ProductInput, ProductRow } from "../types/product";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

const STORAGE_KEY = "showroom-products-v1";
const LOCAL_OVERRIDE_KEY = "showroom-products-local-override-v1";
const CHANNEL_NAME = "showroom-products";

const createProductId = () => {
  if ("randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `product-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
};

const getString = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const getBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.trim().toLowerCase());
  }

  return Boolean(value);
};

const normalizeSpecs = (specs: unknown) => {
  if (Array.isArray(specs)) {
    return specs.map((spec) => String(spec).trim()).filter(Boolean);
  }

  if (typeof specs === "string") {
    return specs
      .split(/\r?\n|,/)
      .map((spec) => spec.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeProduct = (rawProduct: unknown, index = 0): Product => {
  const product = rawProduct && typeof rawProduct === "object" ? (rawProduct as Record<string, unknown>) : {};
  const sortOrder = Number(product.sortOrder ?? product.sort_order);

  return {
    id: getString(product.id).trim() || createProductId(),
    name: getString(product.name).trim() || "Untitled Product",
    category: getString(product.category).trim(),
    description: getString(product.description).trim(),
    price: getString(product.price).trim(),
    specs: normalizeSpecs(product.specs),
    imageUrl: getString(product.imageUrl ?? product.image_url).trim(),
    modelUrl: getString(product.modelUrl ?? product.model_url).trim(),
    modelEmbedUrl: getString(product.modelEmbedUrl ?? product.model_embed_url).trim(),
    productUrl: getString(product.productUrl ?? product.product_url).trim(),
    featured: getBoolean(product.featured),
    hidden: getBoolean(product.hidden),
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : index + 1,
    createdAt: getString(product.createdAt ?? product.created_at).trim() || undefined,
    updatedAt: getString(product.updatedAt ?? product.updated_at).trim() || undefined,
  };
};

const toProduct = (row: ProductRow, index = 0): Product => normalizeProduct(row, index);

const toRow = (product: Product): ProductRow => {
  const safeProduct = normalizeProduct(product);

  return {
    id: safeProduct.id,
    name: safeProduct.name,
    category: safeProduct.category,
    description: safeProduct.description,
    price: safeProduct.price,
    specs: safeProduct.specs,
    image_url: safeProduct.imageUrl,
    model_url: safeProduct.modelUrl,
    model_embed_url: safeProduct.modelEmbedUrl,
    product_url: safeProduct.productUrl,
    featured: safeProduct.featured,
    hidden: safeProduct.hidden,
    sort_order: safeProduct.sortOrder,
  };
};

const getLocalProducts = () => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const products = demoProducts.map(normalizeProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return products;
  }

  try {
    const parsedProducts = JSON.parse(saved);
    const products = Array.isArray(parsedProducts) ? parsedProducts.map(normalizeProduct) : demoProducts.map(normalizeProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return products;
  } catch {
    const products = demoProducts.map(normalizeProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return products;
  }
};

const saveLocalProducts = (products: Product[]) => {
  const safeProducts = (Array.isArray(products) ? products : []).map(normalizeProduct);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeProducts));

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(safeProducts);
    channel.close();
  }
};

const enableLocalProductOverride = () => {
  localStorage.setItem(LOCAL_OVERRIDE_KEY, "true");
};

const disableLocalProductOverride = () => {
  localStorage.removeItem(LOCAL_OVERRIDE_KEY);
};

const isLocalProductOverrideEnabled = () => localStorage.getItem(LOCAL_OVERRIDE_KEY) === "true";

const sortProducts = (products: Product[]) => products.sort((a, b) => a.sortOrder - b.sortOrder);

const getNextLocalSortOrder = (products: Product[]) => {
  const maxSortOrder = products.reduce((max, product) => Math.max(max, Number(product.sortOrder) || 0), 0);
  return maxSortOrder + 1;
};

const getNextSupabaseSortOrder = async () => {
  if (!supabase) {
    return 1;
  }

  const { data, error } = await supabase
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Number(data?.sort_order || 0) + 1;
};

const listSupabaseProductsOrLocal = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return sortProducts(getLocalProducts());
  }

  const { data, error } = await supabase.from("products").select("*").order("sort_order", { ascending: true });

  if (error) {
    console.warn("Supabase products failed while preparing local fallback.", error.message);
    return sortProducts(getLocalProducts());
  }

  return sortProducts(((data || []) as ProductRow[]).map(toProduct));
};

const syncLocalProductsToSupabase = async () => {
  if (!supabase) {
    return null;
  }

  const localProducts = getLocalProducts();

  if (!localProducts.length) {
    return null;
  }

  const { error } = await supabase.from("products").upsert(localProducts.map(toRow), { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }

  disableLocalProductOverride();
  return sortProducts(localProducts);
};

export const listProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return sortProducts(getLocalProducts());
  }

  if (isLocalProductOverrideEnabled()) {
    try {
      const syncedProducts = await syncLocalProductsToSupabase();
      return syncedProducts || sortProducts(getLocalProducts());
    } catch (syncError) {
      console.warn("Supabase products fallback sync failed.", (syncError as Error).message);
      return sortProducts(getLocalProducts());
    }
  }

  const { data, error } = await supabase.from("products").select("*").order("sort_order", { ascending: true });

  if (error) {
    console.warn("Supabase products failed, using local demo products.", error.message);
    return sortProducts(getLocalProducts());
  }

  return sortProducts(((data || []) as ProductRow[]).map(toProduct));
};

export const saveProduct = async (product: Product | ProductInput): Promise<Product> => {
  const isExistingProduct = "id" in product;

  if (!isSupabaseConfigured || !supabase) {
    const products = getLocalProducts();
    const nextProduct = normalizeProduct(
      {
        ...product,
        id: isExistingProduct ? product.id : createProductId(),
        sortOrder: isExistingProduct ? product.sortOrder : getNextLocalSortOrder(products),
      },
      products.length,
    );
    const exists = products.some((item) => item.id === nextProduct.id);
    const nextProducts = exists
      ? products.map((item) => (item.id === nextProduct.id ? nextProduct : item))
      : [...products, nextProduct];

    saveLocalProducts(sortProducts(nextProducts));
    return nextProduct;
  }

  try {
    const nextProduct = normalizeProduct({
      ...product,
      id: isExistingProduct ? product.id : createProductId(),
      sortOrder: isExistingProduct ? product.sortOrder : await getNextSupabaseSortOrder(),
    });

    const { data, error } = await supabase
      .from("products")
      .upsert(toRow(nextProduct), { onConflict: "id" })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    disableLocalProductOverride();
    return toProduct(data as ProductRow);
  } catch (saveError) {
    console.warn("Supabase products save failed, using local fallback products.", (saveError as Error).message);
    const products = await listSupabaseProductsOrLocal();
    const nextProduct = normalizeProduct(
      {
        ...product,
        id: isExistingProduct ? product.id : createProductId(),
        sortOrder: isExistingProduct ? product.sortOrder : getNextLocalSortOrder(products),
      },
      products.length,
    );
    const exists = products.some((item) => item.id === nextProduct.id);
    const nextProducts = exists
      ? products.map((item) => (item.id === nextProduct.id ? nextProduct : item))
      : [...products, nextProduct];

    enableLocalProductOverride();
    saveLocalProducts(sortProducts(nextProducts));
    return nextProduct;
  }
};

export const deleteProduct = async (productId: string) => {
  if (!isSupabaseConfigured || !supabase) {
    saveLocalProducts(getLocalProducts().filter((product) => product.id !== productId));
    return;
  }

  const productsBeforeDelete = await listSupabaseProductsOrLocal();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    console.warn("Supabase products delete failed, using local fallback products.", error.message);
    enableLocalProductOverride();
    saveLocalProducts(productsBeforeDelete.filter((product) => product.id !== productId));
    return;
  }

  disableLocalProductOverride();
};

export const reorderProducts = async (products: Product[]) => {
  const orderedProducts = (Array.isArray(products) ? products : [])
    .map(normalizeProduct)
    .map((product, index) => ({ ...product, sortOrder: index + 1 }));

  if (!isSupabaseConfigured || !supabase) {
    saveLocalProducts(orderedProducts);
    return orderedProducts;
  }

  const { error } = await supabase.from("products").upsert(orderedProducts.map(toRow), { onConflict: "id" });

  if (error) {
    console.warn("Supabase products reorder failed, using local fallback products.", error.message);
    enableLocalProductOverride();
    saveLocalProducts(orderedProducts);
    return orderedProducts;
  }

  disableLocalProductOverride();
  return orderedProducts;
};

export const subscribeProducts = (onChange: (products: Product[]) => void) => {
  const localChannel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;

  if (localChannel) {
    localChannel.onmessage = (event) => {
      console.log("Local products change:", event.data);
      const products = Array.isArray(event.data) ? event.data.map(normalizeProduct) : [];
      onChange(sortProducts(products));
    };
  }

  if (!isSupabaseConfigured || !supabase) {
    return () => {
      localChannel?.close();
    };
  }

  const client = supabase;
  const channel = client
    .channel("products_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
      console.log("Realtime products change:", payload);
      disableLocalProductOverride();
      void listProducts()
        .then(onChange)
        .catch((error) => console.error("Realtime products reload failed:", error));
    })
    .subscribe((status, error) => {
      console.log("products realtime status:", status, error || "");
    });

  return () => {
    localChannel?.close();
    void client.removeChannel(channel);
  };
};
