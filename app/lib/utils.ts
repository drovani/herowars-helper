import { clsx, type ClassValue } from "clsx";
import slugify from "slugify";
import { twMerge } from "tailwind-merge";

export function generateSlug(text: string | undefined, suffixToStrip?: string): string {
  if (!text) return "";

  const slug = slugify(text, {
    lower: true, // Convert to lowercase
    strict: true, // Strip special characters
    trim: true, // Trim leading/trailing spaces
  });

  if (suffixToStrip && slug.endsWith(suffixToStrip)) {
    return slug.slice(0, -suffixToStrip.length);
  }
  return slug;
}
export function getEquipmentImageUrl(slug: string, extension: string = "png"): string {
  const goodslug = slug.indexOf("-fragment") < 0 ? slug : slug.substring(0, slug.length - "-fragment".length);
  return `/images/equipment/${goodslug}.${extension}`;
}
export function getHeroImageUrl(slug: string, extension: string = "png"): string {
  return `/images/heroes/${slug}.${extension}`;
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
