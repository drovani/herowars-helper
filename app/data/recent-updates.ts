// ABOUTME: Configuration for recent updates displayed on the homepage
// ABOUTME: Extracted from homepage component for easier maintenance

export interface RecentUpdatesConfig {
  asof: Date;
  updates: string[];
}

export const recentUpdates: RecentUpdatesConfig = {
  asof: new Date("2025-10-20"),
  updates: [
    "Enhanced application reliability with comprehensive error boundaries for better error handling and recovery",
    "Added bulk hero addition feature - quickly add all heroes to your roster with one click",
    "Completed major Player Roster UI refactor - mobile-inspired interface with sidebar hero selection and six detail views",
    "Added hero level (1-120) and talisman level (0-50) tracking with enhanced sorting options",
    "Implemented deep linking for roster views (/player/roster/:heroSlug/:view) with responsive mobile layout",
    "Completed Hero Repository migration - all hero data now uses database instead of JSON files",
    "Added equipment database for gray, green, blue, violet, and orange items with crafting trees",
    "Began inputting some hero information",
    "Improved mission browser with equipment drop locations",
    "Added Titan guide with upgrade priorities",
  ],
};
