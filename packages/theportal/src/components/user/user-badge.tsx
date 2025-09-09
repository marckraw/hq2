"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function UserBadge() {
  const { data } = useSession();
  const user = data?.user;

  if (!user) return null;

  return (
    <div className="fixed top-3 right-3 flex items-center gap-3 bg-card text-card-foreground border border-border rounded-md px-3 py-1.5 shadow-sm">
      <span className="text-sm">You are logged in as: {user.name || user.email}</span>
      <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </Button>
    </div>
  );
}
