import {
    Sidebar as SidebarRoot,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
} from "~/components/ui/sidebar";

export default function AppSidebar() {
    return (
        <SidebarRoot>
            <SidebarHeader>
                <div className="font-semibold px-2">Author</div>
            </SidebarHeader>
            <SidebarContent>
                <nav className="px-2 py-4 space-y-2">
                    <a
                        href="/admin"
                        className="block text-sm text-sidebar-foreground/90 hover:underline"
                    >
                        Admin
                    </a>
                    <a
                        href="/sites"
                        className="block text-sm text-sidebar-foreground/90 hover:underline"
                    >
                        Sites
                    </a>
                    <a
                        href="/editor"
                        className="block text-sm text-sidebar-foreground/90 hover:underline"
                    >
                        Editor
                    </a>
                </nav>
            </SidebarContent>
            <SidebarFooter/>
        </SidebarRoot>
    );
}