import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, type Libraries, type LibraryKind } from "./shared";

const api = {
  pickFolder: (kind: LibraryKind) =>
    ipcRenderer.invoke(IPC_CHANNELS.pickFolder, kind) as Promise<string | null>,
  getLibraries: () =>
    ipcRenderer.invoke(IPC_CHANNELS.getLibraries) as Promise<Libraries>,
  clearLibrary: (kind: LibraryKind) =>
    ipcRenderer.invoke(IPC_CHANNELS.clearLibrary, kind) as Promise<void>,
};

contextBridge.exposeInMainWorld("electronAPI", api);
