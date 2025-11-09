import { Outlet } from "react-router";
import { ThemeProvider } from "~/components/ThemeProvider";
import TopBar from "~/components/aemm/TopBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 30 * 1000,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="h-screen flex flex-col">
          <TopBar />
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
