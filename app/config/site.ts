import type { ReactNode } from "react";

export interface SiteConfig {
  name: string;
  title: string;
  subtitle: string;
  description: string;
  logo: {
    src: string;
    alt: string;
    component?: ReactNode;
  };
  author: {
    name: string;
    url: string;
  };
  meta: {
    defaultTitle: string;
    titleTemplate: string;
    description: string;
  };
  version: string;
}

export const siteConfig: SiteConfig = {
  name: "hero-wars-helper",
  title: "Hero Wars Helper",
  subtitle: "Tools for players",
  description: "A modern React Router v7 template with Supabase authentication, role-based access control, and production-ready tooling",
  logo: {
    src: "/images/hero-wars-alliance-logo.webp",
    alt: "Hero Wars Alliance logo",
  },
  author: {
    name: "Rovani.net",
    url: "https://rovani.net",
  },
  meta: {
    defaultTitle: "Hero Wars Helper",
    titleTemplate: "%s | Hero Wars Helper",
    description: "A modern React Router v7 template with Supabase authentication, role-based access control, and production-ready tooling",
  },
  version: "0.1.0",
};

/**
 * Helper function to format page titles using the configured title template
 * @param pageTitle - The specific page title (optional)
 * @returns Formatted title string
 */
export function formatTitle(pageTitle?: string): string {
  if (!pageTitle) {
    return siteConfig.meta.defaultTitle;
  }
  return siteConfig.meta.titleTemplate.replace('%s', pageTitle);
}