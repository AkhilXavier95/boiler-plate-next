"use client";

import { memo, useCallback } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

function SignOutButtonComponent() {
  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}

// Memoize to prevent unnecessary re-renders
export const SignOutButton = memo(SignOutButtonComponent);

