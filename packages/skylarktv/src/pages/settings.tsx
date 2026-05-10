import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import { NextSeo } from "next-seo";
import type { Libraries, LibraryKind } from "../types/electron-api";

const DEFAULT_LIBRARIES: Libraries = { tv: null, movies: null };

const ROW_LABELS: Record<LibraryKind, string> = {
  tv: "TV Shows folder",
  movies: "Movies folder",
};

const LibraryRow = ({
  kind,
  onChoose,
  onClear,
  path,
}: {
  kind: LibraryKind;
  onChoose: (kind: LibraryKind) => void;
  onClear: (kind: LibraryKind) => void;
  path: string | null;
}) => (
  <div className="flex flex-col gap-2 border-b border-gray-700 py-6 last:border-b-0 md:flex-row md:items-center md:justify-between">
    <div>
      <h2 className="text-lg font-semibold text-white">{ROW_LABELS[kind]}</h2>
      <p className="break-all text-sm text-gray-400">
        {path || "Not set — choose a folder to add this library."}
      </p>
    </div>
    <div className="flex gap-2">
      <button
        className="rounded bg-skylarktv-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-skylarktv-accent"
        type="button"
        onClick={() => onChoose(kind)}
      >
        {path ? "Change…" : "Choose folder…"}
      </button>
      {path ? (
        <button
          className="rounded border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800"
          type="button"
          onClick={() => onClear(kind)}
        >
          {"Clear"}
        </button>
      ) : null}
    </div>
  </div>
);

const SettingsPage: NextPage = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [libraries, setLibraries] = useState<Libraries>(DEFAULT_LIBRARIES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.electronAPI) {
      setIsLoaded(true);
      return;
    }
    setIsElectron(true);
    void window.electronAPI.getLibraries().then((next) => {
      setLibraries(next);
      setIsLoaded(true);
    });
  }, []);

  const handleChoose = useCallback((kind: LibraryKind) => {
    void (async () => {
      if (!window.electronAPI) return;
      const path = await window.electronAPI.pickFolder(kind);
      setLibraries((prev) => ({ ...prev, [kind]: path }));
    })();
  }, []);

  const handleClear = useCallback((kind: LibraryKind) => {
    void (async () => {
      if (!window.electronAPI) return;
      await window.electronAPI.clearLibrary(kind);
      setLibraries((prev) => ({ ...prev, [kind]: null }));
    })();
  }, []);

  if (!isLoaded) {
    return null;
  }

  if (!isElectron) {
    return (
      <>
        <NextSeo title="Settings" />
        <main className="mx-auto max-w-3xl px-6 py-16 text-center text-white">
          <h1 className="text-3xl font-bold">{"Settings"}</h1>
          <p className="mt-4 text-gray-400">
            {"Library settings are only available in the desktop app."}
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <NextSeo title="Settings" />
      <main className="mx-auto max-w-3xl px-6 py-16 text-white">
        <h1 className="text-3xl font-bold">{"Settings"}</h1>
        <p className="mt-2 text-sm text-gray-400">
          {
            "Choose the folders SkylarkTV should look in for your media. Selections are stored locally and survive app restarts."
          }
        </p>

        <section className="mt-10">
          <LibraryRow
            kind="tv"
            path={libraries.tv}
            onChoose={handleChoose}
            onClear={handleClear}
          />
          <LibraryRow
            kind="movies"
            path={libraries.movies}
            onChoose={handleChoose}
            onClear={handleClear}
          />
        </section>
      </main>
    </>
  );
};

export default SettingsPage;
