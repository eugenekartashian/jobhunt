import Image from "next/image";
import type { ReactElement } from "react";

type FeaturePoint = {
  title: string;
  body: string;
  accent: "accent" | "info" | "success";
};

type FeatureShowcaseProps = {
  title: string;
  points: FeaturePoint[];
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  imageFirst?: boolean;
};

const accentClasses: Record<FeaturePoint["accent"], string> = {
  accent: "border-accent",
  info: "border-info",
  success: "border-success",
};

export function FeatureShowcase({
  title,
  points,
  image,
  imageFirst = false,
}: FeatureShowcaseProps): ReactElement {
  const copy = (
    <div className="flex min-h-[560px] flex-col justify-center bg-surface">
      <div className="px-8 py-12 sm:px-14 lg:px-16">
        <h2 className="max-w-md text-4xl font-bold leading-[1.08] text-text-slate sm:text-section-display">
          {title}
        </h2>
      </div>
      <ul className="border-t border-border">
        {points.map((point) => (
          <li
            key={point.title}
            className={`border-l-2 ${accentClasses[point.accent]} border-b border-border px-8 py-7 last:border-b-0 sm:px-14 lg:px-16`}
          >
            <h3 className="text-base font-bold leading-6 text-text-slate">
              {point.title}
            </h3>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-text-secondary">
              {point.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );

  const visual = (
    <div className="flex min-h-[560px] items-center justify-center bg-surface-muted px-8 py-12 sm:px-12">
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className="h-auto w-full max-w-xl rounded-xl shadow-card"
        sizes="(max-width: 768px) 86vw, 570px"
      />
    </div>
  );

  return (
    <section className="grid border-b border-border lg:grid-cols-2">
      {imageFirst ? (
        <>
          <div className="border-b border-border lg:border-r lg:border-b-0">
            {visual}
          </div>
          {copy}
        </>
      ) : (
        <>
          <div className="border-b border-border lg:border-r lg:border-b-0">
            {copy}
          </div>
          {visual}
        </>
      )}
    </section>
  );
}
