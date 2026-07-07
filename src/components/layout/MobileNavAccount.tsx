"use client";

import { useEffect, useState } from "react";
import { NavUserMenu } from "@/src/components/layout/NavUserMenu";
import { useProfile } from "@/src/hooks/use-profile";
import { createClient } from "@/src/lib/supabase/client";

export function MobileNavAccount() {
  const { data: profile } = useProfile();
  const [email, setEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(Boolean(user));
      setEmail(user?.email ?? "");
    });
  }, []);

  if (isAuthenticated === false) {
    return null;
  }

  return <NavUserMenu profile={profile ?? null} email={email} />;
}
