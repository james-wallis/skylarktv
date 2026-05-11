import { PageContainer } from "../components/page-container";

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "LocalTV";

export default function Home() {
  return (
    <PageContainer
      description={`Pick a folder on the Settings page to get started. Your library will appear here once it's scanned.`}
      title={`Welcome to ${BRAND_NAME}`}
    />
  );
}
