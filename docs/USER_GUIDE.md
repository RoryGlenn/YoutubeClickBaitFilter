# User Guide - YouTube ClickBait Filter

Complete user guide for the YouTube ClickBait Filter Chrome extension. This guide covers detailed features, installation methods, configuration options, and troubleshooting.

## ✨ Features Overview

### 🎯 **Smart Content Filtering**
- Automatically hides video entries containing negative/crisis keywords
- Configurable word list including terms like "crisis", "panic", "shocking", "unprecedented"
- Real-time processing of new content as it loads

### 🎣 **Advanced Clickbait Detection** 
- Filters out common clickbait phrases like "You Won't Believe", "What Happens Next"
- Pattern matching for typical clickbait sentence structures
- Continuously updated phrase database

### 🔠 **Uppercase Filter**
- Intelligently detects titles with excessive uppercase letters (3+ words)
- Preserves legitimate use of caps (acronyms, proper nouns)
- Customizable sensitivity settings

### ❗❓ **Punctuation Filter**
- Removes titles with excessive exclamation or question marks (3+ consecutive)
- Maintains readability while filtering sensationalist content
- Handles mixed punctuation patterns

### ⚙️ **Configurable Settings**
- Enable or disable each filter independently
- Persistent settings using Chrome's sync storage
- Real-time settings updates without page refresh

### 📊 **Real-time Statistics**
- Extension badge shows live count of blocked videos
- Per-page filtering with automatic reset on navigation
- Detailed filtering statistics in popup

### 🎨 **Dynamic Visual Feedback**
- Icon changes color based on filter status (colored when active, grey when inactive)
- Modern dark UI with orange accent colors
- Smooth animations and transitions

## � Installation & Setup

### Method 1: From Source (Recommended for Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/RoryGlenn/YoutubeClickBaitFilter.git
   cd YoutubeClickBaitFilter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked" and select the `dist/` folder
   - Pin the extension to your toolbar for easy access

### Method 2: Development Mode

For active development with automatic rebuilds:

```bash
# Install dependencies
npm install

# Build and watch for changes
npm run build
# Re-run build command after making changes

# Run tests continuously
npm run test:watch
```

## 🏗️ Architecture & Technical Details

### Project Structure
```
YoutubeClickBaitFilter/
├── src/                     # Source code
│   ├── background/          # Background script
│   │   └── background.js    # Badge management, message handling
│   ├── popup/               # Extension popup interface
│   │   ├── popup.html       # Main popup structure
│   │   ├── popup.css        # Dark theme styling, animations
│   │   └── popup.js         # Settings management, icon switching
│   ├── content/             # Content scripts (injected into pages)
│   │   └── filter.js        # Main filtering logic, DOM manipulation
│   ├── shared/              # Shared utilities and constants
│   │   └── constants.js     # Clickbait definitions, filter patterns
│   └── manifest.json        # Extension configuration (Manifest V3)
├── assets/icons/            # Extension icons (multiple sizes and states)
├── test/                    # Comprehensive test suite
├── integration-tests/       # End-to-end testing
├── scripts/                 # Build and development tools
└── docs/                    # Documentation
```

### Core Components

#### Content Script (`src/content/filter.js`)
- **Purpose**: Main filtering engine that runs on YouTube pages
- **Functionality**:
  - DOM observation using `MutationObserver`
  - Multi-pass filtering strategy for comprehensive coverage
  - Performance-optimized element selection
  - Safe DOM manipulation to avoid breaking YouTube functionality
  - Real-time badge updates via message passing

#### Background Script (`src/background/background.js`)
- **Purpose**: Manages extension badge and handles cross-tab communication
- **Functionality**:
  - Badge text and color management
  - Message routing between content scripts and popup
  - Extension lifecycle event handling
  - Error handling and recovery

#### Popup Interface (`src/popup/`)
- **Purpose**: User interface for extension settings and statistics
- **Functionality**:
  - Settings persistence using `chrome.storage.sync`
  - Real-time settings updates
  - Dynamic icon switching based on filter state
  - Visual feedback and statistics display

### Technical Implementation

#### Filtering Algorithm
1. **Element Detection**: Identifies YouTube video containers using comprehensive selectors
2. **Content Extraction**: Extracts titles from various possible DOM locations
3. **Filter Application**: Applies enabled filters in sequence
4. **DOM Manipulation**: Safely removes filtered content
5. **Performance Monitoring**: Tracks processing time and memory usage

#### Filter Types Implementation

**Clickbait Words Filter**:
```javascript
{
    flag: 'filterClickbaitWords',
    test: (text) => CLICKBAIT_WORDS.some((w) => text.toLowerCase().includes(w))
}
```

**Uppercase Filter**:
```javascript
{
    flag: 'filterUppercase', 
    test: hasThreeUpperCaseWords  // Counts consecutive uppercase words
}
```

**Punctuation Filter**:
```javascript
{
    flag: 'filterPunctuation',
    test: hasThreeOrMoreMarks     // Detects excessive punctuation
}
```

#### Performance Optimizations
- **Efficient Selectors**: Targeted DOM queries to minimize processing time
- **Batch Processing**: Groups DOM operations to reduce reflow/repaint
- **Memory Management**: Cleanup of observers and event listeners
- **Throttling**: Rate-limited processing during rapid DOM changes

## 🧪 Testing Framework

### Test Coverage
- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end filtering scenarios  
- **Performance Tests**: Speed and memory benchmarks
- **Edge Case Tests**: Boundary conditions and error handling

### Test Categories

#### Constants Testing (`test/constants.test.js`)
```bash
npm run test:constants
```
- Validates clickbait word and phrase definitions
- Ensures comprehensive coverage of common clickbait patterns
- Tests for duplicates and edge cases

