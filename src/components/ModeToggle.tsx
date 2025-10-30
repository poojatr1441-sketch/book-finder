import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

/**
 * ModeToggle
 *
 * Small toggle button that switches the global app mode between "normal" and "student".
 * - Reads `mode` and `setMode` from AppContext.
 * - Toggles the mode on click without performing any other side effects.
 * - Lightweight, keyboard-accessible button with clear label and emoji affordance.
 *
 * Notes:
 * - This component intentionally keeps logic minimal; mode persistence or analytics
 *   (if desired) should be implemented at the AppContext level or in a wrapper.
 * - Replace emoji labels with icons/SVGs if you want consistent styling across platforms.
 */
export default function ModeToggle() {
  const ctx = useContext(AppContext);
  if (!ctx) return null;
  const { mode, setMode } = ctx;
  return (
    <button
      onClick={() => setMode(mode === "normal" ? "student" : "normal")}
      className="px-3 py-1 rounded-md border dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-sm"
    >
      {mode === "normal" ? "🎓 Student Mode" : "🧑‍💻 Normal Mode"}
    </button>
  );
}
