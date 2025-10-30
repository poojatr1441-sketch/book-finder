import React, { useContext } from "react";
import ThemeToggle from "./ThemeToggle";
import ModeToggle from "./ModeToggle";
import StudentModeToggle from "./StudentModeToggle";
import { AppContext } from "../context/AppContext";

/**
 * Header
 *
 * - Mobile-first layout: compact paddings, smaller logo on xs, subtitle hidden on small screens.
 * - Repository / Favorites button shows a compact badge and trims text on narrow viewports.
 * - Theme and student toggles are visible on larger screens; only theme toggle shown on xs.
 */
export default function Header({
  onToggleFavorites,
}: {
  onToggleFavorites: () => void;
}) {
  const ctx = useContext(AppContext);
  if (!ctx) return null;

  const { favorites, repository, studentMode } = ctx;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-sm bg-white/60 dark:bg-[color:var(--surface)]/60 border-b">
      <div className="max-w-4xl sm:max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-3">
        {/* Left: brand (smaller on xs) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[color:var(--primary)] flex items-center justify-center text-white font-bold shadow-sm text-sm sm:text-base">
              B
            </div>

            <div className="leading-tight">
              <div className="text-base sm:text-lg font-display font-semibold">Book Finder</div>
              {/* hide subtitle on small screens to save space */}
              <div className="text-xs text-[color:var(--muted)] hidden sm:block">Tailored Reads, Just for You.</div>
            </div>
          </div>
        </div>

        {/* Right: actions (compact on xs) */}
        <div className="flex items-center gap-2">
          {/* Repository / Favorites button: compact label and badge */}
          <button
            onClick={onToggleFavorites}
            aria-label={studentMode ? "Open repository" : "Open favorites"}
            className="relative px-2.5 py-1 rounded-md border dark:border-slate-700 bg-[color:var(--surface)] text-sm flex items-center gap-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring"
          >
            <span className="hidden sm:inline">
              {studentMode ? "Repository" : "Favorites"}
            </span>

            {/* emoji/icon shown on xs for a tighter footprint */}
            <span className="inline sm:hidden" aria-hidden>
              {studentMode ? "📚" : "❤️"}
            </span>

            <span
              className={`ml-1 text-[10px] sm:text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                studentMode ? "bg-[color:var(--muted)] text-white" : "bg-red-600 text-white"
              }`}
            >
              {studentMode ? repository.length : favorites.length}
            </span>
          </button>

          {/* Visible on small+ screens: theme + toggles */}
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
           
            <StudentModeToggle />
          </div>

          {/* On extra-small screens show theme + student toggles (compact) */}
<div className="sm:hidden flex items-center gap-2">
  <ThemeToggle />
  <StudentModeToggle />
</div>

        </div>
      </div>
    </header>
  );
}
