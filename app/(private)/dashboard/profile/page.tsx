"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EditProfileForm } from "@/features/profile/components/EditProfileForm";
import { getCurrentUser, type User } from "@/lib/auth/user";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return <EditProfileForm user={user} onUpdate={fetchUser} />;
}

