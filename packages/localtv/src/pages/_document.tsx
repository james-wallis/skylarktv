import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html dir="ltr" lang="en">
      <Head />
      <body className="overflow-x-hidden bg-gray-900 font-body">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
