"use client";

import { getStrapiURL } from "@/lib/strapi/client";
import { resolveImageUrl } from "@/lib/strapi/media";

export type User = {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  userType?: "jobseeker" | "employer";
  profileImage?: {
    url: string;
    formats?: Record<string, { url: string }>;
  } | null;
};

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    return null;
  }

  try {
    const response = await fetch(`${getStrapiURL()}/api/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      // If unauthorized, clear the JWT
      if (response.status === 401) {
        localStorage.removeItem("jwt");
      }
      return null;
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return "User";
  return user.fullName || user.username || user.email || "User";
}

export function getUserAvatarUrl(user: User | null): string | null {
  if (!user?.profileImage?.url) return null;
  const baseUrl = getStrapiURL();
  return resolveImageUrl(user.profileImage, baseUrl) || null;
}

export function logout() {
  localStorage.removeItem("jwt");
  window.location.href = "/login";
}

