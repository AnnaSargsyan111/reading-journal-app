import type { Book, BookInput } from "../types/book";

const storageKey = (userId: string) => `rj_books_${userId}`;

function readBooks(userId: string): Book[] {
  const raw = localStorage.getItem(storageKey(userId));
  return raw ? (JSON.parse(raw) as Book[]) : [];
}

function writeBooks(userId: string, books: Book[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(books));
}

export function listBooks(userId: string): Book[] {
  return readBooks(userId).sort((a, b) => b.createdAt - a.createdAt);
}

export function getBook(userId: string, bookId: string): Book | undefined {
  return readBooks(userId).find((b) => b.id === bookId);
}

export function createBook(userId: string, input: BookInput): Book {
  const books = readBooks(userId);
  const book: Book = { ...input, id: crypto.randomUUID(), createdAt: Date.now() };
  books.push(book);
  writeBooks(userId, books);
  return book;
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
