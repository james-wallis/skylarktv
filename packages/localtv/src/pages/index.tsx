const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "LocalTV";

export default function Home() {
  return (
    <section className="mx-auto max-w-5xl px-8 py-16">
      <h1 className="text-4xl font-bold">{`Welcome to ${BRAND_NAME}`}</h1>
      <p className="mt-4 text-white/60">
        {
          "Pick a folder on the Settings page to get started. Your library will appear here once it's scanned."
        }
      </p>
    </section>
  );
}
