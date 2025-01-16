// settings.ts
export interface RSSReaderSettings {
  feedUrls: { name: string; url: string }[]; // Updated type for feed URLs
  outputFolder: string;
}

export const DEFAULT_SETTINGS: RSSReaderSettings = {
  feedUrls: [], // Default to an empty array of objects
  outputFolder: "rss-feeds", // Default folder for RSS feed outputs
};
