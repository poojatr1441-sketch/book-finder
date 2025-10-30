import React, { useState, useContext, useEffect } from "react";
import { AppProvider, AppContext } from "./context/AppContext";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Filters from "./components/Filters";
import BookList from "./components/BookList";
import Favorites from "./components/Favorites";
import BookDetailsModal from "./components/BookDetailsModal";
import "./index.css";
import { Book } from "./types";

/**
 * Application-level filter state used across SearchBar and Filters.
 * - subject is included to accept picks metadata; category remains for existing UI.
 * - resourceType is used by the smart resource search helper (if configured).
 */
type FiltersState = {
  sortByYear?: "newest" | "oldest" | "";
  language?: string;
  category?: string;
  subject?: string;
  format?: "ebook" | "print" | "";
  resourceType?: string;
};

/* -------------------------
   Small presentational helpers
   ------------------------- */

function HeroText({ studentMode }: { studentMode: boolean }) {
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [studentMode]);

  // Mobile-first: smaller heading sizes for small screens; scale up on sm/md
  return (
    <div className="hero-wrapper">
      <div
        key={`normal-${animKey}`}
        className={`hero-block ${studentMode ? "hidden" : "visible"}`}
        aria-hidden={studentMode}
      >
        <h1 className="hero-title text-lg sm:text-2xl md:text-3xl">Open a Book, Open your Mind!</h1>
        <p className="hero-sub text-xs sm:text-sm">Discover books — quick preview, save favorites</p>
      </div>

      <div
        key={`student-${animKey}`}
        className={`hero-block ${studentMode ? "visible student" : "hidden"}`}
        aria-hidden={!studentMode}
      >
        <div className="hero-student-row">
          <h1 className="hero-title student-title text-lg sm:text-2xl md:text-3xl">
            Your Gateway to Smarter Learning
            <svg
              className="student-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M12 2L1 7l11 5 9-4.09V17"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 17v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </h1>
        </div>
        <p className="hero-sub small text-xs sm:text-sm">exam study</p>
        <div className="student-underline" aria-hidden />
      </div>
    </div>
  );
}

/* -------------------------
   Main App content component
   ------------------------- */
function AppContentInner() {
  const ctx = useContext(AppContext)!;
  const studentMode = !!ctx?.studentMode;

  // Local UI state
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [filters, setFilters] = useState<FiltersState>({});
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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
  const savedList: Book[] = studentMode ? (ctx.repository ?? []) : (ctx.favorites ?? []);

  const handlePickClick = (q: string, meta?: Partial<FiltersState>) => {
    setQuery(q);
    if (meta) {
      setFilters((prev) => ({
        ...prev,
        ...(meta.resourceType ? { resourceType: (meta as any).resourceType } : {}),
        ...(meta.subject ? { subject: (meta as any).subject, category: (meta as any).subject } : {}),
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] transition-colors">
      <Header onToggleFavorites={() => setShowFavorites((s) => !s)} />

      {/* Mobile-first container: reduce max width for small screens then expand at larger breakpoints */}
      <main className="max-w-3xl sm:max-w-4xl md:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Card: hero + search area */}
        <div className="bg-[color:var(--surface)] dark:bg-[color:var(--surface)] rounded-lg shadow-sm p-3 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:flex-1">
              <HeroText studentMode={studentMode} />
            </div>

            {/* Reserve right column for search controls but keep it compact on xs */}
            <div className="w-full md:w-1/2" aria-hidden>
              {/* Intentionally left for layout parity with larger screens */}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="bg-transparent">
            <Filters filters={filters} setFilters={setFilters} />
          </div>

          <section className="py-4">
            <div className="bg-[color:var(--surface)] dark:bg-[color:var(--surface)] rounded-lg p-3 sm:p-4 shadow-sm">
              <SearchBar query={query} setQuery={setQuery} setBooks={setBooks} filters={filters} />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold">{studentMode ? "Alex picks for study" : "Alex picks for you"}</h4>
                  <p className="text-xs text-[color:var(--muted)]">
                    {studentMode ? "College subjects, exam prep, wellbeing, careers" : "Fun reads, comics, fiction, bestsellers"}
                  </p>
                </div>
              </div>

              {/* Picks: allow horizontal scroll on very small screens, wrap on larger */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex flex-wrap gap-2">
                  {picks.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePickClick(p.q, (p as any).meta)}
                      className="px-3 py-1 rounded-full border bg-[color:var(--surface)] hover:shadow-sm text-sm whitespace-nowrap"
                      aria-label={`Search ${p.label}`}
                      title={p.label}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {savedList && savedList.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Alex favourites</h4>
                  <p className="text-xs text-[color:var(--muted)]">Saved {studentMode ? "repository" : "favorites"}</p>
                </div>

                {/* Grid collapses earlier on small screens */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {savedList.slice(0, 6).map((b) => (
                    <button
                      key={b.key}
                      onClick={() => setSelectedBook(b)}
                      className="flex flex-col items-start gap-2 p-2 rounded-lg bg-[color:var(--surface)] hover:shadow-sm text-left h-full"
                      title={b.title}
                    >
                      <div className="w-full aspect-[2/3] sm:aspect-[3/4] bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                        {b.cover_i ? (
                          <img src={`https://covers.openlibrary.org/b/id/${b.cover_i}-S.jpg`} alt={b.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-xs text-[color:var(--muted)] px-2">No cover</div>
                        )}
                      </div>
                      <div className="w-full">
                        <div className="text-xs font-medium truncate">{b.title}</div>
                        <div className="text-xs text-[color:var(--muted)] truncate">{b.author_name?.slice(0, 1).join(", ") ?? "Unknown"}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <BookList books={books} onOpenBook={(b) => setSelectedBook(b)} />
            </div>
          </section>

          <Favorites open={showFavorites} onClose={() => setShowFavorites(false)} />
        </div>
      </main>

      {selectedBook && <BookDetailsModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </div>
  );
}

/* -------------------------
   App wrapper (provides context)
   ------------------------- */
export default function App() {
  return (
    <AppProvider>
      <AppContentInner />
    </AppProvider>
  );
}
