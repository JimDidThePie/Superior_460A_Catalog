import {
  ArrowDown,
  ArrowUp,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Layers3,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ImageDropField } from "./ImageDropField";
import {
  DISPLAY_NODE_TYPE_LABELS,
  DISPLAY_NODE_TYPES,
  type DisplayNode,
  type DisplayNodeInput,
  type DisplayNodeType,
} from "../types/displayNode";
import { specsToText, textToSpecs } from "../utils/product";

type DisplayNodeManagerProps = {
  nodes: DisplayNode[];
  loading?: boolean;
  error?: string;
  onSave: (node: DisplayNode | DisplayNodeInput) => Promise<unknown>;
  onDelete: (nodeId: string) => Promise<void>;
  onDuplicate: (node: DisplayNode) => Promise<unknown>;
  onMove: (nodeId: string, direction: "up" | "down") => Promise<void>;
};

const createEmptyNode = (type: DisplayNodeType = "product"): DisplayNodeInput => ({
  type,
  title: "",
  subtitle: "",
  body: "",
  category: "",
  price: "",
  specs: [],
  imageUrl: "",
  videoUrl: "",
  modelUrl: "",
  modelEmbedUrl: "",
  linkUrl: "",
  buttonLabel: "",
  accentColor: "#55d6c2",
  backgroundColor: "",
  textColor: "",
  template: type === "business_card" ? "contact" : type === "product" ? "product-standard" : "standard",
  hidden: false,
  featured: false,
  sortOrder: 0,
  settings: {},
});

const getText = (value: unknown) => (value === null || value === undefined ? "" : String(value).trim());

const getBooleanSetting = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  return typeof value === "string" ? ["true", "1", "yes", "on"].includes(value.trim().toLowerCase()) : Boolean(value);
};

const sortNodes = (nodes: DisplayNode[]) =>
  [...nodes].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

