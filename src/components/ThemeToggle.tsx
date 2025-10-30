import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
/**
 * ThemeToggle
 *
 * Small, self-contained button that toggles the global theme between "light" and "dark".
 * - Reads `theme` and `setTheme` from AppContext.
 * - Toggles theme on click and updates visual label accordingly.
 * - Keeps logic minimal; persistence (localStorage) or analytics should live in AppContext.
 *
 * Accessibility:
 * - Uses a plain button element for keyboard accessibility.
 * - Consider adding `aria-pressed` or an accessible label if you need to expose state to assistive tech.
 *
 * Styling:
 * - Uses simple utility classes for quick theming; replace with your design tokens if needed.
 */
export default function ThemeToggle() {
  const ctx = useContext(AppContext);
  if (!ctx) return null;
  const { theme, setTheme } = ctx;
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="px-3 py-1 rounded-md border dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-sm"
    >
      {theme === "light" ? "🌙 Dark" : "🌞 Light"}
    </button>
  );
}
