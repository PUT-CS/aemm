import React from "react";
import type { EditorNode } from "~/routes/editor/EditorContextProvider";
import COMPONENT_REGISTRY from "~/components/authoring/registry";
import AEMMContainerComponent from "~/components/authoring/AEMMContainerComponent";
import { Droppable } from "~/routes/editor/Droppable";

interface RenderComponentProps {
  node: EditorNode;
}

export default function RenderComponent({ node }: RenderComponentProps) {
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

  return (
    <div className="p-1 border relative min-h-8">
      <div className="absolute top-0 left-0 p-1 text-xs bg-slate-600 text-white rounded">
        {node.type}
      </div>
      {canHaveChildren ? (
        <>
          <Droppable id={node.id}>{element}</Droppable>
        </>
      ) : (
        <>{element}</>
      )}
      {JSON.stringify(node.props, null, 2)}
    </div>
  );
}
