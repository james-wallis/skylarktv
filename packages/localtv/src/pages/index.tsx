const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "LocalTV";

export default function Home() {
  return (
    <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-start justify-center px-8 pb-16 pt-32 md:px-md-gutter lg:px-lg-gutter xl:px-xl-gutter">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-white md:text-6xl">
        {`Welcome to ${BRAND_NAME}`}
      </h1>
      <p className="mt-6 max-w-xl text-base text-gray-400 md:text-lg">
        {
          "Pick a folder on the Settings page to get started. Your library will appear here once it's scanned."
        }
      </p>
    </section>
  );
}
