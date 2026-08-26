export type ReadingStatus = "wantToRead" | "currentlyReading" | "read" | "didNotFinish";

export interface Quote {
  id: string;
  text: string;
  page?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  readingStatus: ReadingStatus;
  rating?: number;
  genres: string[];
  plotNotes: string;
  characters: string[];
  quotes: Quote[];
  commentary: string;
  photoDataUrl?: string;
  createdAt: number;
}

export type BookInput = Omit<Book, "id" | "createdAt">;
