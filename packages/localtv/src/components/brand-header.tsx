import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "clsx";

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "LocalTV";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/tv-shows", label: "TV Shows" },
  { href: "/movies", label: "Movies" },
];

export const BrandHeader = () => {
  const { pathname } = useRouter();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/70 px-8 py-4 backdrop-blur">
      <Link className="text-xl font-bold tracking-tight text-white" href="/">
        {BRAND_NAME}
      </Link>
      <nav className="flex gap-6 text-sm">
        {NAV.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              className={clsx(
                "transition-colors",
                isActive
                  ? "text-brand-primary"
                  : "text-white/70 hover:text-white",
              )}
              href={href}
              key={href}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <Link
        className="text-sm text-white/60 transition-colors hover:text-white"
        href="/settings"
      >
        {"Settings"}
      </Link>
    </header>
  );
};
