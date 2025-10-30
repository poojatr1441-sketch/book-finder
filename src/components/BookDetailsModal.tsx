import React from "react";
import { Book } from "../types";
/**
 * BookDetailsModal
 *
 * Lightweight modal that displays detailed information about a Book.
 * - Does not perform any network requests; it only renders the provided `book`.
 * - Clicking the backdrop or the Close button calls `onClose`.
 * - Keep modal markup simple so it's easy to enhance later (focus trap, animations, keyboard handling).
 *
 * Props:
 * - book: Book object to display
 * - onClose: callback invoked when modal should close
 */
export default function BookDetailsModal({
  book,
  onClose,
}: {
  book: Book;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 overflow-auto max-h-[90vh]">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/3">
              {book.cover_i ? (
                <img
                  src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                  alt={book.title}
                  className="w-full h-auto object-cover rounded"
                />
              ) : (
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">No cover</div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold">{book.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{book.author_name?.join(", ")}</p>
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                <div>First published: {book.first_publish_year ?? "—"}</div>
                <div>Subjects: {book.subject?.slice(0, 8).join(", ") || "—"}</div>
                <div>ISBNs: {book.isbn?.slice(0, 4).join(", ") || "—"}</div>
              </div>

              <div className="mt-4 flex gap-2">
                {book.has_fulltext && (
                  <a
                    href={`https://openlibrary.org${book.key}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Read on OpenLibrary
                  </a>
                )}
                <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
