import React, { useContext } from "react";
import { AppContext, Book } from "../context/AppContext";
/**
 * Favorites modal
 *
 * Renders a modal dialog showing saved books. Behavior changes slightly by mode:
 * - studentMode === true: reads/writes the repository list
 * - studentMode === false: reads/writes the favorites list
 *
 * Props:
 * - open: whether the modal is visible
 * - onClose: callback to close the modal
 *
 * Notes:
 * - The component reads setters from AppContext to remove items or clear the list.
 * - UI is accessible (role="dialog", aria-modal) and clicking the backdrop closes the modal.
 */
type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Favorites({ open, onClose }: Props) {
  const ctx = useContext(AppContext);
  if (!ctx) return null;

  const { studentMode, favorites, setFavorites, repository, setRepository } =
    ctx;

  // choose storage based on mode
  const items: Book[] = studentMode ? repository : favorites;
  const setItems = (next: Book[]) => {
    if (studentMode) setRepository(next);
    else setFavorites(next);
  };

  const remove = (key: string) => {
    setItems(items.filter((b) => b.key !== key));
  };

  const clearAll = () => {
    setItems([]);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-2xl bg-[color:var(--surface)] dark:bg-[color:var(--surface)] rounded-lg shadow-lg overflow-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-slate-700">
          <h3 className="text-sm font-semibold">
            {studentMode ? "Repository" : "Favorites"}
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={clearAll}
              className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="text-sm px-2 py-1 rounded bg-[color:var(--surface)] hover:brightness-95"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-4">
          {items.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)]">
              {studentMode
                ? "Your repository is empty. Save books here while studying."
                : "You have no favorites yet. Save books to see them here."}
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((b) => (
                <li
                  key={b.key}
                  className="flex items-start gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="w-12 h-16 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden flex-shrink-0">
                    {b.cover_i ? (
                      <img
                        src={`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`}
                        alt={b.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[color:var(--muted)]">
                        No cover
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="truncate">
                        <div className="font-medium text-sm">{b.title}</div>
                        <div className="text-xs text-[color:var(--muted)] truncate">
                          {b.author_name?.slice(0, 2).join(", ") ?? "Unknown"}
                          {b.first_publish_year
                            ? ` · ${b.first_publish_year}`
                            : ""}
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => remove(b.key)}
                          title={
                            studentMode
                              ? "Remove from repository"
                              : "Remove from favorites"
                          }
                          className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* optional small actions row (copy citation, add note) could go here */}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
