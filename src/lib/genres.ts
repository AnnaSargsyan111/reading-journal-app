export interface GenreOption {
  id: string;
  labelKey: string;
}

export const GENRES: GenreOption[] = [
  { id: "fiction", labelKey: "genres.fiction" },
  { id: "literaryFiction", labelKey: "genres.literaryFiction" },
  { id: "contemporary", labelKey: "genres.contemporary" },
  { id: "crimeMysteryThriller", labelKey: "genres.crimeMysteryThriller" },
  { id: "scienceFiction", labelKey: "genres.scienceFiction" },
  { id: "fantasy", labelKey: "genres.fantasy" },
  { id: "romance", labelKey: "genres.romance" },
  { id: "historicalFiction", labelKey: "genres.historicalFiction" },
  { id: "horror", labelKey: "genres.horror" },
  { id: "actionAdventure", labelKey: "genres.actionAdventure" },
  { id: "youngAdult", labelKey: "genres.youngAdult" },
  { id: "classics", labelKey: "genres.classics" },
  { id: "shortStories", labelKey: "genres.shortStories" },
  { id: "graphicNovelComics", labelKey: "genres.graphicNovelComics" },
  { id: "nonFiction", labelKey: "genres.nonFiction" },
  { id: "biographyMemoir", labelKey: "genres.biographyMemoir" },
  { id: "selfImprovement", labelKey: "genres.selfImprovement" },
  { id: "businessEconomics", labelKey: "genres.businessEconomics" },
  { id: "philosophyPsychology", labelKey: "genres.philosophyPsychology" },
  { id: "historyPolitics", labelKey: "genres.historyPolitics" },
  { id: "scienceTechnology", labelKey: "genres.scienceTechnology" },
  { id: "poetry", labelKey: "genres.poetry" },
];

export const MAX_ONBOARDING_GENRES = 5;
