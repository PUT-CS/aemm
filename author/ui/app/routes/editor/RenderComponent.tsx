import React from "react";
import type { EditorNode } from "~/routes/editor/EditorContextProvider";
import { useEditorContext } from "~/routes/editor/EditorContextProvider";
import COMPONENT_REGISTRY from "~/components/authoring/registry";
import AEMMContainerComponent from "~/components/authoring/AEMMContainerComponent";
import { Droppable } from "~/routes/editor/Droppable";
import { FaCaretUp, FaPlus, FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

interface RenderComponentProps {
  node: EditorNode;
}

export default function RenderComponent({ node }: RenderComponentProps) {
  const { selectedId, setSelectedId, deleteNode, getParentNode } =
    useEditorContext();
  const Component =
    COMPONENT_REGISTRY[node.type as keyof typeof COMPONENT_REGISTRY];

  if (!Component) {
    return <div>Unknown component: {node.type}</div>;
  }

  const canHaveChildren = Component.prototype instanceof AEMMContainerComponent;

  const children = node.children.map((child) => (
    <RenderComponent key={child.id} node={child} />
  ));

  const element = React.createElement(
    Component as React.ComponentType<any>,
    node.props,
    ...children,
  );

  const hasParent = getParentNode(node.id) !== null;

  const isSelected = selectedId === node.id;

  const pillClasses =
    "px-3 py-2 text-xs leading-none text-white rounded-lg flex items-center justify-center";
  const iconSize = 12;

  return (
    <div
      className={`py-1 border relative min-h-8 cursor-pointer z-10 ${isSelected ? "outline-2 outline-blue-500 rounded-lg" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedId(node.id);
      }}
    >
      {isSelected && (
        <div className="absolute flex gap-1 -top-3 left-2 z-20">
          <div className={pillClasses + " bg-slate-600 pointer-events-none"}>
            {node.type}
          </div>
          <div className={pillClasses + " bg-slate-600 pointer-events-none"}>
            {node.id}
          </div>
          <button
            className={
              pillClasses + " bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }
          >
            <FaEdit size={iconSize} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
            className={
              pillClasses + " bg-red-600 hover:bg-red-700 cursor-pointer"
            }
          >
            <FaTrashCan size={iconSize} />
          </button>
          {hasParent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const parent = getParentNode(node.id);
                if (parent) {
                  setSelectedId(parent.id);
                }
              }}
              className={
                pillClasses +
                " bg-blue-600 hover:bg-blue-700 !px-2 cursor-pointer"
              }
            >
              <FaCaretUp size={iconSize} />
            </button>
          )}
        </div>
      )}
      {element}
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
