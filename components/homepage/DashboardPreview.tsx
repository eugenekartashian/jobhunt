import Image from "next/image";
import type { ReactElement } from "react";

import dashboardDemo from "@/public/images/dashboard-demo.png";

export function DashboardPreview(): ReactElement {
  return (
    <section className="border-b border-border bg-surface-tertiary px-6 py-14 sm:px-10 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <Image
          src={dashboardDemo}
          alt="Job Hunt dashboard showing jobs found, match rate, recent activity, and company research activity."
          width={4788}
          height={2416}
          priority
          className="h-auto w-full rounded-xl shadow-preview"
          sizes="(max-width: 768px) 92vw, 1130px"
        />
      </div>
    </section>
  );
}
