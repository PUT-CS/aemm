import type { ReactNode } from "react";
import React, { createContext, useCallback, useContext, useState } from "react";
import COMPONENT_REGISTRY from "~/components/authoring/registry";
import { BACKEND_URL } from "~/consts";
import type { Page } from "@aemm/common";
import { getAuthToken } from "~/lib/auth";

export interface EditorNode {
  id: string;
  type: string;
  props: Record<string, any>;
  children: EditorNode[];
}

function generateId() {
  return crypto.randomUUID();
}

function getDefaultProps(type: string): Record<string, any> {
  const Component = COMPONENT_REGISTRY[type as keyof typeof COMPONENT_REGISTRY];
  if (!Component) return {};

  try {
    // @ts-ignore
    return Component.defaultProps || {};
  } catch (e) {
    return {};
  }
}

export function useEditor(path: string) {
  const [nodes, setNodes] = useState<EditorNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load content from backend
  const loadContent = useCallback(async () => {
    if (!path) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/scr${path}`);
      if (response.ok) {
        const pageData: Page = await response.json();
        // Extract components from the Page node
        if (pageData.components && Array.isArray(pageData.components)) {
          setNodes(pageData.components as EditorNode[]);
        } else {
          setNodes([]);
        }
      } else if (response.status === 404) {
        // Page doesn't exist yet, start with empty
        setNodes([]);
      } else {
        console.error("Failed to load content:", response.statusText);
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setIsLoading(false);
    }
  }, [path]);

  // Save content to backend
  const saveContent = useCallback(async () => {
    if (!path) return;

    try {
      setIsSaving(true);
      const getResponse = await fetch(`${BACKEND_URL}/scr${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(getAuthToken()
            ? { Authorization: `Bearer ${getAuthToken()}` }
            : {}),
        },
      });
      if (!getResponse.ok) {
        throw new Error("Failed to fetch current page data");
      }

      const currentPage: Page = await getResponse.json();

      // Update only the components field
      const updatedPage: Page = {
        ...currentPage,
        components: nodes,
      };

      // Use PATCH to update the page
      const response = await fetch(`${BACKEND_URL}/scr${path}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(getAuthToken()
            ? { Authorization: `Bearer ${getAuthToken()}` }
            : {}),
        },
        body: JSON.stringify(updatedPage),
      });

      if (!response.ok) {
        console.error("Failed to save content:", response.statusText);
        alert("Failed to save content");
      } else {
        // Success feedback
        console.log("Content saved successfully");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Error saving content");
    } finally {
      setIsSaving(false);
    }
  }, [path, nodes]);

  // Load content on mount or when path changes
  React.useEffect(() => {
    loadContent();
  }, [loadContent]);

  const addNode = useCallback(
    (type: string, parentId: string | null = null) => {
      const newNode: EditorNode = {
        id: generateId(),
        type,
        props: getDefaultProps(type),
        children: [],
      };
      setNodes((prev) =>
        parentId
          ? insertIntoParent(prev, parentId, newNode)
          : [...prev, newNode],
      );
      setSelectedId(newNode.id);
      return newNode.id;
    },
    [],
  );

  const deleteNode = useCallback(
    (id: string) => {
      const parent = findParentById(nodes, id);
      setNodes(removeById(nodes, id));
      setSelectedId((prev) => (prev ? (parent ? parent.id : null) : null));
    },
    [nodes],
  );

  const updateNode = useCallback(
    (id: string, props: Record<string, any>) => {
      setNodes(updateById(nodes, id, props));
    },
    [nodes],
  );

  const moveNode = useCallback(
    (id: string, toParentId: string | null, toIndex: number) => {
      const nodeToMove = findById(nodes, id);
      if (!nodeToMove) {
        throw new Error("Attempt to move a non-existent node");
      }
      const newNodes = removeById(nodes, nodeToMove?.id);
      const nodesWithInserted = insertAt(
        newNodes,
        toParentId,
        nodeToMove,
        toIndex,
      );
      setNodes(nodesWithInserted);
    },
    [nodes],
  );

  const getParentNode = useCallback(
    (nodeId: string): EditorNode | null => {
      return findParentById(nodes, nodeId);
    },
    [nodes],
  );

  const getNodeIndex = useCallback(
    (nodeId: string): { parentId: string | null; index: number } | null => {
      // Check root level
      const rootIndex = nodes.findIndex((n) => n.id === nodeId);
      if (rootIndex !== -1) {
        return { parentId: null, index: rootIndex };
      }

      // Search in children recursively
      const findIndex = (
        children: EditorNode[],
        parentId: string,
      ): { parentId: string | null; index: number } | null => {
        const index = children.findIndex((n) => n.id === nodeId);
        if (index !== -1) {
          return { parentId, index };
        }

        for (const child of children) {
          const found = findIndex(child.children, child.id);
          if (found) return found;
        }
        return null;
      };

      for (const node of nodes) {
        const found = findIndex(node.children, node.id);
        if (found) return found;
      }

      return null;
    },
    [nodes],
  );

  return {
    nodes,
    selectedId,
    setSelectedId,
    addNode,
    deleteNode,
    updateNode,
    moveNode,
    getParentNode,
    getNodeIndex,
    saveContent,
    isLoading,
    isSaving,
  };
}

function findById(nodes: EditorNode[], id: string): EditorNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findById(node.children, id);
    if (found) return found;
  }
  return null;
}

function removeById(tree: EditorNode[], id: string): EditorNode[] {
  const removeRecursively = (node: EditorNode): EditorNode => {
    return {
      ...node,
      children: node.children.filter((n) => n.id !== id).map(removeRecursively),
    };
  };
  return tree.filter((n) => n.id !== id).map(removeRecursively);
}

function updateById(
  nodes: EditorNode[],
  id: string,
  props: Record<string, any>,
): EditorNode[] {
  const updateNode = (node: EditorNode): EditorNode => {
    if (node.id === id) {
      return { ...node, props };
    }

    return {
      ...node,
      children: node.children.map(updateNode),
    };
  };
  return nodes.map(updateNode);
}

function insertIntoParent(
  nodes: EditorNode[],
  parentId: string,
  newNode: EditorNode,
): EditorNode[] {
  const insertIntoNode = (node: EditorNode): EditorNode => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...node.children, newNode],
      };
    }

    return {
      ...node,
      children: node.children.map(insertIntoNode),
    };
  };

  return nodes.map(insertIntoNode);
}

function insertIntoArrayAt<T>(array: T[], element: T, index: number) {
  return [...array.slice(0, index), element, ...array.slice(index)];
}

function insertAt(
  nodes: EditorNode[],
  parentId: string | null,
  nodeToInsert: EditorNode,
  index: number,
): EditorNode[] {
  const insertAtInner = (node: EditorNode): EditorNode => {
    if (node.id === parentId) {
      return {
        ...node,
        children: insertIntoArrayAt(node.children, nodeToInsert, index),
      };
    }

    return {
      ...node,
      children: node.children.map(insertAtInner),
    };
  };

  if (!parentId) {
    return insertIntoArrayAt(nodes, nodeToInsert, index);
  }

  return nodes.map(insertAtInner);
}

function findParentById(tree: EditorNode[], nodeId: string): EditorNode | null {
  for (const node of tree) {
    if (node.children.some((child) => child.id === nodeId)) {
      return node;
    }
    const foundInChildren = findParentById(node.children, nodeId);
    if (foundInChildren) return foundInChildren;
  }
  return null;
}

export type EditorContextValue = ReturnType<typeof useEditor>;
const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorContextProvider({
  children,
  path,
}: {
  children: ReactNode;
  path: string;
}) {
  const value = useEditor(path);
  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditorContext() {
  const ctx = useContext(EditorContext);
  if (!ctx)
    throw new Error(
      "useEditorContext must be used within EditorContextProvider",
    );
  return ctx;
}
