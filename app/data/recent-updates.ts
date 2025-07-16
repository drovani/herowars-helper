// ABOUTME: Configuration for recent updates displayed on the homepage
// ABOUTME: Extracted from homepage component for easier maintenance

export interface RecentUpdatesConfig {
  asof: Date;
  updates: string[];
}

export const recentUpdates: RecentUpdatesConfig = {
  asof: new Date("2025-07-15"),
  updates: [
    "Completed Hero Repository migration - all hero data now uses database instead of JSON files",
    "Added equipment database for gray, green, blue, violet, and orange items with crafting trees",
    "Began inputting some hero information",
    "Improved mission browser with equipment drop locations",
    "Added Titan guide with upgrade priorities",
  ],
};