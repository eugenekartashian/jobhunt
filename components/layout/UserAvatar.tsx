"use client";

import type { ReactElement } from "react";
import { useState } from "react";

type UserAvatarProps = {
  alt: string;
  initials: string;
  src?: string;
};

export function UserAvatar({ alt, initials, src }: UserAvatarProps): ReactElement {
  return src ? <LoadedAvatar key={src} alt={alt} initials={initials} src={src} /> : <span aria-hidden="true">{initials || "P"}</span>;
}

function LoadedAvatar({ alt, initials, src }: Required<UserAvatarProps>): ReactElement {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  if (status === "error") return <span aria-hidden="true">{initials || "P"}</span>;

  return (
    <>
      {status === "loading" ? <span aria-hidden="true">{initials || "P"}</span> : null}
      <img
        src={src}
        alt={alt}
        className={status === "loaded" ? "size-full object-cover" : "hidden"}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        referrerPolicy="no-referrer"
      />
    </>
  );
}
