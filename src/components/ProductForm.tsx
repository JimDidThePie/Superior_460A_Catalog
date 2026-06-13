import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ImageDropField } from "./ImageDropField";
import type { Product, ProductInput } from "../types/product";
import { specsToText, textToSpecs } from "../utils/product";

const emptyProduct: ProductInput = {
  name: "",
  category: "",
  description: "",
  price: "",
  specs: [],
  imageUrl: "",
  modelUrl: "",
  modelEmbedUrl: "",
  productUrl: "",
  featured: false,
  hidden: false,
  sortOrder: 0,
};

type ProductFormProps = {
  product?: Product | null;
  onSave: (product: Product | ProductInput) => Promise<void>;
  onCancel: () => void;
};

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [draft, setDraft] = useState<Product | ProductInput>(emptyProduct);
  const [specText, setSpecText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(product || { ...emptyProduct, sortOrder: 0 });
    setSpecText(specsToText(product?.specs || []));
    setError("");
  }, [product]);

  const updateDraft = (field: keyof ProductInput, value: string | boolean) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await onSave({
        ...draft,
        specs: textToSpecs(specText),
      });
      setDraft({ ...emptyProduct, sortOrder: 0 });
      setSpecText("");
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-panel product-form" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <p>{product ? "Edit product" : "New product"}</p>
          <h2>{product ? product.name : "Add Product"}</h2>
        </div>
        {product ? (
          <button type="button" className="icon-button" onClick={onCancel} aria-label="Cancel edit">
            <X aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="form-grid">
        <label>
          Product name
          <input
            required
            value={draft.name}
            onChange={(event) => updateDraft("name", event.target.value)}
            placeholder="Variable Speed Pump"
          />
        </label>

        <label>
          Category
          <input
            value={draft.category}
            onChange={(event) => updateDraft("category", event.target.value)}
            placeholder="Pumps"
          />
        </label>

        <label>
          Price
          <input value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} placeholder="$999" />
        </label>

        <label className="wide">
          Description
          <textarea
            value={draft.description}
            onChange={(event) => updateDraft("description", event.target.value)}
            placeholder="Short, TV-readable product description."
          />
        </label>

        <label className="wide">
          Specs / features
          <span>One per line or comma separated.</span>
          <textarea
            value={specText}
            onChange={(event) => setSpecText(event.target.value)}
            placeholder={"2.7 HP motor\nProgrammable schedules\nQuiet operation"}
          />
        </label>

        <ImageDropField
          className="wide"
          label="Image / GIF"
          description="image_url accepts jpg, jpeg, png, webp, svg, and animated gif files."
          value={draft.imageUrl}
          onChange={(value) => updateDraft("imageUrl", value)}
          placeholder="https://example.com/product.gif"
        />

        <label className="wide">
          3D Model URL
          <span>model_url accepts glb, gltf, and usdz files.</span>
          <input
            value={draft.modelUrl}
            onChange={(event) => updateDraft("modelUrl", event.target.value)}
            placeholder="https://example.com/model.glb"
          />
        </label>

        <label className="wide">
          3D Embed URL
          <span>model_embed_url accepts iframe/share embed links like Kiri Engine.</span>
          <textarea
            value={draft.modelEmbedUrl}
            onChange={(event) => updateDraft("modelEmbedUrl", event.target.value)}
            placeholder={'https://example.com/embed/model or <iframe src="..."></iframe>'}
          />
        </label>

        <label className="wide">
          Product detail link
          <input
            value={draft.productUrl}
            onChange={(event) => updateDraft("productUrl", event.target.value)}
            placeholder="Optional external product page"
          />
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={draft.featured}
            onChange={(event) => updateDraft("featured", event.target.checked)}
          />
          <span>Featured product</span>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={draft.hidden}
            onChange={(event) => updateDraft("hidden", event.target.checked)}
          />
          <span>Hide from TV display</span>
        </label>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          <Save aria-hidden="true" />
          {saving ? "Saving..." : "Save Product"}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Clear
        </button>
      </div>
    </form>
  );
}
