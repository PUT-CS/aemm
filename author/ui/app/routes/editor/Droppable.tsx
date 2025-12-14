import { useDroppable } from "@dnd-kit/core";
import React from "react";

interface DroppableProps {
  id?: string;
  children: React.ReactNode;
}

export function Droppable({ id = "canvas", children }: DroppableProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 min-h-16 items-center justify-center border border-dashed ${isOver ? "bg-green-100" : ""}`}
    >
      {children}
    </div>
  );
}
