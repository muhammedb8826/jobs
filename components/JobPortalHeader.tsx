"use client";

import Link from "next/link";

export function JobPortalHeader() {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="stroke-primary-foreground"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">JobPortal</span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/jobs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Find Jobs
            </Link>
            <Link
              href="/employers"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              For Employers
            </Link>
          </nav>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity px-5 py-2 rounded-lg"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

