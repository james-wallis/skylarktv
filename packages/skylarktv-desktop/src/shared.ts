export type LibraryKind = "tv" | "movies";

export interface Libraries {
  tv: string | null;
  movies: string | null;
}

export const IPC_CHANNELS = {
  pickFolder: "skylarktv:pickFolder",
  getLibraries: "skylarktv:getLibraries",
  clearLibrary: "skylarktv:clearLibrary",
} as const;
