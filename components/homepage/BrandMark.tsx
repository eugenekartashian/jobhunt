import Image from "next/image";
import type { ReactElement } from "react";

type BrandMarkProps = {
  size?: "small" | "medium";
};

export function BrandMark({ size = "medium" }: BrandMarkProps): ReactElement {
  const imageSize = size === "small" ? "h-8" : "h-9";

  return (
    <div className="flex items-center">
      <Image
        src="/logo.png"
        alt="Job Hunt"
        width={2154}
        height={730}
        className={`${imageSize} w-auto object-contain`}
        sizes={size === "small" ? "104px" : "118px"}
        priority={size === "small"}
      />
    </div>
  );
}
