export type MoodId =
  | "magical"
  | "cozy"
  | "escapist"
  | "emotional"
  | "intense"
  | "lightFun"
  | "thoughtProvoking"
  | "mysterious";

export type MysteryGenreId =
  | "fantasy"
  | "romance"
  | "mysteryThriller"
  | "scienceFiction"
  | "literaryFiction"
  | "historicalFiction"
  | "horror"
  | "adventure"
  | "biography"
  | "selfDevelopment"
  | "youngAdult"
  | "nonFiction";

export type ExperienceId =
  | "escapeMe"
  | "makeMeFeel"
  | "keepMeHooked"
  | "makeMeThink"
  | "makeMeSmile"
  | "surpriseMe";

export type RevealMode = "mystery" | "sneakPeek";

export interface MysteryBookCandidate {
  id: string;
  title: string;
  author: string;
  genres: MysteryGenreId[];
  moodProfile: Partial<Record<MoodId, number>>;
  approxPages: number;
  popularity: number;
}

export interface MysteryOrderRecord {
  id: string;
  bookId: string;
  moods: MoodId[];
  genres: MysteryGenreId[];
  experience: ExperienceId | null;
  revealMode: RevealMode;
  createdAt: number;
  feedback?: "loved" | "okay" | "notForMe";
}
