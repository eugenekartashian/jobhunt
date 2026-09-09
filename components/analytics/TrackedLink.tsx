"use client";

import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

import {
  capturePostHogEvent,
  type PostHogClientEvent,
} from "@/lib/posthog-client";

type TrackedLinkProps = {
  href: string;
  className: string;
  event: PostHogClientEvent;
  properties?: Record<string, string | number | boolean>;
  children: ReactNode;
};

export function TrackedLink({
  href,
  className,
  event,
  properties,
  children,
}: TrackedLinkProps): ReactElement {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => capturePostHogEvent(event, properties)}
    >
      {children}
    </Link>
  );
}
