import AEMMContainerComponent from "~/components/authoring/AEMMContainerComponent";
import RenderComponent from "~/routes/editor/RenderComponent";
import {
  type EditorNode,
  useEditorContext,
} from "~/routes/editor/EditorContextProvider";
import COMPONENT_REGISTRY from "~/components/authoring/registry";
import { Droppable } from "~/routes/editor/Droppable";
import { FaCaretUp, FaPlus, FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import React from "react";

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(node.id);
  };

  const handleSelectParent = (e: React.MouseEvent) => {
    e.stopPropagation();
    const parent = getParentNode(node.id);
    if (parent) {
      setSelectedId(parent.id);
    }
  };

  const canHaveChildren = Component.prototype instanceof AEMMContainerComponent;

  const children = node.children.map((child) => (
    <AuthoringOverlay key={child.id} node={child} />
  ));

  const hasParent = getParentNode(node.id) !== null;

  const isSelected = selectedId === node.id;

  const pillClasses =
    "px-3 h-7 text-xs leading-none text-white rounded-lg flex items-center justify-center";
  const pillButtonBase = pillClasses + " cursor-pointer";
  const pillButtonBlue = pillButtonBase + " bg-blue-600 hover:bg-blue-700";
  const pillLabel = pillClasses + " bg-slate-600 pointer-events-none";
  const iconSize = 12;

  return (
    <div
      className={`py-1 border relative min-h-8 cursor-pointer z-10 ${isSelected ? "outline-2 outline-blue-500 rounded-lg z-30" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedId(node.id);
      }}
    >
      {isSelected && (
        <div className="absolute flex gap-1 -top-3 left-2 z-20">
          <div className={pillLabel}>{node.type}</div>
          <div className={pillLabel}>{node.id}</div>
          <button className={pillButtonBlue}>
            <FaEdit size={iconSize} />
          </button>
          <button
            onClick={handleDelete}
            className={pillButtonBase + " bg-red-600 hover:bg-red-700"}
          >
            <FaTrashCan size={iconSize} />
          </button>
          {hasParent && (
            <button
              onClick={handleSelectParent}
              className={pillButtonBlue + " !px-2"}
            >
              <FaCaretUp size={iconSize} />
            </button>
          )}
        </div>
      )}
      <RenderComponent
        Component={Component}
        props={node.props}
        children={children}
      />
      {canHaveChildren && (
        <Droppable id={node.id}>
          <div className="text-xs text-gray-400">
            <FaPlus />
          </div>
        </Droppable>
      )}
      <div className="text-xs text-gray-500 mt-1">
        {JSON.stringify(node.props, null, 2)}
      </div>
    </div>
  );
}
