import React, { useEffect, useRef, useState } from "react";
import { Book } from "../types";
// optional smart search helper; file created at src/lib/resourceSearch.ts
import { runSmartSearch } from "../lib/resourceSearch";

/**
 * Filters used by SearchBar. resourceType is optional and used for student-mode smart searches.
 */
type Filters = {
  sortByYear?: "newest" | "oldest" | "";
  language?: string;
  category?: string;
  format?: "ebook" | "print" | "";
  // optional resourceType for student-mode resource searches (see src/lib/resourceSearch)
  resourceType?: string;
};

type Props = {
  query: string;
  setQuery: (q: string) => void;
  setBooks: (b: Book[]) => void;
  filters: Filters;
};

/* -------------------------
   Utility helpers
   ------------------------- */

/**
 * buildSearchUrl
 * - Constructs a simple OpenLibrary search URL using the current query and filters.
 * - We include subject and language when provided and set a reasonable limit.
 */
function buildSearchUrl(query: string, filters: Filters) {
  const base = "https://openlibrary.org/search.json";
  const params = new URLSearchParams();

  // allow empty query so subject/language filters still work
  params.set("q", query || "");

  if (filters.language) params.set("language", filters.language);
  if (filters.category && filters.category.trim())
    params.set("subject", filters.category.trim());
  params.set("limit", "80");
  return `${base}?${params.toString()}`;
}
/**
 * useDebounce
 * - Simple hook that returns a debounced version of value after ms milliseconds.
 * - Keeps the suggestions network traffic reasonable while typing.
 */
function useDebounce<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

/* -------------------------
   Component
   ------------------------- */
