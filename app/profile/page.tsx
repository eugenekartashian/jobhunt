import type { ReactElement } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { requireUserAuthenticated } from "@/lib/insforge-auth";
import { getProfileForUser } from "@/lib/profile";

export default async function ProfilePage(): Promise<ReactElement> {
  const user = await requireUserAuthenticated();
  const profile = await getProfileForUser(user.id);

  return (
    <>
      <Navbar activeHref="/profile" user={user} />
      <ProfilePageClient userEmail={user.email ?? ""} userId={user.id} initialProfile={profile} />
    </>
  );
}
