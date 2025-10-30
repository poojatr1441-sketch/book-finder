import React, { useContext, useMemo } from "react";
import { Book } from "../types";
import { AppContext } from "../context/AppContext";

/**
 * Returns OpenLibrary cover URL for given cover id or undefined when absent.
 */
function coverUrl(cover_i?: number) {
  return cover_i ? `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg` : undefined;
}

/**
 * BookCard (mobile-friendly)
 *
 * Mobile-first adjustments:
 * - Smaller paddings and font sizes on xs; scale up on sm+
 * - Cover uses a slightly taller aspect on small screens to avoid overly compressed thumbnails
 * - Action buttons collapse to a stacked column on xs for larger touch targets
 * - Card uses h-full so grid layout gives consistent heights
 *
 * Props:
 * - book: Book to render
 * - onOpen: optional preview callback
 */
export default function BookCard({
  book,
  onOpen,
}: {
  book: Book;
  onOpen?: (b: Book) => void;
}) {
  const ctx = useContext(AppContext);
  if (!ctx) return null;

  const { favorites, setFavorites, repository, setRepository, studentMode } = ctx;

  const isSaved = useMemo(() => {
    const list = studentMode ? repository : favorites;
    return list.some((f) => f.key === book.key);
  }, [studentMode, repository, favorites, book.key]);

  const toggleSave = () => {
    if (studentMode) {
      const exists = repository.some((r) => r.key === book.key);
      if (exists) setRepository(repository.filter((r) => r.key !== book.key));
      else setRepository([book, ...repository]);
    } else {
      const exists = favorites.some((f) => f.key === book.key);
      if (exists) setFavorites(favorites.filter((f) => f.key !== book.key));
      else setFavorites([book, ...favorites]);
    }
  };

  return (
    <article
      className="bg-[color:var(--surface)] dark:bg-[color:var(--surface)]
                 rounded-xl shadow-[var(--card-shadow)] overflow-hidden flex flex-col h-full
                 transform transition-transform duration-200 hover:-translate-y-1 focus-within:-translate-y-1"
    >
      {/* Cover: slightly taller on small screens, more compact on larger */}
      <div className="relative w-full pb-[140%] sm:pb-[120%] bg-slate-100 dark:bg-slate-700">
        {coverUrl(book.cover_i) ? (
          <img
            src={coverUrl(book.cover_i)}
            alt={book.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300"
            onLoad={(e) => (e.currentTarget.style.opacity = "1")}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 skeleton text-xs">
            No cover
          </div>
        )}
      </div>

      {/* Content: compact padding on xs, comfortable on sm+ */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2">
          {book.title}
        </h3>

        <p className="text-xs sm:text-sm text-[color:var(--muted)] mt-1">
          {book.author_name?.slice(0, 2).join(", ") ?? "Unknown"}
        </p>

        {/* Meta + actions: actions stack on xs for larger touch targets */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs sm:text-sm text-[color:var(--muted)]">
            {book.first_publish_year ?? "—"}
            {book.has_fulltext ? " • Readable" : ""}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => onOpen?.(book)}
              aria-label={`Preview ${book.title}`}
              className="px-3 py-2 min-h-[40px] rounded-md text-sm bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-700)]
                         transform transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring"
            >
              Preview
            </button>

            <button
              onClick={toggleSave}
              aria-label={
                studentMode
                  ? isSaved
                    ? "Remove from repository"
                    : "Save to repository"
                  : isSaved
                  ? "Remove favorite"
                  : "Save favorite"
              }
              aria-pressed={isSaved}
              className={`px-3 py-2 min-h-[40px] rounded-md text-sm focus:outline-none focus:ring transition-colors
                          ${isSaved ? (studentMode ? "bg-[color:var(--primary)] text-white" : "bg-red-600 text-white") : "bg-white/0 dark:bg-white/3 border"}`}
            >
              {studentMode ? <span aria-hidden>{isSaved ? "🔖" : "📑"}</span> : <span aria-hidden>{isSaved ? "💔" : "❤️"}</span>}
            </button>
          </div>
        </div>

        {book.subject && (
          <p className="text-xs text-[color:var(--muted)] mt-2 line-clamp-2">
            {book.subject.slice(0, 3).join(", ")}
          </p>
        )}
      </div>
    </article>
  );
}
