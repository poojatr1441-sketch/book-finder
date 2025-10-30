import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
/**
 * StudentModeToggle
 *
 * Small toggle button that flips the app's studentMode flag in AppContext.
 * - Reads `studentMode` and `setStudentMode` from context.
 * - Toggles the boolean on click and exposes aria-pressed for accessibility.
 * - Styling changes to indicate the active state.
 *
 * Notes:
 * - Keep side effects, persistence, or analytics in AppContext rather than here.
 * - Replace emoji with an icon if you want consistent visuals across platforms.
 */
export default function StudentModeToggle() {
  const ctx = useContext(AppContext);
  if (!ctx) return null;
  const { studentMode, setStudentMode } = ctx;

  return (
    <button
      onClick={() => setStudentMode(!studentMode)}
      aria-pressed={studentMode}
      title="Toggle Student Mode"
      className={`px-2 py-1 rounded-full text-sm transition-colors focus:outline-none focus:ring ${
        studentMode
          ? "bg-[color:var(--primary)] text-white"
          : "bg-[color:var(--surface)] text-[color:var(--text)]"
      }`}
    >
      🎓 Student
    </button>
  );
}
