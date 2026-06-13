import { demoDisplayNodes } from "../data/demoDisplayNodes";
import {
  DISPLAY_NODE_TYPES,
  type DisplayNode,
  type DisplayNodeInput,
  type DisplayNodeRow,
  type DisplayNodeSettings,
  type DisplayNodeType,
} from "../types/displayNode";
import type { Product } from "../types/product";
import type { BusinessCard } from "../types/settings";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

const STORAGE_KEY = "showroom-display-nodes-v1";
const FALLBACK_MODE_KEY = "showroom-display-nodes-local-fallback-v1";
const CHANNEL_NAME = "showroom-display-nodes";
let useLocalDisplayNodeFallback = false;

const createDisplayNodeId = () => {
  if (globalThis.crypto && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `display-node-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
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
    return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
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

const getSortOrder = (value: unknown, index: number) => {
  const sortOrder = Number(value);
  return Number.isFinite(sortOrder) ? sortOrder : index + 1;
};

const isDisplayNodeType = (value: unknown): value is DisplayNodeType =>
  typeof value === "string" && DISPLAY_NODE_TYPES.includes(value as DisplayNodeType);

const normalizeType = (value: unknown): DisplayNodeType => (isDisplayNodeType(value) ? value : "text");

const parseSettings = (settings: unknown): DisplayNodeSettings => {
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return { ...(settings as DisplayNodeSettings) };
  }

  if (typeof settings === "string" && settings.trim()) {
    try {
      const parsed = JSON.parse(settings) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as DisplayNodeSettings) : {};
    } catch {
      return {};
    }
  }

  return {};
};

export const normalizeDisplayNode = (rawNode: unknown, index = 0): DisplayNode => {
  const node = rawNode && typeof rawNode === "object" ? (rawNode as Record<string, unknown>) : {};
  const title = getString(node.title ?? node.name).trim();
  const body = getString(node.body ?? node.description ?? node.note).trim();

  return {
    id: getString(node.id).trim() || createDisplayNodeId(),
    type: normalizeType(node.type),
    title,
    subtitle: getString(node.subtitle ?? node.role).trim(),
    body,
    category: getString(node.category).trim(),
    price: getString(node.price).trim(),
    specs: normalizeSpecs(node.specs),
    imageUrl: getString(node.imageUrl ?? node.image_url ?? node.photoUrl ?? node.logoUrl).trim(),
    videoUrl: getString(node.videoUrl ?? node.video_url).trim(),
    modelUrl: getString(node.modelUrl ?? node.model_url).trim(),
    modelEmbedUrl: getString(node.modelEmbedUrl ?? node.model_embed_url).trim(),
    linkUrl: getString(node.linkUrl ?? node.link_url ?? node.productUrl ?? node.product_url).trim(),
    buttonLabel: getString(node.buttonLabel ?? node.button_label).trim(),
    accentColor: getString(node.accentColor ?? node.accent_color).trim(),
    backgroundColor: getString(node.backgroundColor ?? node.background_color).trim(),
    textColor: getString(node.textColor ?? node.text_color).trim(),
    template: getString(node.template).trim(),
    hidden: getBoolean(node.hidden),
    featured: getBoolean(node.featured),
    sortOrder: getSortOrder(node.sortOrder ?? node.sort_order, index),
    settings: parseSettings(node.settings ?? node.options),
    createdAt: getString(node.createdAt ?? node.created_at).trim() || undefined,
    updatedAt: getString(node.updatedAt ?? node.updated_at).trim() || undefined,
  };
};

const toDisplayNodeRow = (node: DisplayNode): DisplayNodeRow => {
  const safeNode = normalizeDisplayNode(node);

  return {
    id: safeNode.id,
    type: safeNode.type,
    title: safeNode.title,
    subtitle: safeNode.subtitle,
    body: safeNode.body,
    category: safeNode.category,
    price: safeNode.price,
    specs: safeNode.specs,
    image_url: safeNode.imageUrl,
    video_url: safeNode.videoUrl,
    model_url: safeNode.modelUrl,
    model_embed_url: safeNode.modelEmbedUrl,
    link_url: safeNode.linkUrl,
    button_label: safeNode.buttonLabel,
    accent_color: safeNode.accentColor,
    background_color: safeNode.backgroundColor,
    text_color: safeNode.textColor,
    template: safeNode.template,
    hidden: safeNode.hidden,
    featured: safeNode.featured,
    sort_order: safeNode.sortOrder,
    settings: safeNode.settings,
  };
};

const sortDisplayNodes = (nodes: DisplayNode[]) =>
  [...nodes].sort((a, b) => {
    const byOrder = (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
    return byOrder || a.title.localeCompare(b.title);
  });

const getLocalDisplayNodes = () => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const nodes = demoDisplayNodes.map(normalizeDisplayNode);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    return nodes;
  }

  try {
    const parsedNodes = JSON.parse(saved) as unknown;
    const nodes = Array.isArray(parsedNodes)
      ? parsedNodes.map(normalizeDisplayNode)
      : demoDisplayNodes.map(normalizeDisplayNode);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    return nodes;
  } catch {
    const nodes = demoDisplayNodes.map(normalizeDisplayNode);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    return nodes;
  }
};

const saveLocalDisplayNodes = (nodes: DisplayNode[]) => {
  const safeNodes = sortDisplayNodes((Array.isArray(nodes) ? nodes : []).map(normalizeDisplayNode));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeNodes));

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(safeNodes);
    channel.close();
  }
};

const isLocalDisplayNodeFallbackEnabled = () => {
  if (useLocalDisplayNodeFallback) {
    return true;
  }

  try {
    return localStorage.getItem(FALLBACK_MODE_KEY) === "true";
  } catch {
    return false;
  }
};

const enableLocalDisplayNodeFallback = (reason: string) => {
  useLocalDisplayNodeFallback = true;
  try {
    localStorage.setItem(FALLBACK_MODE_KEY, "true");
  } catch {
    // localStorage can be unavailable in unusual browser privacy modes.
  }
  console.warn("Supabase display_nodes write failed; using local display node storage.", reason);
};

const clearLocalDisplayNodeFallback = () => {
  useLocalDisplayNodeFallback = false;

  try {
    localStorage.removeItem(FALLBACK_MODE_KEY);
  } catch {
    // localStorage can be unavailable in unusual browser privacy modes.
  }
};

const getNextLocalSortOrder = (nodes: DisplayNode[]) => {
  const maxSortOrder = nodes.reduce((max, node) => Math.max(max, Number(node.sortOrder) || 0), 0);
  return maxSortOrder + 1;
};

const getNextSupabaseSortOrder = async () => {
  if (!supabase) {
    return 1;
  }

  const { data, error } = await supabase
    .from("display_nodes")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Number(data?.sort_order || 0) + 1;
};

const saveDisplayNodeLocally = (node: DisplayNode | DisplayNodeInput, baseNodes?: DisplayNode[]) => {
  const maybeNode = node as Partial<DisplayNode>;
  const isExistingNode = Boolean(maybeNode.id);
  const nodes = baseNodes ? sortDisplayNodes(baseNodes.map(normalizeDisplayNode)) : getLocalDisplayNodes();
  const nextNode = normalizeDisplayNode(
    {
      ...node,
      id: isExistingNode ? maybeNode.id : createDisplayNodeId(),
      sortOrder: isExistingNode ? maybeNode.sortOrder : getNextLocalSortOrder(nodes),
    },
    nodes.length,
  );
  const exists = nodes.some((item) => item.id === nextNode.id);
  const nextNodes = exists ? nodes.map((item) => (item.id === nextNode.id ? nextNode : item)) : [...nodes, nextNode];

  saveLocalDisplayNodes(nextNodes);
  return nextNode;
};

const mergeDisplayNodeLists = (...nodeLists: DisplayNode[][]) => {
  const nodesById = new Map<string, DisplayNode>();

  nodeLists.flat().forEach((node, index) => {
    const safeNode = normalizeDisplayNode(node, index);
    nodesById.set(safeNode.id, safeNode);
  });

  return sortDisplayNodes(Array.from(nodesById.values()));
};

const listSupabaseDisplayNodes = async () => {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from("display_nodes").select("*").order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return sortDisplayNodes(((data || []) as DisplayNodeRow[]).map(normalizeDisplayNode));
};

const syncLocalDisplayNodesToSupabase = async () => {
  if (!supabase) {
    return null;
  }

  const localNodes = getLocalDisplayNodes();

  if (!localNodes.length) {
    return null;
  }

  const { error } = await supabase.from("display_nodes").upsert(localNodes.map(toDisplayNodeRow), { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }

  clearLocalDisplayNodeFallback();
  return mergeDisplayNodeLists(await listSupabaseDisplayNodes(), localNodes);
};

const getFallbackBaseDisplayNodes = async () => {
  const localNodes = getLocalDisplayNodes();

  if (!supabase) {
    return localNodes;
  }

  try {
    const supabaseNodes = await listSupabaseDisplayNodes();
    return mergeDisplayNodeLists(supabaseNodes, localNodes);
  } catch {
    return localNodes;
  }
};

export const listDisplayNodes = async (): Promise<DisplayNode[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return sortDisplayNodes(getLocalDisplayNodes());
  }

  if (isLocalDisplayNodeFallbackEnabled()) {
    try {
      const syncedNodes = await syncLocalDisplayNodesToSupabase();
      return syncedNodes || sortDisplayNodes(getLocalDisplayNodes());
    } catch (syncError) {
      console.warn("Supabase display_nodes fallback sync failed.", (syncError as Error).message);
      return sortDisplayNodes(getLocalDisplayNodes());
    }
  }

  try {
    return await listSupabaseDisplayNodes();
  } catch (listError) {
    enableLocalDisplayNodeFallback((listError as Error).message);
    return sortDisplayNodes(getLocalDisplayNodes());
  }
};

export const saveDisplayNode = async (node: DisplayNode | DisplayNodeInput): Promise<DisplayNode> => {
  const maybeNode = node as Partial<DisplayNode>;
  const isExistingNode = Boolean(maybeNode.id);

  if (!isSupabaseConfigured || !supabase) {
    return saveDisplayNodeLocally(node);
  }

  try {
    const nextNode = normalizeDisplayNode({
      ...node,
      id: isExistingNode ? maybeNode.id : createDisplayNodeId(),
      sortOrder: isExistingNode ? maybeNode.sortOrder : await getNextSupabaseSortOrder(),
    });

    const { data, error } = await supabase
      .from("display_nodes")
      .upsert(toDisplayNodeRow(nextNode), { onConflict: "id" })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    clearLocalDisplayNodeFallback();
    return normalizeDisplayNode(data as DisplayNodeRow);
  } catch (saveError) {
    enableLocalDisplayNodeFallback((saveError as Error).message);
    return saveDisplayNodeLocally(node, await getFallbackBaseDisplayNodes());
  }
};

export const deleteDisplayNode = async (nodeId: string) => {
  if (!isSupabaseConfigured || !supabase) {
    saveLocalDisplayNodes(getLocalDisplayNodes().filter((node) => node.id !== nodeId));
    return;
  }

  const { error } = await supabase.from("display_nodes").delete().eq("id", nodeId);

  if (error) {
    enableLocalDisplayNodeFallback(error.message);
    saveLocalDisplayNodes((await getFallbackBaseDisplayNodes()).filter((node) => node.id !== nodeId));
  }
};

export const reorderDisplayNodes = async (nodes: DisplayNode[]) => {
  const orderedNodes = (Array.isArray(nodes) ? nodes : [])
    .map(normalizeDisplayNode)
    .map((node, index) => ({ ...node, sortOrder: index + 1 }));

  if (!isSupabaseConfigured || !supabase) {
    saveLocalDisplayNodes(orderedNodes);
    return orderedNodes;
  }

  const { error } = await supabase.from("display_nodes").upsert(orderedNodes.map(toDisplayNodeRow), { onConflict: "id" });

  if (error) {
    enableLocalDisplayNodeFallback(error.message);
    saveLocalDisplayNodes(orderedNodes);
  }

  return orderedNodes;
};

export const subscribeDisplayNodes = (onChange: (nodes: DisplayNode[]) => void) => {
  const localChannel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;

  if (localChannel) {
    localChannel.onmessage = (event) => {
      useLocalDisplayNodeFallback = true;
      const nodes = Array.isArray(event.data) ? event.data.map(normalizeDisplayNode) : [];
      onChange(sortDisplayNodes(nodes));
    };
  }

  if (isLocalDisplayNodeFallbackEnabled() || !isSupabaseConfigured || !supabase) {
    return () => {
      localChannel?.close();
    };
  }

  const client = supabase;
  const channel = client
    .channel("showroom-display-nodes")
    .on("postgres_changes", { event: "*", schema: "public", table: "display_nodes" }, () => {
      void listDisplayNodes().then(onChange);
    })
    .subscribe();

  return () => {
    localChannel?.close();
    void client.removeChannel(channel);
  };
};

export const productToDisplayNode = (product: Product, index = 0): DisplayNode =>
  normalizeDisplayNode(
    {
      id: product.id,
      type: "product",
      title: product.name,
      body: product.description,
      category: product.category,
      price: product.price,
      specs: product.specs,
      imageUrl: product.imageUrl,
      modelUrl: product.modelUrl,
      modelEmbedUrl: product.modelEmbedUrl,
      linkUrl: product.productUrl,
      featured: product.featured,
      hidden: product.hidden,
      sortOrder: (Number(product.sortOrder) || index + 1) + 100,
      template: product.featured ? "product-feature" : "product-standard",
    },
    index,
  );

export const businessCardToDisplayNode = (card: BusinessCard, index = 0): DisplayNode =>
  normalizeDisplayNode(
    {
      id: card.id,
      type: "business_card",
      title: card.name,
      subtitle: card.role,
      body: card.note,
      category: "Showroom Team",
      imageUrl: card.imageUrl,
      accentColor: card.accentColor,
      hidden: card.hidden,
      sortOrder: index + 10,
      template: "contact",
      settings: {
        phone: card.phone,
        email: card.email,
        website: card.website,
      },
    },
    index,
  );
