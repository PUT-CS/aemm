import React from "react";

export interface DemoContainerProps {
  title: string;
  children: React.ReactNode;
}

export function DemoContainer({ title, children }: DemoContainerProps) {
  return (
    <div className="gap-2">
      <div className="text-lg">{title}</div>
      <div className="border rounded">{children}</div>
    </div>
  );
}
