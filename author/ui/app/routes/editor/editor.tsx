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

export function meta({}: Route.MetaArgs) {
  return [{ title: "Editor | AEMM" }];
}

export default function Editor() {
  const components = Object.keys(COMPONENT_REGISTRY);
  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="offcanvas">
        <SidebarHeader>Sidebar header</SidebarHeader>
        <SidebarContent>
          {components.map((component) => (
            <div
              key={component}
              className="p-2 mb-2 border border-gray-300 rounded cursor-move hover:bg-gray-100"
            >
              {component}
            </div>
          ))}
        </SidebarContent>
        <SidebarFooter>Sidebar footer</SidebarFooter>
      </Sidebar>
      <SidebarTrigger />
      <main className="flex-1 p-4 overflow-auto">
        <div>Page content</div>
      </main>
    </SidebarProvider>
  );
}
