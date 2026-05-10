import { useCallback, useEffect, useState } from "react";
import type { Libraries, LibraryKind } from "../types/electron-api";

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "LocalTV";

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
  <div className="flex flex-col gap-3 border-b border-white/10 py-6 last:border-b-0 md:flex-row md:items-center md:justify-between">
    <div>
      <h2 className="text-lg font-semibold">{ROW_LABELS[kind]}</h2>
      <p className="break-all text-sm text-white/60">{path || "Not set."}</p>
    </div>
    <div className="flex gap-2">
      <button
        className="bg-brand-primary hover:bg-brand-accent rounded px-4 py-2 text-sm font-medium text-white transition"
        type="button"
        onClick={() => onChoose(kind)}
      >
        {path ? "Change…" : "Choose folder…"}
      </button>
      {path ? (
        <button
          className="rounded border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5"
          type="button"
          onClick={() => onClear(kind)}
        >
          {"Clear"}
        </button>
      ) : null}
    </div>
  </div>
);

export default function SettingsPage() {
  const [libraries, setLibraries] = useState<Libraries>({
    tv: null,
    movies: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) {
      setIsLoaded(true);
      return;
    }
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

  if (!isLoaded) return null;

  return (
    <section className="mx-auto max-w-3xl px-8 py-16">
      <h1 className="text-3xl font-bold">{"Settings"}</h1>
      <p className="mt-2 text-sm text-white/60">
        {`Choose the folders ${BRAND_NAME} should look in for your media. Selections are stored locally and survive app restarts.`}
      </p>
      <div className="mt-10">
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
      </div>
    </section>
  );
}
