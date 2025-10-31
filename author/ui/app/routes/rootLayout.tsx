import {Outlet} from "react-router";
import {ThemeProvider} from "~/components/ThemeProvider";
import TopBar from "~/components/aemm/TopBar";

export default function RootLayout() {
  return (
      <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
        <div className="min-h-screen">
          <TopBar/>
          <main className="flex-1">
            <Outlet/>
          </main>
        </div>
      </ThemeProvider>
  );
}