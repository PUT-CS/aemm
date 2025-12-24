import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "~/components/ui/sidebar";
import COMPONENT_REGISTRY from "~/components/authoring/registry";
import { Draggable } from "~/routes/editor/Draggable";
import { useDroppable } from "@dnd-kit/core";

export function ComponentsSidebar() {
  const { setNodeRef } = useDroppable({ id: "sidebar" });

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas" ref={setNodeRef}>
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
  );
}
