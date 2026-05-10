import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/700.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "../styles/globals.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppBackgroundGradient } from "@skylark-apps/skylarktv/src/components/generic/app-background-gradient";
import { AppHeader } from "../components/app-header";

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "LocalTV";
const BRAND_PRIMARY = process.env.NEXT_PUBLIC_BRAND_PRIMARY || "#5b45ce";
const BRAND_ACCENT = process.env.NEXT_PUBLIC_BRAND_ACCENT || "#7760d6";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchInterval: false,
          },
        },
      }),
  );

  // First-launch: route to /settings until both libraries are picked.
  useEffect(() => {
    if (!window.electronAPI) return;
    if (router.pathname === "/settings") return;
    void window.electronAPI.getLibraries().then(({ tv, movies }) => {
      if (!tv && !movies) {
        void router.replace("/settings");
      }
    });
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>{BRAND_NAME}</title>
        <style>{`:root {
          --skylarktv-primary-color: ${BRAND_PRIMARY};
          --skylarktv-accent-color: ${BRAND_ACCENT};
          --skylarktv-header-color: rgba(12, 12, 12, 0.7);
        }`}</style>
      </Head>
      <div className="relative min-h-screen w-full overflow-x-hidden">
        <AppBackgroundGradient />
        <AppHeader />
        <div className="relative z-10 h-full w-full pt-mobile-header md:pt-0">
          <Component {...pageProps} />
        </div>
      </div>
    </QueryClientProvider>
  );
}
