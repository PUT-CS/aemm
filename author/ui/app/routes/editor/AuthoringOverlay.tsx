import AEMMContainerComponent from "~/components/authoring/AEMMContainerComponent";
import RenderComponent from "~/routes/editor/RenderComponent";
import {
  type EditorNode,
  useEditorContext,
} from "~/routes/editor/EditorContextProvider";
import COMPONENT_REGISTRY from "~/components/authoring/registry";
import { FaCaretUp, FaGripVertical, FaPlus, FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

const PILL_BASE =
  "px-3 h-7 text-xs leading-none text-white rounded-lg flex items-center justify-center";
const PILL_BUTTON = PILL_BASE + " cursor-pointer";
const PILL_BLUE = PILL_BUTTON + " bg-blue-600 hover:bg-blue-700";
const PILL_GRAY = PILL_BUTTON + " bg-gray-600 hover:bg-gray-700";
const PILL_RED = PILL_BUTTON + " bg-red-600 hover:bg-red-700";
const PILL_LABEL = PILL_BASE + " bg-slate-600 pointer-events-none";
const ICON_SIZE = 12;

interface AuthoringOverlayProps {
  node: EditorNode;
}

export default function AuthoringOverlay({ node }: AuthoringOverlayProps) {
  const { selectedId, setSelectedId, deleteNode, getParentNode } =
    useEditorContext();

  const Component = COMPONENT_REGISTRY[
    node.type as keyof typeof COMPONENT_REGISTRY
  ] as React.ComponentType<any>;
  if (!Component) {
    return <div>Unknown component: {node.type}</div>;
  }

  const canHaveChildren = Component.prototype instanceof AEMMContainerComponent;
  const isSelected = selectedId === node.id;
  const hasParent = getParentNode(node.id) !== null;

  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    isDragging,
  } = useDraggable({
    id: `node:${node.id}`,
  });

  const { setNodeRef: setDropBeforeRef, isOver: isOverBefore } = useDroppable({
    id: `before:${node.id}`,
  });

  const { setNodeRef: setDropAfterRef, isOver: isOverAfter } = useDroppable({
    id: `after:${node.id}`,
  });

  const { setNodeRef: setDropInsideRef, isOver: isOverInside } = useDroppable({
    id: `inside:${node.id}`,
    disabled: !canHaveChildren,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(node.id);
  };

  const handleSelectParent = (e: React.MouseEvent) => {
    e.stopPropagation();
    const parent = getParentNode(node.id);
    if (parent) setSelectedId(parent.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId(node.id);
  };

  const children = node.children.map((child) => (
    <AuthoringOverlay key={child.id} node={child} />
  ));

  const dropZoneClasses = (isOver: boolean) =>
    `h-3 -my-1.5 ${isOver ? "bg-blue-500 h-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""}`;

  const nodeClasses = `py-1 border relative min-h-8 cursor-pointer z-10 ${
    isSelected ? "outline-2 outline-blue-500 rounded-lg z-30" : ""
  } ${isDragging ? "opacity-20" : ""}`;

  return (
    <div className="relative">
      <div ref={setDropBeforeRef} className={dropZoneClasses(isOverBefore)} />

      <div ref={setDragNodeRef} className={nodeClasses} onClick={handleClick}>
        {isSelected && (
          <div className="absolute flex gap-1 -top-3 left-2 z-20">
            <div className={PILL_LABEL}>{node.type}</div>
            <div className={PILL_LABEL}>{node.id}</div>
            <button className={PILL_BLUE}>
              <FaEdit size={ICON_SIZE} />
            </button>
            <button onClick={handleDelete} className={PILL_RED}>
              <FaTrashCan size={ICON_SIZE} />
            </button>
            <button
              {...listeners}
              {...attributes}
              className={PILL_GRAY + " !px-2 touch-none"}
              onClick={(e) => e.stopPropagation()}
            >
              <FaGripVertical size={ICON_SIZE} />
            </button>
            {hasParent && (
              <button
                onClick={handleSelectParent}
                className={PILL_BLUE + " !px-2"}
              >
                <FaCaretUp size={ICON_SIZE} />
              </button>
            )}
          </div>
        )}

        {canHaveChildren ? (
          <div ref={setDropInsideRef}>
            <RenderComponent
              Component={Component}
              props={node.props}
              children={children}
            />
            {isOverInside && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 py-3 bg-green-50/50 rounded border border-green-200">
                <FaPlus size={14} />
                <span className="font-medium">Drop here</span>
              </div>
            )}
            {!isOverInside && children.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-2 border border-dashed rounded">
                <FaPlus className="inline" /> Empty
              </div>
            )}
          </div>
        ) : (
          <RenderComponent
            Component={Component}
            props={node.props}
            children={children}
          />
        )}

        <div className="text-xs text-gray-500 mt-1">
          {JSON.stringify(node.props, null, 2)}
        </div>
      </div>

      <div ref={setDropAfterRef} className={dropZoneClasses(isOverAfter)} />
    </div>
  );
}
