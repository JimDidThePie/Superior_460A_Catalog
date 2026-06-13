import { useCallback, useEffect, useState } from "react";
import { deleteProduct, listProducts, reorderProducts, saveProduct, subscribeProducts } from "../lib/catalogService";
import type { Product, ProductInput } from "../types/product";

const getProductActionError = (error: unknown) => {
  const message = (error as Error).message || "Product action failed.";

  if (message.toLowerCase().includes("row-level security")) {
    return "Supabase blocked this product change with row-level security. Run supabase/fix_admin_writes.sql in the Supabase SQL Editor, then try again.";
  }

  return message;
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);

    try {
      setProducts(await listProducts());
      setError("");
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    return subscribeProducts(setProducts);
  }, [reload]);

  const upsertProduct = useCallback(async (product: Product | ProductInput) => {
    try {
      const savedProduct = await saveProduct(product);
      setProducts(await listProducts());
      setError("");
      return savedProduct;
    } catch (saveError) {
      setError(getProductActionError(saveError));
      throw saveError;
    }
  }, []);

  const removeProduct = useCallback(async (productId: string) => {
    try {
      await deleteProduct(productId);
      setProducts(await listProducts());
      setError("");
    } catch (deleteError) {
      setError(getProductActionError(deleteError));
      throw deleteError;
    }
  }, []);

  const moveProduct = useCallback(async (productId: string, direction: "up" | "down") => {
    try {
      const currentProducts = await listProducts();
      const index = currentProducts.findIndex((product) => product.id === productId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || targetIndex < 0 || targetIndex >= currentProducts.length) {
        return;
      }

      const nextProducts = [...currentProducts];
      const [product] = nextProducts.splice(index, 1);
      nextProducts.splice(targetIndex, 0, product);

      setProducts(await reorderProducts(nextProducts));
      setError("");
    } catch (moveError) {
      setError(getProductActionError(moveError));
      throw moveError;
    }
  }, []);

  return {
    products,
    loading,
    error,
    reload,
    upsertProduct,
    removeProduct,
    moveProduct,
  };
}
