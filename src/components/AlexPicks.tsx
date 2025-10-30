import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

/**
 * Meta fields a pick can provide to influence filters.
 * - resourceType: maps to smart search resource types (textbook, study_guide, etc.)
 * - subject: mapped into filters.category so existing search logic stays compatible
 */
type Meta = {
  resourceType?: string;
  subject?: string;
};

/**
 * Component props
 * - setQuery: updates the SearchBar input value
 * - setFilters: updates the global/local filters object
 * - className: optional wrapper classes (keeps component flexible)
 */
type Props = {
  setQuery: (q: string) => void;
  setFilters: (f: any) => void;
  className?: string;
};

/**
 * AlexPicks
 *
 * Mobile-friendly adjustments:
 * - Mobile-first layout: chips wrap on larger screens, horizontally scroll on very small screens.
 * - Buttons use whitespace-nowrap so each chip stays compact and doesn't break into multiple lines.
 * - Reduced padding and compact typography on xs screens; full labels visible on sm+.
 * - Overflow styling keeps the UX snappy on touch devices.
 */
export default function AlexPicks({ setQuery, setFilters, className = "" }: Props) {
  const ctx = useContext(AppContext);
  const studentMode = !!ctx?.studentMode;

  /* ---------------------------
     Pick definitions (static)
     --------------------------- */
  const studentPicks = [
    { id: "s1", label: "Textbooks — Science & Math", q: "textbook science", meta: { resourceType: "textbook", subject: "science" } },
    { id: "s2", label: "Exam / Past Papers", q: "past papers", meta: { resourceType: "past_papers" } },
    { id: "s3", label: "Study Guides", q: "study guide", meta: { resourceType: "study_guide" } },
    { id: "s4", label: "Lecture Notes & Problem Sets", q: "lecture notes problem set", meta: { resourceType: "lecture_notes" } },
    { id: "s5", label: "Open Textbooks (free)", q: "open textbook", meta: { resourceType: "open_textbook" } },
    { id: "s6", label: "Career & Skill Books", q: "career development skills", meta: { subject: "career" } },
    { id: "s7", label: "Student Mental Health", q: "college students mental health", meta: { subject: "mental health" } },
  ];

  const normalPicks = [
    { id: "n1", label: "Fun Reads", q: "light fiction humor" },
    { id: "n2", label: "Comics & Graphic Novels", q: "graphic novels comics" },
    { id: "n3", label: "Fiction Bestsellers", q: "best sellers fiction" },
    { id: "n4", label: "Popular Sci‑Fi", q: "science fiction popular" },
    { id: "n5", label: "Quick Short Reads", q: "short stories" },
    { id: "n6", label: "Award Winners", q: "award winning fiction" },
  ];

  const picks = studentMode ? studentPicks : normalPicks;

  /**
   * handlePick
   * - Updates the search input (so user sees the picked query)
   * - Applies minimal filter changes when the pick provides metadata
   * - Does not auto-run the search, preserving existing SearchBar behavior
   */
  const handlePick = (q: string, meta?: Meta) => {
    setQuery(q);
    if (meta) {
      setFilters((prev: any) => ({
        ...prev,
        ...(meta.resourceType ? { resourceType: meta.resourceType } : {}),
        ...(meta.subject ? { category: meta.subject } : {}),
      }));
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-semibold">{studentMode ? "Alex picks for study" : "Alex picks for you"}</h4>
          <p className="text-xs text-slate-500">{studentMode ? "College subjects, exam prep, wellbeing, careers" : "Fun reads, comics, fiction, bestsellers"}</p>
        </div>
      </div>

      {/* 
        Wrapper behavior:
        - overflow-x-auto and -mx/+px keep a comfortable horizontal scroll area on very small screens
        - On sm+ screens chips wrap naturally thanks to inner flex-wrap container
      */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-wrap gap-2">
          {picks.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePick(p.q, (p as any).meta)}
              // whitespace-nowrap prevents chips from breaking mid-label on very small widths
              className="px-3 py-1 rounded-full border bg-white/0 dark:bg-slate-800 hover:shadow-sm text-sm transition-transform transform hover:-translate-y-0.5 whitespace-nowrap min-h-[36px]"
              aria-label={`Search ${p.label}`}
              title={p.label}
            >
              {/* On tiny screens keep label compact; full label remains on wider screens */}
              <span className="inline-block max-w-[10rem] truncate">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
