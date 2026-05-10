export type LibraryKind = "tv" | "movies";

export interface Libraries {
  tv: string | null;
  movies: string | null;
}

export const IPC_CHANNELS = {
  pickFolder: "localtv:pickFolder",
  getLibraries: "localtv:getLibraries",
  clearLibrary: "localtv:clearLibrary",
} as const;
