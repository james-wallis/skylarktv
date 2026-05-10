import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrandHeader } from "../components/brand-header";

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
        <style>{`:root { --brand-primary: ${BRAND_PRIMARY}; --brand-accent: ${BRAND_ACCENT}; }`}</style>
      </Head>
      <div className="min-h-screen">
        <BrandHeader />
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </QueryClientProvider>
  );
}