#### Performance Testing (`test/performance.test.js`)
```bash
npm run test:performance
```
- Processing speed benchmarks (160k+ titles/second)
- Memory usage monitoring
- DOM manipulation performance
- Algorithm efficiency comparisons

#### Edge Cases (`test/edge-cases.test.js`)
```bash
npm run test:edge-cases
```
- Empty string handling
- Special character processing
- Unicode and international content
- Malformed HTML structures

#### Integration Testing (`test/integration.test.js`)
```bash  
npm run test:integration
```
- Full filtering workflow testing
- Settings persistence validation
- Message passing between components
- Real-world YouTube structure simulation

### Running Tests

```bash
# Full test suite
npm test

# Specific test categories
npm run test:constants
npm run test:performance  
npm run test:edge-cases
npm run test:integration

# Watch mode for development
npm run test:watch

# Test with coverage reporting
npm test -- --coverage
```

## 🔧 Development Guidelines

### Code Style
- **ES2020 modules** with import/export syntax
- **Prettier formatting** with 4-space indentation
- **JSDoc comments** for all public functions
- **Async/await** patterns for Promise handling

### Adding New Features

1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Write tests first**: Add test cases for new functionality  
3. **Implement feature**: Add code following existing patterns
4. **Update documentation**: Update relevant README sections
5. **Test thoroughly**: Ensure all tests pass
6. **Format code**: Run `npm run format`

### Adding New Filter Types

1. **Define constants** in `src/shared/constants.js`
2. **Add filter rule** to `filterRules` array in `src/content/filter.js`
3. **Add settings toggle** in `src/popup/popup.html` and `src/popup/popup.js`
4. **Write tests** for the new filter functionality
5. **Update documentation** with new filter description

### Build Process

The build system uses **esbuild** for fast, efficient bundling:

```javascript
// Build configuration (scripts/build.js)
await esbuild.build({
    entryPoints: ['src/content/filter.js'],
    bundle: true,           // Include all imports
    minify: true,          // Compress for production  
    platform: 'browser',   // Browser-compatible output
    target: ['es2020'],    // Modern JavaScript features
    outfile: 'dist/filter.bundle.js'
});
```

## 🚀 Performance Characteristics

### Benchmarks
- **Processing Speed**: 160,000+ titles per second
- **Memory Usage**: <3MB increase during heavy filtering
- **DOM Query Time**: <1ms for typical video page
- **Filter Application**: <0.01ms per title on average

### Optimization Strategies
- **Lazy Loading**: Filters only applied when content is visible
- **Efficient Selectors**: Minimal DOM traversal
- **Event Debouncing**: Throttled processing during rapid changes
- **Memory Cleanup**: Proper cleanup of observers and listeners

## 🔒 Privacy & Security

### Data Handling
- **Local Processing**: All filtering happens on your device
- **No External Requests**: Extension works completely offline
- **Minimal Permissions**: Only YouTube access and local storage
- **No Tracking**: Zero user data collection or analytics

### Security Measures
- **Content Security Policy**: Strict CSP prevents code injection
- **Sanitized DOM Manipulation**: Safe removal of filtered content
- **Error Handling**: Graceful degradation on errors
- **Permissions Audit**: Regular review of required permissions

## 🛠️ Troubleshooting

### Common Issues

**Extension not working on YouTube:**
- Ensure extension is enabled in `chrome://extensions/`
- Check that YouTube permissions are granted
- Try disabling and re-enabling the extension
- Reload YouTube pages after enabling

**Filters not applying:**
- Verify filters are enabled in popup settings
- Check browser console for JavaScript errors
- Try building and reloading extension: `npm run build`

**Performance issues:**
- Disable unused filters to improve performance
- Check for browser extensions conflicts
- Monitor memory usage in Chrome DevTools

### Debug Mode

Enable console logging for debugging:
1. Open Chrome DevTools (F12)
2. Navigate to YouTube page
3. Check Console tab for filtering messages
4. Look for "✓ Filtering video" and "✗ Keeping video" messages

### Development Debugging

```bash
# Run tests with verbose output
npm test -- --verbose

# Check build errors
npm run build

# Validate code formatting
npm run format:check

# Run specific test file
npm test test/performance.test.js
```

## 📈 Future Enhancements

### Planned Features
- [ ] **Machine Learning Integration**: AI-powered clickbait detection
- [ ] **Custom Filter Lists**: User-defined words and phrases
- [ ] **Statistics Dashboard**: Detailed filtering analytics
- [ ] **Export/Import Settings**: Backup and restore configuration
- [ ] **Firefox Support**: Cross-browser compatibility
- [ ] **Additional Platforms**: Support for other video platforms

### Technical Improvements
- [ ] **Service Worker Optimization**: Enhanced background script efficiency
- [ ] **Real-time Updates**: Dynamic filter updates without extension reload
- [ ] **Advanced Caching**: Improved performance through intelligent caching
- [ ] **Accessibility Features**: Screen reader and keyboard navigation support

## 🤝 Contributing

### Getting Started
1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a feature branch
4. Make changes and add tests
5. Submit a pull request

### Contribution Guidelines
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting
- Use descriptive commit messages

### Areas for Contribution
- **Filter Accuracy**: Improve detection algorithms
- **Performance**: Optimize processing speed and memory usage
- **User Interface**: Enhance popup design and usability
- **Testing**: Expand test coverage and edge cases
- **Documentation**: Improve guides and examples

---

**For more information, visit the [GitHub repository](https://github.com/RoryGlenn/YoutubeClickBaitFilter)**

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

