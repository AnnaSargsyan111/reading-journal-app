import type { Book, BookInput } from "../types/book";

const storageKey = (userId: string) => `rj_books_${userId}`;

function readBooks(userId: string): Book[] {
  const raw = localStorage.getItem(storageKey(userId));
  return raw ? (JSON.parse(raw) as Book[]) : [];
}

function writeBooks(userId: string, books: Book[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(books));
}

// Stored array order IS display order for the default "Recently Added" view —
// this lets the user freely drag-and-drop reorder their library. New books go
// to the front (see createBook); reorderBooks lets the grid persist a drag.
export function listBooks(userId: string): Book[] {
  return readBooks(userId);
}

export function getBook(userId: string, bookId: string): Book | undefined {
  return readBooks(userId).find((b) => b.id === bookId);
}

export function createBook(userId: string, input: BookInput): Book {
  const books = readBooks(userId);
  const book: Book = { ...input, id: crypto.randomUUID(), createdAt: Date.now() };
  books.unshift(book);
  writeBooks(userId, books);
  return book;
}

// Persists a drag-and-drop reorder. orderedIds is the full new display order;
// any book missing from it (shouldn't normally happen) is kept, appended at the end.
export function reorderBooks(userId: string, orderedIds: string[]): void {
  const books = readBooks(userId);
  const byId = new Map(books.map((b) => [b.id, b]));
  const reordered = orderedIds.map((id) => byId.get(id)).filter((b): b is Book => Boolean(b));
  const remaining = books.filter((b) => !orderedIds.includes(b.id));
  writeBooks(userId, [...reordered, ...remaining]);
}

export function updateBook(userId: string, bookId: string, input: BookInput): Book {
  const books = readBooks(userId);
  const index = books.findIndex((b) => b.id === bookId);
  if (index === -1) throw new Error("book_not_found");
  const updated: Book = { ...books[index], ...input };
  books[index] = updated;
  writeBooks(userId, books);
  return updated;
}

export function deleteBook(userId: string, bookId: string): void {
  const books = readBooks(userId).filter((b) => b.id !== bookId);
  writeBooks(userId, books);
}
