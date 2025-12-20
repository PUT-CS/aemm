import COMPONENT_REGISTRY from "~/components/authoring/registry";
import AEMMContainerComponent from "~/components/authoring/AEMMContainerComponent";

export function useDragDropHandlers(
  nodes: any[],
  addNode: (type: string, parentId: string | null) => string,
  moveNode: (
    nodeId: string,
    newParentId: string | null,
    newIndex: number,
  ) => void,
  getNodeIndex: (
    nodeId: string,
  ) => { parentId: string | null; index: number } | null,
  setPendingMove: (
    move: { nodeId: string; parentId: string | null; index: number } | null,
  ) => void,
) {
  const findNode = (nodes: any[], id: string): any => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = findNode(node.children || [], id);
      if (found) return found;
    }
    return null;
  };

  const handleAddComponent = (type: string, overId: string) => {
    if (overId === "canvas") {
      addNode(type, null);
      return;
    }

    if (!overId.includes(":")) {
      return;
    }

    const [dropType, targetNodeId] = overId.split(":");

    if (!targetNodeId) {
      return;
    }

    if (dropType === "inside") {
      addNode(type, targetNodeId);
      return;
    }

    const targetInfo = getNodeIndex(targetNodeId);
    if (!targetInfo) {
      return;
    }

    const nodeId = addNode(type, targetInfo.parentId);

    if (dropType === "before") {
      setPendingMove({
        nodeId,
        parentId: targetInfo.parentId,
        index: targetInfo.index,
      });
    } else if (dropType === "after") {
      setPendingMove({
        nodeId,
        parentId: targetInfo.parentId,
        index: targetInfo.index + 1,
      });
    }
  };

  const handleMoveNode = (nodeId: string, overId: string) => {
    if (overId === "canvas") {
      moveNode(nodeId, null, nodes.length);
      return;
    }

    const [dropType, targetNodeId] = overId.split(":");
    if (nodeId === targetNodeId) return;

    const sourceInfo = getNodeIndex(nodeId);
    const targetInfo = getNodeIndex(targetNodeId);

    if (!targetInfo) return;

    if (dropType === "before") {
      moveNode(nodeId, targetInfo.parentId, targetInfo.index);
    } else if (dropType === "after") {
      const targetIndex =
        sourceInfo?.parentId === targetInfo.parentId &&
        sourceInfo.index < targetInfo.index
          ? targetInfo.index
          : targetInfo.index + 1;
      moveNode(nodeId, targetInfo.parentId, targetIndex);
    } else if (dropType === "inside") {
      const targetNode = findNode(nodes, targetNodeId);
      if (!targetNode) return;

      const Component =
        COMPONENT_REGISTRY[targetNode.type as keyof typeof COMPONENT_REGISTRY];
      const canHaveChildren =
        Component?.prototype instanceof AEMMContainerComponent;

      if (canHaveChildren) {
        moveNode(nodeId, targetNodeId, targetNode.children.length);
      }
    }
  };

  const handleDragEnd = ({ active, over }: any) => {
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Reject drops on sidebar
    if (overId === "sidebar") {
      return;
    }

    // Only accept drops on valid drop zones
    const isValidDropZone =
      overId === "canvas" ||
      overId.startsWith("before:") ||
      overId.startsWith("after:") ||
      overId.startsWith("inside:");

    if (!isValidDropZone) {
      return;
    }

    if (activeId.startsWith("component:")) {
      const type = activeId.replace("component:", "");
      handleAddComponent(type, overId);
    } else if (activeId.startsWith("node:")) {
      const nodeId = activeId.replace("node:", "");
      handleMoveNode(nodeId, overId);
    }
  };

  return {
    handleDragEnd,
    findNode,
  };
}
