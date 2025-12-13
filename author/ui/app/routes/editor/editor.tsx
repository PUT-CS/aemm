import type { Route } from "../+types/login";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import COMPONENT_REGISTRY from "~/components/authoring/registry";
import { DndContext } from "@dnd-kit/core";
import {
  EditorContextProvider,
  useEditorContext,
} from "~/routes/editor/EditorContextProvider";
import { Draggable } from "~/routes/editor/Draggable";
import { Droppable } from "~/routes/editor/Droppable";
import RenderComponent from "~/routes/editor/RenderComponent";
import { FaPlus } from "react-icons/fa6";

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
  const { nodes, addNode } = useEditorContext();

  const handleDragEnd = ({ active, over }: any) => {
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Add from sidebar: component:Type
    if (activeId.startsWith("component:")) {
      const type = activeId.split(":")[1];
      const parentId = overId === "canvas" ? null : overId;
      console.log("Adding node", type, "to parent", parentId);
      addNode(type, parentId);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SidebarProvider>
        <Sidebar variant="sidebar" collapsible="offcanvas">
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
        <SidebarTrigger />
        <div className="flex-1">
          {nodes.map((node) => (
            <RenderComponent node={node} />
          ))}
          <Droppable id={"canvas"}>
            <div className="flex items-center justify-center">
              <FaPlus />
            </div>
          </Droppable>
          {JSON.stringify(nodes, null, 2)}
        </div>
      </SidebarProvider>
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
