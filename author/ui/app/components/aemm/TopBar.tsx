import { useTheme } from "~/components/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { FaMoon, FaRightFromBracket, FaSun } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "~/lib/auth";

function ThemeSwitcher() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <FaSun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <FaMoon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LogoutButton() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <Button variant="outline" size="icon" onClick={handleLogout}>
      <FaRightFromBracket className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Log out</span>
    </Button>
  );
}

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <a href="/" className="font-bold">
          AEMM Author
        </a>
        <div className="flex gap-2">
          <ThemeSwitcher />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
