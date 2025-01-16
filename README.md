# RSS Reader Plugin for Obsidian

A plugin for [Obsidian](https://obsidian.md) that allows you to fetch and save RSS feed updates as Markdown files in your vault.

## Features

- **Fetch RSS Feeds:** Retrieve RSS feed content and save it in a structured Markdown format.
- **Customizable Settings:**
  - Define multiple RSS feeds with names and URLs.
  - Specify the output folder for saved feed files.
- **Interactive Settings Tab:** Manage your feed list and plugin settings via an intuitive UI in Obsidian.
- **Feed Parsing and Formatting:** Automatically parse RSS items, including titles, publication dates, links, and comments.

## Installation

1. Clone or download the repository.
2. Place the plugin files in your Obsidian plugins folder.
3. Enable the plugin in Obsidian via **Settings > Community Plugins**.

## Usage

1. Go to the plugin settings in Obsidian:
   - Define the RSS feeds by providing their names and URLs.
   - Specify the folder where RSS feed updates will be saved.
2. Use the `Fetch RSS Feeds` command to retrieve the latest updates.
3. The feed updates will be saved as Markdown files in the specified folder.

## Markdown Output Example

The plugin saves RSS feed updates in a Markdown format similar to the following:

```markdown
# Feed Name

- [ ] **Article Title**
  - Date: Publication Date
  - [Article Link](https://example.com/article-link) | [Comments](https://example.com/comments-link)

...
