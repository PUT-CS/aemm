import { Outlet } from "react-router";
import { ThemeProvider } from "~/components/ThemeProvider";
import TopBar from "~/components/aemm/TopBar";

export default function RootLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto">{children ?? <Outlet />}</main>
      </div>
    </ThemeProvider>
  );
}
