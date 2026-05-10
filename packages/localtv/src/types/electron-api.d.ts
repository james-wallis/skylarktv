export type LibraryKind = "tv" | "movies";

export interface Libraries {
  tv: string | null;
  movies: string | null;
}

export interface ElectronAPI {
  pickFolder: (kind: LibraryKind) => Promise<string | null>;
  getLibraries: () => Promise<Libraries>;
  clearLibrary: (kind: LibraryKind) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
