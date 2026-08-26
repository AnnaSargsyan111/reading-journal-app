import { listBooks } from "./bookStore";
import { MYSTERY_CATALOG } from "./mysteryCatalog";
import type { MysteryBookCandidate, MoodId, MysteryGenreId } from "../types/mystery";
import type { UserRecord } from "../types/user";
import { listMysteryOrders, listRecentlyShown } from "./mysteryStore";

// Weights from PRD Section 13.10 — starting values, not final.
const WEIGHTS = {
  mood: 0.4,
  genre: 0.25,
  history: 0.15,
  author: 0.1,
  popularity: 0.1,
};

/** Cold-Start Principle (Section 13.3): skip asking for genre if we already know enough. */
export function needsGenreStep(user: UserRecord): boolean {
  const readBooks = listBooks(user.id).filter((b) => b.readingStatus === "read" && (b.rating ?? 0) >= 4);
  return user.genres.length === 0 && readBooks.length === 0;
}

function moodMatchScore(candidate: MysteryBookCandidate, moods: MoodId[]): number {
  if (moods.length === 0) return 0;
  const total = moods.reduce((sum, mood) => sum + (candidate.moodProfile[mood] ?? 0), 0);
  return total / moods.length;
}

function genreMatchScore(candidate: MysteryBookCandidate, genres: MysteryGenreId[]): number {
  if (genres.length === 0) return 0.5;
  const matches = candidate.genres.filter((g) => genres.includes(g)).length;
  return matches / genres.length;
}

function historyScore(candidate: MysteryBookCandidate, user: UserRecord): number {
  const favoriteAuthorsLower = user.favoriteAuthors.map((a) => a.toLowerCase());
  const authorMatch = favoriteAuthorsLower.includes(candidate.author.toLowerCase()) ? 1 : 0;
  const readBooks = listBooks(user.id).filter((b) => b.readingStatus === "read");
  const genreOverlap = readBooks.some((b) =>
    b.genres.some((g) => candidate.genres.includes(g as MysteryGenreId)),
  )
    ? 1
    : 0;
  return (authorMatch + genreOverlap) / 2;
}

function feedbackPenalty(candidate: MysteryBookCandidate, user: UserRecord): number {
  const disliked = listMysteryOrders(user.id).filter((o) => o.feedback === "notForMe");
  if (disliked.length === 0) return 0;
  const dislikedGenres = new Set(disliked.flatMap((o) => o.genres));
  const overlap = candidate.genres.some((g) => dislikedGenres.has(g));
  return overlap ? 0.15 : 0;
}

interface RecommendationInput {
  user: UserRecord;
  moods: MoodId[];
  genres: MysteryGenreId[];
}

/** Candidate Filtering (Section 13.11) + Ranking (Section 13.9/13.10), sorted best-first. */
function rankCandidates(input: RecommendationInput): MysteryBookCandidate[] {
  const { user, moods, genres } = input;

  const alreadyOwnedTitles = new Set(
    listBooks(user.id).map((b) => b.title.trim().toLowerCase()),
  );
  const previouslySent = new Set(listMysteryOrders(user.id).map((o) => o.bookId));
  const recentlyShown = new Set(listRecentlyShown(user.id));

  const notOwnedOrOrdered = (book: MysteryBookCandidate) =>
    !alreadyOwnedTitles.has(book.title.toLowerCase()) && !previouslySent.has(book.id);

  // Prefer candidates that haven't been shown recently, so answering with the same
  // mood/genre twice in a row doesn't surface the identical pick — but never let that
  // rule alone empty the pool if every eligible title has already been shown.
  const notRecentlyShown = MYSTERY_CATALOG.filter((book) => notOwnedOrOrdered(book) && !recentlyShown.has(book.id));
  const ownedFallback = MYSTERY_CATALOG.filter(notOwnedOrOrdered);
  const pool = notRecentlyShown.length > 0 ? notRecentlyShown : ownedFallback.length > 0 ? ownedFallback : MYSTERY_CATALOG;

  const scored = pool.map((book) => {
    const score =
      moodMatchScore(book, moods) * WEIGHTS.mood +
      genreMatchScore(book, genres) * WEIGHTS.genre +
      historyScore(book, user) * WEIGHTS.history +
      (user.favoriteAuthors.some((a) => a.toLowerCase() === book.author.toLowerCase()) ? 1 : 0) *
        WEIGHTS.author +
      book.popularity * WEIGHTS.popularity -
      feedbackPenalty(book, user);
    return { book, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.book);
}

export function generateRecommendation(input: RecommendationInput): MysteryBookCandidate | undefined {
  const ranked = rankCandidates(input);

  // Pick randomly among the top-scoring ties instead of always the single highest —
  // keeps repeat runs with identical answers from feeling robotic.
  const topTier = ranked.slice(0, Math.max(1, Math.ceil(ranked.length * 0.2)));
  return topTier[Math.floor(Math.random() * topTier.length)];
}

const MAX_CHANGE_BOOK_OPTIONS = 5;

/**
 * Up to 5 candidates for the "Change Book" cycle, starting with the book actually
 * shown to the user (so the first click of "Change Book" doesn't just repeat it),
 * followed by the next-best matches in ranked order.
 */
export function generateRecommendationOptions(
  input: RecommendationInput,
  shown: MysteryBookCandidate,
): MysteryBookCandidate[] {
  const ranked = rankCandidates(input);
  const rest = ranked.filter((book) => book.id !== shown.id);
  return [shown, ...rest].slice(0, MAX_CHANGE_BOOK_OPTIONS);
}
