import { app, BrowserWindow, shell } from "electron";
import { createServer, type Server } from "http";
import { createReadStream, statSync } from "fs";
import { extname, join, normalize, resolve } from "path";
import { AddressInfo } from "net";

const RENDERER_OUT_DIR = resolve(__dirname, "../../skylarktv/out");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

let server: Server | undefined;
let mainWindow: BrowserWindow | undefined;

function resolveStaticPath(urlPath: string): string | null {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const candidates = [
    join(RENDERER_OUT_DIR, normalized),
    join(RENDERER_OUT_DIR, normalized, "index.html"),
    join(RENDERER_OUT_DIR, `${normalized}.html`),
  ];
  for (const candidate of candidates) {
    if (!candidate.startsWith(RENDERER_OUT_DIR)) continue;
    try {
      const stat = statSync(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      // continue
    }
  }
  return null;
}

function startRendererServer(): Promise<string> {
  return new Promise((res, rej) => {
    server = createServer((req, response) => {
      const url = req.url || "/";
      const filePath =
        resolveStaticPath(url) ?? join(RENDERER_OUT_DIR, "404.html");

      try {
        const stat = statSync(filePath);
        if (!stat.isFile()) {
          response.statusCode = 404;
          response.end("Not Found");
          return;
        }
        response.setHeader(
          "Content-Type",
          MIME_TYPES[extname(filePath).toLowerCase()] ??
            "application/octet-stream",
        );
        response.setHeader("Content-Length", stat.size);
        createReadStream(filePath).pipe(response);
      } catch {
        response.statusCode = 404;
        response.end("Not Found");
      }
    });

    server.on("error", rej);
    server.listen(0, "127.0.0.1", () => {
      const address = server!.address() as AddressInfo;
      res(`http://127.0.0.1:${address.port}`);
    });
  });
}

async function createMainWindow(): Promise<void> {
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  const rendererOrigin = devUrl ?? (await startRendererServer());

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#0c0c0c",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  await mainWindow.loadURL(rendererOrigin);
}

app.whenReady().then(async () => {
  await createMainWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  server?.close();
});