export default function SearchBar({
  query,
  setQuery,
  setBooks,
  filters,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounced = useDebounce(query, 250);

  const suggestionAbort = useRef<AbortController | null>(null);
  const searchAbort = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
/* -------------------------
     Suggestions effect
     - Fetches lightweight title suggestions from OpenLibrary as the user types.
     - Aborts previous request when a newer one starts.
     ------------------------- */
  useEffect(() => {
    if (!debounced.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestionAbort.current?.abort();
    const c = new AbortController();
    suggestionAbort.current = c;

    fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(
        debounced
      )}&limit=8`,
      {
        signal: c.signal,
      }
    )
      .then((r) => r.json())
      .then((data) => {
        const list = (data.docs || [])
          .slice(0, 6)
          .map((d: any) => d.title)
          .filter(Boolean);
        setSuggestions(Array.from(new Set(list)));
        if (list.length) setShowSuggestions(true);
      })
      .catch((err) => {
        if ((err as any)?.name === "AbortError") return;
      });

    return () => c.abort();
  }, [debounced]);
/* -------------------------
     mapDocsToBooks
     - Normalizes OpenLibrary doc objects into our Book type.
     - Keeps mapping centralized so both smart and fallback searches map consistently.
     ------------------------- */
  const mapDocsToBooks = (docs: any[]): Book[] =>
    docs.map((d: any) => ({
      key:
        d.key ||
        d.cover_edition_key ||
        `${d.title ?? "untitled"}-${d.first_publish_year ?? ""}`,
      title: d.title,
      author_name: d.author_name,
      first_publish_year: d.first_publish_year,
      cover_i: d.cover_i,
      subject: (d.subject || d.subject_facet || []) as string[],
      isbn: d.isbn,
      publisher: d.publisher,
      edition_key: d.edition_key,
      has_fulltext: !!d.has_fulltext,
    }));
/* -------------------------
     runSearch
     - Core search runner invoked by the Search button or Enter key.
     - Prefers runSmartSearch when filters.resourceType is provided (student-mode)
     - Falls back to a plain OpenLibrary query otherwise.
     - Applies client-side filtering (category, format) and sorting.
     ------------------------- */
  const runSearch = async (q?: string) => {
    const final = q !== undefined ? q : query;
    // if a previous search is running, abort it
    searchAbort.current?.abort();
    const controller = new AbortController();
    searchAbort.current = controller;

    setLoading(true);
    try {
      // If filters.resourceType is provided, prefer running the smart resource search
      if (filters.resourceType) {
        // runSmartSearch returns { docs, attempt, description, url }
        // pass subjectSlug if category is selected
        const res = await runSmartSearch(filters.resourceType as any, {
          subjectSlug: filters.category,
          limit: 40,
          minResults: 6,
          // optional client-side filter could be passed here if desired
        });
        const docs = Array.isArray(res.docs) ? res.docs : [];
        const mapped = mapDocsToBooks(docs);
        let filtered = mapped;

        // still apply format and sort filters as before
        if (filters.format === "ebook")
          filtered = filtered.filter((b) => b.has_fulltext);
        else if (filters.format === "print")
          filtered = filtered.filter((b) => !b.has_fulltext);

        if (filters.sortByYear === "newest")
          filtered = filtered.sort(
            (a, b) => (b.first_publish_year ?? 0) - (a.first_publish_year ?? 0)
          );
        else if (filters.sortByYear === "oldest")
          filtered = filtered.sort(
            (a, b) =>
              (a.first_publish_year ?? Number.POSITIVE_INFINITY) -
              (b.first_publish_year ?? Number.POSITIVE_INFINITY)
          );

        setBooks(filtered);
        setShowSuggestions(false);
        setSuggestions([]);
        return;
      }

      // fallback: original simple Open Library search
      const url = buildSearchUrl(final, filters);
      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();

      const mapped: Book[] = mapDocsToBooks(data.docs || []);

      // permissive client-side category filtering fallback
      let filtered = mapped;
      if (filters.category && filters.category.trim()) {
        const cat = filters.category.trim().toLowerCase();
        const before = filtered.length;
        filtered = filtered.filter((b) =>
          (b.subject || []).some((s) => String(s).toLowerCase().includes(cat))
        );
        if (filtered.length === 0 && before > 0) filtered = mapped;
      }

      if (filters.format === "ebook")
        filtered = filtered.filter((b) => b.has_fulltext);
      else if (filters.format === "print")
        filtered = filtered.filter((b) => !b.has_fulltext);

      if (filters.sortByYear === "newest")
        filtered = filtered.sort(
          (a, b) => (b.first_publish_year ?? 0) - (a.first_publish_year ?? 0)
        );
      else if (filters.sortByYear === "oldest")
        filtered = filtered.sort(
          (a, b) =>
            (a.first_publish_year ?? Number.POSITIVE_INFINITY) -
            (b.first_publish_year ?? Number.POSITIVE_INFINITY)
        );

      setBooks(filtered);
      setShowSuggestions(false);
      setSuggestions([]);
    } catch (err) {
      if ((err as any)?.name === "AbortError") return;
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // keyboard navigation
  const [highlight, setHighlight] = useState(-1);
  const scrollToHighlighted = () => {
    const ul = suggestionsRef.current;
    if (!ul) return;
    const item = ul.children[highlight] as HTMLElement | undefined;
    if (item) item.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") runSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
      scrollToHighlighted();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      scrollToHighlighted();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = highlight >= 0 ? suggestions[highlight] : query;
      setQuery(sel);
      runSearch(sel);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlight(-1);
    }
  };

  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node | null;
      if (!target) return;
      if (
        inputRef.current &&
        suggestionsRef.current &&
        !inputRef.current.contains(target) &&
        !suggestionsRef.current.contains(target)
      ) {
        setShowSuggestions(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="mt-0 relative max-w-full">
      <div className="flex gap-3 items-center mb-2 text-sm">
        <p className="text-xs text-[color:var(--muted)]"></p>
      </div>

      {/* Mobile-first layout: stack input and button on xs, inline on sm+ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (suggestions.length) setShowSuggestions(true);
          }}
          placeholder="Search by title, author, ISBN, subject, publisher."
          className="flex-1 p-3 rounded-md border dark:bg-slate-800 dark:border-slate-700 w-full"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
        />

        <button
          onClick={() => runSearch()}
          className="w-full sm:w-auto px-4 py-2 rounded-md bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-700)]"
        >
          {loading ? "⏳" : "🔍"} Search
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          ref={suggestionsRef}
          role="listbox"
          className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border rounded-md overflow-auto z-40 max-h-56 sm:max-w-xl sm:left-auto sm:right-auto sm:mx-0"
        >
          {suggestions.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={highlight === i}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQuery(s);
                runSearch(s);
                setShowSuggestions(false);
              }}
              onMouseEnter={() => setHighlight(i)}
              className={`px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${
                highlight === i ? "bg-slate-100 dark:bg-slate-700" : ""
              }`}
            >
              <span className="text-sm block truncate">{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
