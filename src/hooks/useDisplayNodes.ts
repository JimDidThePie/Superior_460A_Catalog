import { useCallback, useEffect, useState } from "react";
import {
  deleteDisplayNode,
  listDisplayNodes,
  reorderDisplayNodes,
  saveDisplayNode,
  subscribeDisplayNodes,
} from "../lib/displayNodeService";
import type { DisplayNode, DisplayNodeInput } from "../types/displayNode";

const sortNodes = (nodes: DisplayNode[]) =>
  [...nodes].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

export function useDisplayNodes() {
  const [nodes, setNodes] = useState<DisplayNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);

    try {
      setNodes(await listDisplayNodes());
      setError("");
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    return subscribeDisplayNodes((nextNodes) => {
      setNodes(nextNodes);
      setError("");
    });
  }, [reload]);

  const upsertNode = useCallback(async (node: DisplayNode | DisplayNodeInput) => {
    try {
      const savedNode = await saveDisplayNode(node);
      setNodes((currentNodes) => {
        const exists = currentNodes.some((item) => item.id === savedNode.id);
        const nextNodes = exists
          ? currentNodes.map((item) => (item.id === savedNode.id ? savedNode : item))
          : [...currentNodes, savedNode];

        return sortNodes(nextNodes);
      });
      setError("");
      return savedNode;
    } catch (saveError) {
      setError((saveError as Error).message);
      throw saveError;
    }
  }, []);

  const duplicateNode = useCallback(async (node: DisplayNode) => {
    try {
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...copy } = node;
      const savedNode = await saveDisplayNode({
        ...copy,
        title: `${node.title || "Untitled Node"} Copy`,
        hidden: true,
      });
      setNodes((currentNodes) => sortNodes([...currentNodes, savedNode]));
      setError("");
      return savedNode;
    } catch (duplicateError) {
      setError((duplicateError as Error).message);
      throw duplicateError;
    }
  }, []);

  const removeNode = useCallback(async (nodeId: string) => {
    try {
      await deleteDisplayNode(nodeId);
      setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId));
      setError("");
    } catch (deleteError) {
      setError((deleteError as Error).message);
      throw deleteError;
    }
  }, []);

  const moveNode = useCallback(async (nodeId: string, direction: "up" | "down") => {
    try {
      const currentNodes = sortNodes(await listDisplayNodes());
      const index = currentNodes.findIndex((node) => node.id === nodeId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || targetIndex < 0 || targetIndex >= currentNodes.length) {
        return;
      }

      const nextNodes = [...currentNodes];
      const [node] = nextNodes.splice(index, 1);
      nextNodes.splice(targetIndex, 0, node);

      setNodes(await reorderDisplayNodes(nextNodes));
      setError("");
    } catch (moveError) {
      setError((moveError as Error).message);
      throw moveError;
    }
  }, []);

  return {
    nodes,
    loading,
    error,
    reload,
    upsertNode,
    duplicateNode,
    removeNode,
    moveNode,
  };
}
