# YouTube ClickBait Filter

A powerful Chrome extension that intelligently filters out negative, crisis-related, and clickbait content on YouTube. Features a modern dark-themed interface with real-time badge notifications and per-page filtering statistics.

## ✨ Features

* 🎯 **Smart Content Filtering**: Automatically hides video entries containing negative/crisis keywords (e.g., "crisis", "panic")
* 🎣 **Advanced Clickbait Detection**: Filters out common clickbait phrases (e.g., "shocking", "you won't believe")
* 🔠 **Uppercase Filter**: Intelligently detects and hides titles with excessive uppercase letters
* ❗❓ **Punctuation Filter**: Removes titles with excessive exclamation or question marks
* ⚙️ **Configurable Settings**: Enable or disable each filter independently with persistent settings
* 📊 **Real-time Badge Counter**: Extension icon displays live count of blocked videos
* � **Per-page Filtering**: Counter resets automatically when navigating to new pages
* 🌙 **Modern Dark UI**: Beautiful dark-themed popup with rounded corners
* 🚀 **Performance Optimized**: Efficient DOM monitoring with minimal impact on browsing

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RoryGlenn/YoutubeClickBaitFilter.git
   cd YoutubeClickBaitFilter
   ```

2. **Build the extension**
   ```bash
   npm install
   node build.js
   ```

3. **Load as unpacked extension**
   * Open Chrome and navigate to `chrome://extensions`
   * Enable **Developer mode** (toggle in the top-right corner)
   * Click **Load unpacked** and select the project directory

4. **Verify installation**
   * You should see **YouTube ClickBait Filter** with its custom icon in your extensions
   * Navigate to YouTube to see the filtering in action
   * Check the extension icon for the real-time blocked count badge

## 🎮 Usage

1. **Automatic Filtering**: Visit any YouTube page (homepage, search results, channel feeds) and the extension automatically filters content
2. **Real-time Feedback**: Watch the extension icon badge update with the count of blocked videos
3. **Easy Configuration**: Click the extension icon to access the sleek dark-themed popup:
   * Toggle individual filters (Crisis Keywords, Clickbait, Uppercase, Punctuation)
   * View real-time blocked count for the current page
   * All settings are automatically saved and synced across devices

## ⚙️ Filter Configuration

| Filter Type             | Description                                      | Example Triggers           |
| ----------------------- | ------------------------------------------------ | -------------------------- |
| **Enable Filter**       | Master switch to control all filtering          | On/Off toggle              |
| **Crisis Keywords**     | Blocks negative/crisis-related content          | "crisis", "panic", "war"   |
| **Clickbait Phrases**   | Removes common clickbait terminology            | "shocking", "unbelievable" |
| **Excessive CAPS**      | Filters titles with 3+ consecutive caps words   | "AMAZING NEW UPDATE!!!"    |
| **Excessive Punctuation** | Blocks titles with 3+ exclamation/question marks | "Really??? Amazing!!!"   |

## 📁 Project Structure

```plaintext
├── 📄 manifest.json         # Extension manifest (v3) with icon config
├── 🎯 filter.js            # Content script: applies filters to YouTube
├── 🎨 popup.html           # Modern dark-themed popup interface  
├── ⚙️ popup.js             # Popup logic and settings management
├── 🔧 background.js        # Service worker for badge management
├── 🏗️ build.js             # Build script for bundling
├── 📦 constants.js         # Filter keywords and phrases
├── 🖼️ icons/               # Extension icons (16, 48, 128px)
├── 📋 package.json         # Node.js dependencies
└── 📖 README.md            # Project documentation
```

## 🛠️ Development

**Building the extension:**
```bash
npm install        # Install dependencies
node build.js      # Bundle content script and copy files to dist/
```

**Testing changes:**
* Modify source files as needed
* Run `node build.js` to rebuild
* Reload the extension in `chrome://extensions` 
* Test on YouTube pages

**Architecture:**
* **Content Script** (`filter.js`): Monitors DOM and applies filtering rules
* **Background Script** (`background.js`): Manages badge updates and tab events  
* **Popup** (`popup.html/js`): Provides user interface for settings
* **Build System**: Uses esbuild for efficient bundling

## 🎯 Key Technical Features

* **Per-page Counter Reset**: Automatically resets blocked count when navigating to new URLs
* **Robust Error Handling**: Graceful handling of tab lifecycle events and Chrome API errors
* **Efficient DOM Monitoring**: Uses MutationObserver for real-time content detection
* **Modern Chrome Extension**: Built with Manifest V3 and service workers
* **Cross-device Sync**: Settings synchronized across Chrome instances via `chrome.storage.sync`

## 🔮 Upcoming Features

* 📝 Custom keyword lists via popup interface
* 📊 Enhanced statistics and filtering history
* 🎨 Multiple theme options for popup interface
* 🔧 Advanced filtering rules and regex support
* 📈 Performance analytics and optimization insights

## 🤝 Contributing

Contributions are welcome! Please feel free to:

* 🐛 Report bugs or issues
* 💡 Suggest new features or improvements  
* 🔀 Submit pull requests
* ⭐ Star the repository if you find it useful

**Development workflow:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit with descriptive messages (`git commit -m 'Add amazing feature'`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for a cleaner YouTube experience**

