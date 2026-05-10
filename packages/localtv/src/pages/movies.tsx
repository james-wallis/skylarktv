export default function Movies() {
  return (
    <section className="mx-auto max-w-5xl px-8 py-16">
      <h1 className="text-3xl font-bold">{"Movies"}</h1>
      <p className="mt-4 text-white/60">
        {
          "No movies yet. Set your Movies folder in Settings to populate this page."
        }
      </p>
    </section>
  );
}
