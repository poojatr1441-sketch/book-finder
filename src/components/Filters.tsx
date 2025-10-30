import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

/**
 * Filters shape used by Filters component and parent App
 * - subject/resourceType were added elsewhere; keep shape minimal and explicit here
 */
type Filters = {
  sortByYear?: "newest" | "oldest" | "";
  language?: string;
  category?: string;
  format?: "ebook" | "print" | "";
  resourceType?: string;
};

type Props = {
  filters: Filters;
  setFilters: (f: Filters) => void;
};
/* Static option lists used by the selects.
   Keep these small and human-friendly; keys map to your backend/search parameters. */
const GENRES = [
  { key: "", label: "Genre" },
  { key: "fiction", label: "Fiction" },
  { key: "fantasy", label: "Fantasy" },
  { key: "romance", label: "Romance" },
  { key: "mystery", label: "Mystery" },
  { key: "crime", label: "Crime" },
  { key: "thriller", label: "Thriller" },
  { key: "science fiction", label: "Science Fiction" },
  { key: "historical fiction", label: "Historical Fiction" },
  { key: "non-fiction", label: "Non-Fiction" },
  { key: "biography", label: "Biography" },
  { key: "history", label: "History" },
  { key: "self-help", label: "Self-Help" },
  { key: "philosophy", label: "Philosophy" },
  { key: "business", label: "Business" },
  { key: "technology", label: "Technology" },
  { key: "poetry", label: "Poetry" },
  { key: "humor", label: "Humor" },
  { key: "graphic novel", label: "Graphic Novel" },
  { key: "young adult", label: "Young Adult" },
  { key: "children", label: "Children" },
];

const STUDENT_SUBJECTS = [
  { key: "", label: "Subjects" },
  { key: "health_and_wellness", label: "Health & Wellness" },
  { key: "history", label: "History" },
  { key: "textbooks", label: "Textbooks" },
  { key: "biography", label: "Biography" },
  { key: "social_sciences", label: "Social Sciences" },
  { key: "arts", label: "Arts" },
  { key: "business_finance", label: "Business & Finance" },
  { key: "science_mathematics", label: "Science & Mathematics" },
];

const RESOURCE_TYPES = [
  { key: "", label: "Resource Type" },
  { key: "study_guide", label: "Study Guide" },
  { key: "textbook", label: "Textbook" },
  { key: "lecture_notes", label: "Lecture Notes" },
  { key: "past_papers", label: "Past Papers" },
  { key: "problem_sets", label: "Problem Sets" },
  { key: "reference", label: "Reference" },
  { key: "open_textbook", label: "Open Textbook" },
  { key: "case_studies", label: "Case Studies" },
];
/**
 * Filters component
 *
 * - Renders the filter controls used alongside the search bar:
 *   - Category / Subjects select (switches list in studentMode)
 *   - Language select
 *   - Resource Type (only in student mode)
 *   - Sort segmented control (Relevance / Newest / Oldest)
 *   - Format segmented control (Any / eBook / Print)
 *
 * - Responsibility: update the `filters` object via setFilters only.
 * - Accessibility: selects and buttons include aria attributes and visually-hidden labels.
 * - Styling: Tailwind utility classes are used; adjust tokens to match your design system.
 */