export function DisplayNodeManager({
  nodes,
  loading = false,
  error = "",
  onSave,
  onDelete,
  onDuplicate,
  onMove,
}: DisplayNodeManagerProps) {
  const [draft, setDraft] = useState<DisplayNode | DisplayNodeInput>(() => createEmptyNode());
  const [editingNode, setEditingNode] = useState<DisplayNode | null>(null);
  const [specText, setSpecText] = useState("");
  const [settingsText, setSettingsText] = useState("{}");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DisplayNodeType | "all">("all");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const sortedNodes = useMemo(() => sortNodes(safeNodes), [safeNodes]);

  const filteredNodes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortedNodes.filter((node) => {
      const matchesType = typeFilter === "all" || node.type === typeFilter;
      const matchesSearch =
        !query ||
        [node.title, node.subtitle, node.body, node.category, node.price, node.template, node.type]
          .some((value) => getText(value).toLowerCase().includes(query));

      return matchesType && matchesSearch;
    });
  }, [search, sortedNodes, typeFilter]);

  useEffect(() => {
    if (!editingNode) {
      setSpecText(specsToText(draft.specs));
      setSettingsText(JSON.stringify(draft.settings || {}, null, 2));
      return;
    }

    setDraft(editingNode);
    setSpecText(specsToText(editingNode.specs || []));
    setSettingsText(JSON.stringify(editingNode.settings || {}, null, 2));
    setFormError("");
  }, [editingNode]);

  const resetDraft = (type: DisplayNodeType = draft.type) => {
    const emptyNode = createEmptyNode(type);
    setDraft(emptyNode);
    setEditingNode(null);
    setSpecText("");
    setSettingsText(JSON.stringify(emptyNode.settings, null, 2));
    setFormError("");
  };

  const updateDraft = (field: keyof DisplayNodeInput, value: DisplayNodeInput[keyof DisplayNodeInput]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateDraftSetting = (field: string, value: string | number | boolean) => {
    setDraft((current) => {
      const nextSettings = { ...(current.settings || {}), [field]: value };
      setSettingsText(JSON.stringify(nextSettings, null, 2));
      return { ...current, settings: nextSettings };
    });
  };

  const getDraftSetting = (field: string) => getText(draft.settings?.[field]);

  const getDraftSettingBoolean = (field: string) => {
    return getBooleanSetting(draft.settings?.[field]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const parsedSettings = settingsText.trim() ? (JSON.parse(settingsText) as Record<string, unknown>) : {};

      await onSave({
        ...draft,
        specs: textToSpecs(specText),
        settings: parsedSettings,
      });
      resetDraft(draft.type);
    } catch (saveError) {
      setFormError((saveError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (type: DisplayNodeType) => {
    setDraft((current) => ({
      ...current,
      type,
      template: current.template || createEmptyNode(type).template,
    }));
  };

  const renderTypeSpecificFields = () => {
    if (draft.type === "business_card") {
      return (
        <div className="form-grid form-subsection">
          <label>
            Phone
            <input value={getDraftSetting("phone")} onChange={(event) => updateDraftSetting("phone", event.target.value)} />
          </label>
          <label>
            Email
            <input value={getDraftSetting("email")} onChange={(event) => updateDraftSetting("email", event.target.value)} />
          </label>
          <label className="wide">
            Website
            <input value={getDraftSetting("website")} onChange={(event) => updateDraftSetting("website", event.target.value)} />
          </label>
        </div>
      );
    }

    if (draft.type === "image") {
      return (
        <div className="form-grid form-subsection">
          <label>
            Image fit
            <select value={getDraftSetting("imageFit") || "cover"} onChange={(event) => updateDraftSetting("imageFit", event.target.value)}>
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </label>
        </div>
      );
    }

    if (draft.type === "spacer") {
      return (
        <div className="form-grid form-subsection">
          <label>
            Spacer height
            <input
              type="number"
              min="8"
              max="360"
              value={getDraftSetting("height") || "48"}
              onChange={(event) => updateDraftSetting("height", Number(event.target.value))}
            />
          </label>
        </div>
      );
    }

    return null;
  };

  return (
    <section className="admin-panel node-manager">
      <div className="panel-heading">
        <div>
          <p>{safeNodes.length} nodes</p>
          <h2>Display Nodes</h2>
        </div>
        <Layers3 aria-hidden="true" />
      </div>

      <form className="node-form" onSubmit={handleSubmit}>
        <div className="section-heading-row">
          <div>
            <p>{editingNode ? "Edit node" : "New node"}</p>
            <h3>{editingNode ? editingNode.title || DISPLAY_NODE_TYPE_LABELS[editingNode.type] : "Add Display Node"}</h3>
          </div>
          {editingNode ? (
            <button type="button" className="secondary" onClick={() => resetDraft()}>
              <X aria-hidden="true" />
              Cancel
            </button>
          ) : (
            <button type="button" className="secondary" onClick={() => resetDraft(draft.type)}>
              <Plus aria-hidden="true" />
              New
            </button>
          )}
        </div>

        <div className="form-grid">
          <label>
            Type
            <select value={draft.type} onChange={(event) => handleTypeChange(event.target.value as DisplayNodeType)}>
              {DISPLAY_NODE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {DISPLAY_NODE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>

          <label>
            Template
            <input value={draft.template} onChange={(event) => updateDraft("template", event.target.value)} placeholder="standard" />
          </label>

          <label className="wide">
            Title / headline / name
            <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="Node title" />
          </label>

          <label className="wide">
            Subtitle / role / kicker
            <input value={draft.subtitle} onChange={(event) => updateDraft("subtitle", event.target.value)} placeholder="Optional subtitle" />
          </label>

          <label className="wide">
            Body / description / note
            <textarea value={draft.body} onChange={(event) => updateDraft("body", event.target.value)} placeholder="TV-readable body copy" />
          </label>

          <label>
            Category
            <input value={draft.category} onChange={(event) => updateDraft("category", event.target.value)} />
          </label>

          <label>
            Price
            <input value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} />
          </label>

          <label className="wide">
            Specs
            <span>One per line or comma separated.</span>
            <textarea value={specText} onChange={(event) => setSpecText(event.target.value)} />
          </label>

          <ImageDropField
            className="wide"
            label="Image / GIF / poster / photo"
            description="Supports jpg, jpeg, png, webp, svg, and animated gif files."
            value={draft.imageUrl}
            onChange={(value) => updateDraft("imageUrl", value)}
            placeholder="https://example.com/display-node.gif"
          />

          <ImageDropField
            className="wide"
            label="Node background image / GIF"
            description="Optional background for this node only."
            value={getDraftSetting("backgroundImageUrl")}
            onChange={(value) => updateDraftSetting("backgroundImageUrl", value)}
            placeholder="https://example.com/node-background.jpg"
          />

          <label className="wide">
            Video URL
            <input value={draft.videoUrl} onChange={(event) => updateDraft("videoUrl", event.target.value)} />
          </label>

          <label className="wide">
            3D Model URL
            <input value={draft.modelUrl} onChange={(event) => updateDraft("modelUrl", event.target.value)} />
          </label>

          <label className="wide">
            3D Embed URL
            <textarea value={draft.modelEmbedUrl} onChange={(event) => updateDraft("modelEmbedUrl", event.target.value)} />
          </label>

          <label className="wide">
            Link URL
            <input value={draft.linkUrl} onChange={(event) => updateDraft("linkUrl", event.target.value)} />
          </label>

          <label>
            Button label
            <input value={draft.buttonLabel} onChange={(event) => updateDraft("buttonLabel", event.target.value)} />
          </label>

          <label>
            Accent color
            <input type="color" value={draft.accentColor || "#55d6c2"} onChange={(event) => updateDraft("accentColor", event.target.value)} />
          </label>

          <label>
            Background color
            <input type="color" value={draft.backgroundColor || "#16262d"} onChange={(event) => updateDraft("backgroundColor", event.target.value)} />
          </label>

          <label>
            Text color
            <input type="color" value={draft.textColor || "#f7fbfc"} onChange={(event) => updateDraft("textColor", event.target.value)} />
          </label>

          <label className="check-row">
            <input type="checkbox" checked={draft.featured} onChange={(event) => updateDraft("featured", event.target.checked)} />
            <span>Featured</span>
          </label>

          <label className="check-row">
            <input type="checkbox" checked={draft.hidden} onChange={(event) => updateDraft("hidden", event.target.checked)} />
            <span>Hidden</span>
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={getDraftSettingBoolean("locked")}
              onChange={(event) => updateDraftSetting("locked", event.target.checked)}
            />
            <span>Lock this node on display</span>
          </label>

          <label>
            Sort order
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(event) => updateDraft("sortOrder", Number(event.target.value))}
            />
          </label>

          <label className="wide">
            Settings JSON
            <span>Flexible type-specific options. Quick fields above write into this JSON on save.</span>
            <textarea className="code-input" value={settingsText} onChange={(event) => setSettingsText(event.target.value)} />
          </label>
        </div>

        {renderTypeSpecificFields()}

        {formError ? <p className="form-error">{formError}</p> : null}

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            <Save aria-hidden="true" />
            {saving ? "Saving..." : "Save Node"}
          </button>
        </div>
      </form>

      <div className="node-list-tools">
        <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search display nodes" />
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as DisplayNodeType | "all")}>
          <option value="all">All node types</option>
          {DISPLAY_NODE_TYPES.map((type) => (
            <option key={type} value={type}>
              {DISPLAY_NODE_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      {loading ? <p className="save-status">Loading display nodes...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="product-table node-table">
        {filteredNodes.map((node) => {
          const globalIndex = sortedNodes.findIndex((item) => item.id === node.id);

          return (
            <article key={node.id} className={node.hidden ? "is-hidden" : ""}>
              <div>
                <strong>{node.title || DISPLAY_NODE_TYPE_LABELS[node.type]}</strong>
                <span>
                  <span className="node-type-pill">{DISPLAY_NODE_TYPE_LABELS[node.type]}</span>
                  Order {node.sortOrder || globalIndex + 1}
                  {node.category ? ` · ${node.category}` : ""}
                  {getBooleanSetting(node.settings?.locked) ? " · Locked" : ""}
                </span>
              </div>

              <div className="row-actions">
                <button
                  type="button"
                  title="Move node up"
                  aria-label={`Move ${node.title || DISPLAY_NODE_TYPE_LABELS[node.type]} up`}
                  onClick={() => void onMove(node.id, "up").catch(() => undefined)}
                  disabled={globalIndex <= 0}
                >
                  <ArrowUp aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title="Move node down"
                  aria-label={`Move ${node.title || DISPLAY_NODE_TYPE_LABELS[node.type]} down`}
                  onClick={() => void onMove(node.id, "down").catch(() => undefined)}
                  disabled={globalIndex < 0 || globalIndex >= sortedNodes.length - 1}
                >
                  <ArrowDown aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title={node.hidden ? "Show node" : "Hide node"}
                  aria-label={`${node.hidden ? "Show" : "Hide"} ${node.title || DISPLAY_NODE_TYPE_LABELS[node.type]}`}
                  onClick={() => void onSave({ ...node, hidden: !node.hidden }).catch(() => undefined)}
                >
                  {node.hidden ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  title="Duplicate node"
                  aria-label={`Duplicate ${node.title || DISPLAY_NODE_TYPE_LABELS[node.type]}`}
                  onClick={() => void onDuplicate(node).catch(() => undefined)}
                >
                  <Copy aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title="Edit node"
                  aria-label={`Edit ${node.title || DISPLAY_NODE_TYPE_LABELS[node.type]}`}
                  onClick={() => setEditingNode(node)}
                >
                  <Edit aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="danger"
                  title="Delete node"
                  aria-label={`Delete ${node.title || DISPLAY_NODE_TYPE_LABELS[node.type]}`}
                  onClick={() => {
                    if (window.confirm(`Delete ${node.title || DISPLAY_NODE_TYPE_LABELS[node.type]}?`)) {
                      void onDelete(node.id).catch(() => undefined);
                    }
                  }}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
