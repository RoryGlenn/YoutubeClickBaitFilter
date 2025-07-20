# YouTube ClickBait Filter

A simple Chrome extension that filters out negative, crisis-related, and clickbait titles on YouTube, with configurable options for uppercase and excessive punctuation filtering.

## Features

* ✅ **Content Filtering**: Automatically hides video entries containing negative/crisis keywords (e.g., "crisis", "panic").
* 🎣 **Clickbait Filtering**: Filters out common clickbait phrases (e.g., "shocking", "you won't believe").
* 🔠 **Uppercase Filter**: Option to hide titles with excessive uppercase letters.
* ❗❓ **Punctuation Filter**: Option to hide titles with excessive exclamation or question marks.
* ⚙️ **Configurable Settings**: Enable or disable each filter independently via the popup, with settings saved in `chrome.storage.sync`.
* 📊 **Blocked Count**: Displays the number of videos filtered on the current page.

## Installation

1. 📥 **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/youtube-clickbait-filter.git
   cd youtube-clickbait-filter
   ```

2. 🚀 **Load as an unpacked extension**

   * 🔍 Open Chrome and navigate to `chrome://extensions`
   * 🛠 Enable **Developer mode** (toggle in the top-right corner)
   * 📂 Click **Load unpacked** and select the project directory

3. ✅ **Verify Installation**

   * 👁️ You should see **YouTube ClickBait Filter** in your list of extensions
   * ▶️ Navigate to YouTube to see the filtering in action

## Usage

1. ▶️ Visit any YouTube page (e.g., the homepage, search results, channel feed).
2. 🔍 The extension will automatically hide videos matching your filter criteria.
3. ⚙️ Click the extension icon to open the popup:

   * 🔄 Toggle individual filters (Bad keywords, Clickbait, Uppercase, Punctuation).
   * 📊 View the count of videos currently filtered on the active tab.

## Configuration Options

| Setting                | Description                                 |
| ---------------------- | ------------------------------------------- |
| **Enable Filter**      | Master switch to turn all filtering on/off. |
| **Filter Bad**         | Hide titles with negative/crisis keywords.  |
| **Filter Clickbait**   | Hide titles with common clickbait phrases.  |
| **Filter Uppercase**   | Hide titles with excessive uppercase text.  |
| **Filter Punctuation** | Hide titles with too many `!` or `?`.       |

## File Structure

```plaintext
├── filter.js       # Content script: applies filters to YouTube pages
├── popup.html      # Popup UI markup
├── popup.js        # Popup logic and storage handling
├── manifest.json   # Extension manifest (v3)
├── package.json    # Node metadata (optional)
└── README.md       # Project documentation
```

## Development

* 🛠 No build step is required; simply modify the JavaScript and HTML files directly.
* 🔄 To test changes, reload the extension in `chrome://extensions` (click the reload icon).
* Future improvements may include:

  * 📝 Custom keyword lists via the popup
  * 🌙 Dark mode support for the popup
  * 📈 Statistics or history of filtered videos

## Contributing

Contributions and suggestions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

