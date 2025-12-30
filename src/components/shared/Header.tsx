import { useCallback } from "react";
import { useTheme, type Theme } from "@/hooks/useTheme";

export default function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
  }, [theme, setTheme]);

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold">My App</h1>
        <nav className="flex items-center gap-4">
          <a href="/" className="text-sm hover:text-primary">
            Dashboard
          </a>
          <button className="text-sm hover:text-primary">Logout</button>
          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="ml-2 rounded border px-2 py-1 text-sm"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </nav>
      </div>
    </header>
  );
}
