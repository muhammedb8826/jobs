"use client";

import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { HeroSection } from "../types/hero.types";

type Props = {
  section: HeroSection | null;
};

function IconMarkup({ svg, className }: { svg?: string; className?: string }) {
  if (!svg) return null;
  return (
    <span
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{
        __html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">${svg}</svg>`,
      }}
    />
  );
}

function normalizeHref(url: string, isExternal: boolean): string {
  if (!url) return "#";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  ) {
    return url;
  }
  return isExternal ? url : `/${url}`;
}

export function HomepageHero({ section }: Props) {
  if (!section) return null;

  const { heading, subHeading, description, buttons, cards } = section;

  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            {heading}{" "}
            <span className="text-primary">{subHeading}</span>
          </h1>

          {/* Description */}
          {description && (
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          )}

          {/* Buttons */}
          {buttons && buttons.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              {buttons.map((button, index) => {
                const href = normalizeHref(button.url, button.isExternal);
                const isPrimary = index === 0;

                if (button.isExternal || href.startsWith("http")) {
                  return (
                    <a
                      key={button.id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                        ${
                          isPrimary
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "bg-background border border-border text-foreground hover:bg-muted"
                        }
                      `}
                    >
                      {isPrimary && <Search className="w-5 h-5" />}
                      {button.title}
                      {isPrimary && <ArrowRight className="w-5 h-5" />}
                    </a>
                  );
                }

                return (
                  <Link
                    key={button.id}
                    href={href}
                    className={`
                      inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                      ${
                        isPrimary
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "bg-background border border-border text-foreground hover:bg-muted"
                      }
                    `}
                  >
                    {isPrimary && <Search className="w-5 h-5" />}
                    {button.title}
                    {isPrimary && <ArrowRight className="w-5 h-5" />}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Stats Cards */}
          {cards && cards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="flex flex-col items-center text-center space-y-3"
                >
                  <div className="text-muted-foreground">
                    <IconMarkup svg={card.icon.iconData} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground">
                    {card.title}
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground">
                    {card.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