export default function Filters({ filters, setFilters }: Props) {
  const ctx = useContext(AppContext);
  const studentMode = !!ctx?.studentMode;

  return (
    <div className="mt-4 flex flex-col gap-3">
      {/* Top row (wraps on small screens): category/subjects + language */}
      <div className="flex items-center gap-3 w-full flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <label className="sr-only" htmlFor="category-select">
            {studentMode ? "Subjects" : "Genre"}
          </label>

          <div className="relative flex-1 min-w-0">
            <select
              id="category-select"
              value={filters.category ?? ""}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="select-compact w-full sm:w-auto min-w-0 pr-8 pl-3 py-2 rounded-md bg-[color:var(--surface)] border dark:bg-[color:var(--surface)] dark:border-slate-700 shadow-sm text-sm text-[color:var(--text)] transition-shadow focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
              aria-label={studentMode ? "Choose subject" : "Choose genre"}
            >
              {(studentMode ? STUDENT_SUBJECTS : GENRES).map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </select>

            <svg
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted)]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filters.language ?? ""}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              className="select-compact w-full sm:w-auto min-w-0 pr-8 pl-3 p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 bg-[color:var(--surface)] shadow-sm text-sm"
              aria-label="Choose language"
            >
              <option value="">Language</option>
              <option value="eng">English</option>
              <option value="hin">Hindi</option>
              <option value="spa">Spanish</option>
              <option value="fre">French</option>
            </select>

            <svg
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted)]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Middle row: resource type only when studentMode (keeps compact on small screens) */}
      {studentMode && (
        <div className="flex items-center gap-3 w-full">
          <label className="sr-only" htmlFor="resource-type-select">
            Resource Type
          </label>
          <div className="relative w-full sm:w-auto min-w-0">
            <select
              id="resource-type-select"
              value={filters.resourceType ?? ""}
              onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
              className="select-compact w-full sm:w-auto min-w-0 pr-8 pl-3 py-2 rounded-md bg-[color:var(--surface)] border dark:bg-[color:var(--surface)] dark:border-slate-700 shadow-sm text-sm text-[color:var(--text)] transition-shadow focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
              aria-label="Choose resource type"
            >
              {RESOURCE_TYPES.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>

            <svg
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted)]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
            </svg>
          </div>
        </div>
      )}

      {/* Bottom row: sort + format controls — stack on xs, inline on sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 bg-[color:var(--surface)] dark:bg-[color:var(--surface)] p-1 rounded-lg shadow-sm flex-wrap">
          <button
            onClick={() => setFilters({ ...filters, sortByYear: "" })}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              !filters.sortByYear
                ? "bg-[color:var(--primary)] text-white"
                : "text-[color:var(--muted)] hover:bg-[color:var(--primary-700)]/5"
            }`}
            aria-pressed={!filters.sortByYear}
            title="Clear sort"
          >
            Relevance
          </button>

          <button
            onClick={() => setFilters({ ...filters, sortByYear: "newest" })}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filters.sortByYear === "newest"
                ? "bg-[color:var(--primary)] text-white"
                : "text-[color:var(--muted)] hover:bg-[color:var(--primary-700)]/5"
            }`}
            aria-pressed={filters.sortByYear === "newest"}
            title="Sort newest first"
          >
            Newest
          </button>

          <button
            onClick={() => setFilters({ ...filters, sortByYear: "oldest" })}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filters.sortByYear === "oldest"
                ? "bg-[color:var(--primary)] text-white"
                : "text-[color:var(--muted)] hover:bg-[color:var(--primary-700)]/5"
            }`}
            aria-pressed={filters.sortByYear === "oldest"}
            title="Sort oldest first"
          >
            Oldest
          </button>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-lg bg-[color:var(--surface)] shadow-sm">
          <button
            onClick={() => setFilters({ ...filters, format: "" })}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              !filters.format
                ? "bg-white dark:bg-slate-800 text-[color:var(--text)]"
                : "text-[color:var(--muted)] hover:bg-[color:var(--primary-700)]/5"
            }`}
            aria-pressed={!filters.format}
            title="Any format"
          >
            Any
          </button>

          <button
            onClick={() => setFilters({ ...filters, format: "ebook" })}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filters.format === "ebook"
                ? "bg-[color:var(--primary)] text-white"
                : "text-[color:var(--muted)] hover:bg-[color:var(--primary-700)]/5"
            }`}
            aria-pressed={filters.format === "ebook"}
            title="Show ebooks"
          >
            eBook
          </button>

          <button
            onClick={() => setFilters({ ...filters, format: "print" })}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filters.format === "print"
                ? "bg-[color:var(--primary)] text-white"
                : "text-[color:var(--muted)] hover:bg-[color:var(--primary-700)]/5"
            }`}
            aria-pressed={filters.format === "print"}
            title="Show prints"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
