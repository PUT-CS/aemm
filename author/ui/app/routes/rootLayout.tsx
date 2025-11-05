import { Outlet } from "react-router";
import { ThemeProvider } from "~/components/ThemeProvider";
import TopBar from "~/components/aemm/TopBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function RootLayout() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen">
          <TopBar />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
