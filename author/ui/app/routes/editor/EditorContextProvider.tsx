import type { ReactNode } from "react";
import React, { createContext, useCallback, useContext, useState } from "react";
import COMPONENT_REGISTRY from "~/components/authoring/registry";

export interface EditorNode {
  id: string;
  type: string;
  props: Record<string, any>;
  children: EditorNode[];
}

function generateId() {
  return `node-${Date.now()}-${Math.random().toString(36).slice(3, 10)}`;
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

export function useEditor() {
  const [nodes, setNodes] = useState<EditorNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  return {
    nodes,
    selectedId,
    setSelectedId,
    addNode,
    deleteNode,
    updateNode,
    moveNode,
    getParentNode,
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

export function EditorContextProvider({ children }: { children: ReactNode }) {
  const value = useEditor();
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
