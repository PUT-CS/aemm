import React from "react";

interface RenderComponentProps {
  Component: React.ComponentType;
  props: Record<string, any>;
  children: React.ReactNode[];
}

export default function RenderComponent({
  Component,
  props,
  children,
}: RenderComponentProps) {
  const element = React.createElement(Component, props, children);

  return <>{element}</>;
}
