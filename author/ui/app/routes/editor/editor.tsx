import React from "react";
import type { Route } from "../+types/login";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  EditorContextProvider,
  useEditorContext,
} from "~/routes/editor/EditorContextProvider";
import { ComponentsSidebar } from "~/routes/editor/ComponentsSidebar";
import { EditorCanvas } from "~/routes/editor/EditorCanvas";
import { DragOverlayContent } from "~/routes/editor/DragOverlayContent";
import { useDragDropHandlers } from "~/routes/editor/useDragDropHandlers";

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

function EditorInner() {
  const { nodes, addNode, moveNode, getNodeIndex } = useEditorContext();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [pendingMove, setPendingMove] = React.useState<{
    nodeId: string;
    parentId: string | null;
    index: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );

  // Custom collision detection: prioritize pointerWithin for better edge detection
  const customCollisionDetection = React.useCallback((args: any) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    const intersectionCollisions = rectIntersection(args);
    if (intersectionCollisions.length > 0) {
      return intersectionCollisions;
    }

    return closestCenter(args);
  }, []);

  const { handleDragEnd, findNode } = useDragDropHandlers(
    nodes,
    addNode,
    moveNode,
    getNodeIndex,
    setPendingMove,
  );

  React.useEffect(() => {
    if (pendingMove) {
      moveNode(pendingMove.nodeId, pendingMove.parentId, pendingMove.index);
      setPendingMove(null);
    }
  }, [pendingMove, moveNode]);

  const handleDragStart = ({ active }: any) => {
    setActiveId(active.id);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const onDragEnd = (event: any) => {
    setActiveId(null);
    handleDragEnd(event);
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
      onDragEnd={onDragEnd}
      onDragCancel={handleDragCancel}
      sensors={sensors}
      collisionDetection={customCollisionDetection}
    >
      <SidebarProvider>
        <ComponentsSidebar />
        <SidebarTrigger />
        <EditorCanvas isDragging={activeId !== null} />
      </SidebarProvider>
      <DragOverlay dropAnimation={null}>
        <DragOverlayContent activeId={activeId} activeNode={activeNode} />
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
