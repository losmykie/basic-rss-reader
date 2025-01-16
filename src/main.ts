// main.ts
import { App, Plugin, PluginSettingTab, Setting, Notice } from "obsidian";
import { RSSReaderSettings, DEFAULT_SETTINGS } from "./settings";

export default class RSSReaderPlugin extends Plugin {
  settings: RSSReaderSettings;

  async onload() {
    console.log("Loading RSS Reader Plugin...");

    await this.loadSettings();

    this.addSettingTab(new RSSReaderSettingTab(this.app, this));

    this.addCommand({
      id: "fetch-rss",
      name: "Fetch RSS Feeds",
      callback: async () => {
        await this.fetchRSSFeeds();
      },
    });
  }

  async fetchRSSFeeds() {
    const feedResults: { name: string; content: string }[] = [];

    for (const feed of this.settings.feedUrls) {
      const proxiedUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
      try {
        const response = await fetch(proxiedUrl);
        if (!response.ok) {
          console.error(`Error fetching feed: ${feed.url} - ${response.status}`);
          continue;
        }

        const json = await response.json();
        const feedData = json.contents;
        feedResults.push({ name: feed.name, content: feedData });
      } catch (error) {
        console.error(`Error fetching feed: ${feed.url}`, error);
      }

      // Rate-limiting: Wait 2 seconds between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await this.saveFeedsToFile(feedResults);
  }

  async saveFeedsToFile(feeds: { name: string; content: string }[]) {
    let content = "";

    feeds.forEach((feed) => {
      content += `# ${feed.name}\n\n`;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(feed.content, "text/xml");
      const items = xmlDoc.getElementsByTagName("item");

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const title = item.getElementsByTagName("title")[0]?.textContent || "No Title";
        const pubDate = item.getElementsByTagName("pubDate")[0]?.textContent || "No Date";
        const link = item.getElementsByTagName("link")[0]?.textContent || "#";
        const comments = item.getElementsByTagName("comments")[0]?.textContent || "#";

        content += `- [ ] **${title}**\n  - Date: ${pubDate}\n  - [Article Link](${link}) | [Comments](${comments})\n\n`;
      }

      content += "\n";
    });

    const folderPath = this.settings.outputFolder;
    const fileName = `${new Date().toISOString().replace(/[:]/g, "-")}.md`;
    const filePath = `${folderPath}/${fileName}`;

    try {
      const folder = this.app.vault.getAbstractFileByPath(folderPath);
      if (!folder) {
        await this.app.vault.createFolder(folderPath);
      }
      await this.app.vault.create(filePath, content);
      new Notice(`RSS feeds saved to ${filePath}`);
    } catch (error) {
      console.error("Error saving feeds:", error);
    }
  }

  onunload() {
    console.log("Unloading RSS Reader Plugin...");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class RSSReaderSettingTab extends PluginSettingTab {
  plugin: RSSReaderPlugin;

  constructor(app: App, plugin: RSSReaderPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "RSS Reader Settings" });

    const feedContainer = containerEl.createEl("div");
    this.plugin.settings.feedUrls.forEach((feed, index) => {
      const feedEl = feedContainer.createEl("div", { cls: "feed-item" });

      new Setting(feedEl)
        .setName("Feed Name")
        .addText((text) =>
          text
            .setValue(feed.name)
            .onChange(async (value) => {
              this.plugin.settings.feedUrls[index].name = value;
              await this.plugin.saveSettings();
            })
        );

      new Setting(feedEl)
        .setName("Feed URL")
        .addText((text) =>
          text
            .setValue(feed.url)
            .onChange(async (value) => {
              this.plugin.settings.feedUrls[index].url = value;
              await this.plugin.saveSettings();
            })
        );

      feedEl.createEl("button", {
        text: "Remove",
        cls: "mod-warning",
      }).onclick = async () => {
        this.plugin.settings.feedUrls.splice(index, 1);
        await this.plugin.saveSettings();
        this.display();
      };
    });

    new Setting(containerEl)
      .setName("Add New Feed")
      .addButton((button) =>
        button
          .setButtonText("Add")
          .onClick(() => {
            this.plugin.settings.feedUrls.push({ name: "", url: "" });
            this.plugin.saveSettings();
            this.display();
          })
      );

    new Setting(containerEl)
      .setName("Output Folder")
      .setDesc("Folder to save the RSS feed files.")
      .addText((text) =>
        text
          .setPlaceholder("rss-feeds")
          .setValue(this.plugin.settings.outputFolder)
          .onChange(async (value) => {
            this.plugin.settings.outputFolder = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
