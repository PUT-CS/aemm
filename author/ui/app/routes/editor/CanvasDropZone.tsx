import { useDroppable } from "@dnd-kit/core";
import { FaPlus } from "react-icons/fa6";

interface CanvasDropZoneProps {
  isEmpty: boolean;
  isDragging: boolean;
}

export function CanvasDropZone({ isEmpty, isDragging }: CanvasDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  // Only show the drop zone when page is empty or when actively dragging
  if (!isEmpty && !isDragging) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      className={`min-h-32 w-full border-2 border-dashed rounded-lg flex items-center justify-center transition-colors p-8 ${
        isEmpty
          ? "border-gray-300 bg-gray-50"
          : isDragging
            ? "border-gray-300 bg-gray-50/50"
            : "border-transparent"
      } ${isOver ? "!border-blue-500 !bg-blue-50" : ""}`}
    >
      {isEmpty ? (
        <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
          <FaPlus size={24} />
          <span className="text-xs">Drop component here</span>
        </div>
      ) : (
        isDragging && (
          <div
            className={`text-sm flex items-center gap-2 ${isOver ? "text-blue-600 font-medium" : "text-gray-400"}`}
          >
            {isOver ? (
              <>
                <FaPlus size={16} />
                <span>Drop here to add to root</span>
              </>
            ) : (
              <>
                <FaPlus size={16} />
                <span className="text-xs">Add to page root</span>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
}
