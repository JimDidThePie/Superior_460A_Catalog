import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { ProductMedia } from "../components/ProductMedia";
import { useDisplaySettings } from "../hooks/useDisplaySettings";
import { useProducts } from "../hooks/useProducts";

export function ProductPage() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const productId = pathParts[pathParts.length - 1] || "";
  const { products, loading } = useProducts();
  const { settings } = useDisplaySettings();
  const product = useMemo(() => products.find((item) => item.id === productId), [productId, products]);

  if (loading) {
    return <main className="detail-shell">Loading product...</main>;
  }

  if (!product) {
    return (
      <main className="detail-shell">
        <a href="/display">
          <ArrowLeft aria-hidden="true" />
          Back to display
        </a>
        <h1>Product not found</h1>
      </main>
    );
  }

  const specs = Array.isArray(product.specs) ? product.specs : [];

  return (
    <main className="detail-shell">
      <a href="/display">
        <ArrowLeft aria-hidden="true" />
        Back to display
      </a>

      <article className="detail-layout">
        <ProductMedia
          product={product}
          defaultMode={settings.defaultMediaMode}
          settings={settings}
          className="detail-media"
        />
        <div>
          <p>{product.category}</p>
          <h1>{product.name}</h1>
          <strong>{product.price || "Ask for price"}</strong>
          <p>{product.description}</p>
          {specs.length ? (
            <ul>
              {specs.map((spec) => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
          ) : null}
          {product.productUrl ? (
            <a className="primary-link" href={product.productUrl} target="_blank" rel="noreferrer">
              Open product page
            </a>
          ) : null}
        </div>
      </article>
    </main>
  );
}
