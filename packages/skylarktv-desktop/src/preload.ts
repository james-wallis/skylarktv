import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, type Libraries, type LibraryKind } from "./shared";

const api = {
  pickFolder: (kind: LibraryKind): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.pickFolder, kind),
  getLibraries: (): Promise<Libraries> =>
    ipcRenderer.invoke(IPC_CHANNELS.getLibraries),
  clearLibrary: (kind: LibraryKind): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.clearLibrary, kind),
};

contextBridge.exposeInMainWorld("electronAPI", api);

export type ElectronAPI = typeof api;
