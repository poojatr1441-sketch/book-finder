import React from "react";
import { Book } from "../types";
import BookCard from "./BookCard";
/**
 * BookList
 *
 * Renders a responsive grid of BookCard components or a friendly empty state when there are no books.
 *
 * Props:
 * - books: array of Book objects to render
 * - onOpenBook: optional callback invoked when a BookCard's Preview button is clicked
 *
 * Notes:
 * - Keeps layout responsive using Tailwind grid classes:
 *   1 column on very small screens, 2 on small, 3 on medium, 4 on large
 * - Uses the book.key as the React key (Open Library keys are stable for a work/edition)
 * - The empty state is minimal and user-friendly; you can replace with an illustration later
 */

export default function BookList({
  books,
  onOpenBook,
}: {
  books: Book[];
  onOpenBook?: (b: Book) => void;
}) {
  if (!books || books.length === 0) {
    return (
      <p className="mt-6 text-center text-[color:var(--muted)]">
        No results. Try a different query.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mt-6">
      {books.map((b) => (
        <div key={b.key} className="h-full">
          <BookCard book={b} onOpen={onOpenBook} />
        </div>
      ))}
    </div>
  );
}
