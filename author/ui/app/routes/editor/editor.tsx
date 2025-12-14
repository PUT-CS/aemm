import React from "react";
import type { Route } from "../+types/login";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import COMPONENT_REGISTRY from "~/components/authoring/registry";
import AEMMContainerComponent from "~/components/authoring/AEMMContainerComponent";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  EditorContextProvider,
  useEditorContext,
} from "~/routes/editor/EditorContextProvider";
import { Draggable } from "~/routes/editor/Draggable";
import AuthoringOverlay from "~/routes/editor/AuthoringOverlay";
import { FaPlus } from "react-icons/fa6";

// Client-only route - prevents SSR hydration mismatch with dnd-kit
export async function clientLoader() {
  return null;
}

export function HydrateFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">Loading...</div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Editor | AEMM" }];
}

function CanvasDropZone({ isEmpty }: { isEmpty: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-24 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
        isEmpty
          ? "border-gray-300 bg-gray-50"
          : "border-transparent hover:border-gray-300"
      } ${isOver ? "border-blue-500 bg-blue-50" : ""}`}
    >
      {isEmpty ? (
        <div className="text-gray-400 text-sm">
          <FaPlus size={24} />
        </div>
      ) : (
        isOver && (
          <div className="text-blue-600 text-sm font-medium">
            Drop here to add to root
          </div>
        )
      )}
    </div>
  );
}

function EditorInner() {
  const { nodes, addNode, setSelectedId, moveNode, getNodeIndex } =
    useEditorContext();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );

  const handleDragStart = ({ active }: any) => {
    setActiveId(active.id);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

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

    const [dropType, targetNodeId] = overId.split(":");
    const targetInfo = getNodeIndex(targetNodeId);

    if (!targetInfo) return;

    const nodeId = addNode(
      type,
      dropType === "inside" ? targetNodeId : targetInfo.parentId,
    );

    if (dropType === "before") {
      moveNode(nodeId, targetInfo.parentId, targetInfo.index);
    } else if (dropType === "after") {
      moveNode(nodeId, targetInfo.parentId, targetInfo.index + 1);
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
    setActiveId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId.startsWith("component:")) {
      const type = activeId.replace("component:", "");
      handleAddComponent(type, overId);
    } else if (activeId.startsWith("node:")) {
      const nodeId = activeId.replace("node:", "");
      handleMoveNode(nodeId, overId);
    }
  };

  const getActiveNode = () => {
    if (!activeId) return null;
    if (activeId.startsWith("node:")) {
      const nodeId = activeId.replace("node:", "");
      return findNode(nodes, nodeId);
    }
    return null;
  };

  const activeNode = getActiveNode();

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      sensors={sensors}
      collisionDetection={closestCenter}
    >
      <SidebarProvider>
        <Sidebar variant="sidebar" collapsible="offcanvas">
          <SidebarHeader>Components</SidebarHeader>
          <SidebarContent className="p-2">
            {Object.keys(COMPONENT_REGISTRY).map((component) => (
              <Draggable key={component} id={`component:${component}`}>
                <div className="p-2 mb-2 border rounded cursor-grab hover:bg-gray-100">
                  {component}
                </div>
              </Draggable>
            ))}
          </SidebarContent>
          <SidebarFooter />
        </Sidebar>
        <SidebarTrigger />
        <div
          id="editor-canvas"
          className="flex-1 p-4 isolate text-base"
          onClick={() => setSelectedId(null)}
        >
          {nodes.map((node) => (
            <AuthoringOverlay key={node.id} node={node} />
          ))}
          <CanvasDropZone isEmpty={nodes.length === 0} />
          <div className="mt-4 text-xs text-gray-500">
            {JSON.stringify(nodes, null, 2)}
          </div>
        </div>
      </SidebarProvider>
      <DragOverlay dropAnimation={null}>
        {activeNode ? (
          <div className="border-2 border-blue-500 bg-white rounded shadow-lg p-2 opacity-90">
            <div className="text-xs font-semibold text-blue-600">
              {activeNode.type}
            </div>
          </div>
        ) : activeId?.startsWith("component:") ? (
          <div className="border-2 border-blue-500 bg-white rounded shadow-lg p-2 opacity-90">
            <div className="text-xs font-semibold text-blue-600">
              {activeId.split(":")[1]}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default function Editor() {
  return (
    <EditorContextProvider>
      <EditorInner />
    </EditorContextProvider>
  );
}
