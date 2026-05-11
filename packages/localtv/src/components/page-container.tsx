import type { ReactNode } from "react";

// Layout shell matching SkylarkTV's <ListObjects> page chrome:
// gray-900 background, gutter-based horizontal padding that grows with
// breakpoints, and a left-aligned title + description block.
// Visual parity is intentional — the SkylarkTV component proper is too
// coupled to translation/grid/skeleton primitives to import directly.
export const PageContainer = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) => (
  <div className="flex w-full flex-col justify-center bg-gray-900 py-4 font-body md:py-20">
    <div className="px-gutter sm:px-sm-gutter md:pt-20 lg:px-lg-gutter xl:px-xl-gutter">
      <div className="my-10 text-white">
        <h1 className="text-[40px] font-medium md:text-[56px]">{title}</h1>
        {description ? (
          <div className="text-[16px] text-gray-300">{description}</div>
        ) : null}
      </div>
      {children}
    </div>
  </div>
);
