import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import clsx from "clsx";
import { useMotionValueEvent, useScroll } from "motion/react";
import { MdHome, MdMovie, MdTv, MdSettings } from "react-icons/md";
import {
  Navigation,
  NavigationToggle,
  type NavigationLink,
} from "@skylark-apps/skylarktv/src/components/generic/navigation";

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "LocalTV";

const LINKS: NavigationLink[] = [
  { text: "Home", href: "/", icon: <MdHome /> },
  { text: "TV Shows", href: "/tv-shows", icon: <MdTv /> },
  { text: "Movies", href: "/movies", icon: <MdMovie /> },
];

const SETTINGS_LINK: NavigationLink = {
  text: "Settings",
  href: "/settings",
  icon: <MdSettings />,
};

export const AppHeader = () => {
  const { pathname } = useRouter();
  const { scrollYProgress } = useScroll();
  const [compact, setCompact] = useState(false);
  const [mobileNavIsOpen, setMobileNavIsOpen] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (scrollY) => {
    if (!compact && scrollY > 0.001) setCompact(true);
    if (compact && scrollY <= 0.001) setCompact(false);
  });

  const activeHref =
    pathname === "/"
      ? "/"
      : LINKS.find((l) => pathname.startsWith(l.href as string))?.href ||
        pathname;

  return (
    <header
      className={clsx(
        "fixed top-0 z-80 flex w-full flex-col font-display transition-all md:flex-row-reverse",
        compact ? "md:h-14 lg:h-16" : "md:h-24 lg:h-28",
      )}
    >
      <div className="fixed z-90 flex h-mobile-header w-full items-center bg-skylarktv-header px-4 md:relative md:h-full md:w-3/5 md:justify-between md:pr-md-gutter lg:w-2/3 lg:pr-lg-gutter xl:pr-xl-gutter">
        <Link
          className="font-display text-xl font-semibold tracking-tight text-white md:text-2xl lg:text-3xl"
          href="/"
        >
          {BRAND_NAME}
        </Link>
        <ul className="absolute right-0 top-0 flex flex-row bg-skylarktv-primary pl-2 md:hidden">
          <NavigationToggle
            variant={mobileNavIsOpen ? "close" : "open"}
            onClick={() => setMobileNavIsOpen(!mobileNavIsOpen)}
          />
        </ul>
      </div>
      <div className="h-full md:w-2/5 lg:w-1/3">
        <Navigation
          activeHref={activeHref as string}
          links={LINKS}
          mobileNavIsOpen={mobileNavIsOpen}
          search={SETTINGS_LINK}
        />
      </div>
    </header>
  );
};
