# YouTube ClickBait Filter

A powerful Chrome extension that intelligently filters out clickbait, negative, and crisis-related content from YouTube to improve your viewing experience. Features a modern dark-themed interface with real-time filtering statistics and dynamic icon switching.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue)](https://github.com/RoryGlenn/YoutubeClickBaitFilter)
[![Tests](https://img.shields.io/badge/Tests-48%20Passing-green)](#testing)
[![Performance](https://img.shields.io/badge/Performance-160k%20titles%2Fs-orange)](#performance)

## ✨ Features

- 🎯 **Smart Content Filtering**: Automatically hides videos with clickbait words like "shocking", "unprecedented", "urgent"
- 🎣 **Advanced Clickbait Detection**: Filters common clickbait phrases like "You Won't Believe", "What Happens Next"
- 🔠 **Uppercase Filter**: Intelligently detects and hides titles with excessive capitalization (3+ uppercase words)
- ❗❓ **Punctuation Filter**: Removes titles with excessive exclamation or question marks (3+ in a row)
- ⚙️ **Configurable Settings**: Enable or disable each filter independently with persistent settings
- 📊 **Real-time Badge Counter**: Extension icon displays live count of blocked videos on current page
- 🔄 **Per-page Filtering**: Counter resets automatically when navigating to new YouTube pages
- 🎨 **Dynamic Icon Switching**: Icon changes color based on filter status (active/inactive)
- 🌙 **Modern Dark UI**: Beautiful dark-themed popup with orange accent colors
- 🚀 **Performance Optimized**: Efficient DOM monitoring with minimal impact on browsing experience

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RoryGlenn/YoutubeClickBaitFilter.git
   cd YoutubeClickBaitFilter
   ```

2. **Install dependencies and build**
   ```bash
   npm install
   npm run build
   ```

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked" and select the `dist/` folder
   - Pin the extension to your toolbar

### Usage

- **Enable/Disable**: Click the extension icon to toggle filters
- **Configure**: Use the popup to enable/disable specific filter types
- **Monitor**: Badge shows count of blocked videos on current page
- **Status**: Icon color indicates filter status (colored = active, grey = inactive)

## 🏗️ Project Structure

```
YoutubeClickBaitFilter/
├── src/                     # Source code
│   ├── background/          # Background script for badge management
│   │   └── background.js    # Badge updates and extension lifecycle
│   ├── popup/               # Extension popup interface
│   │   ├── popup.html       # Popup interface
│   │   ├── popup.css        # Dark theme styling
│   │   └── popup.js         # Settings management and icon switching
│   ├── content/             # Content scripts for YouTube filtering
│   │   └── filter.js        # Main filtering logic for YouTube pages
│   ├── shared/              # Shared utilities and constants
│   │   └── constants.js     # Clickbait words and phrases definitions
│   └── manifest.json        # Chrome extension manifest (Manifest V3)
├── assets/icons/            # Extension icons (active and inactive states)
│   ├── icon*.png           # Active state icons (colored)
│   └── grey/               # Inactive state icons (greyscale)
├── test/                   # Unit tests (48+ tests)
│   ├── constants.test.js   # Test clickbait definitions
│   ├── edge-cases.test.js  # Edge case scenarios
│   ├── integration.test.js # Integration testing
│   ├── performance.test.js # Performance benchmarks
│   └── video-hiding.test.js # Core filtering logic tests
├── integration-tests/      # Browser-based integration tests
│   ├── README.md           # Integration testing guide
│   ├── test-logic.js       # Integration test utilities
│   ├── youtube-html-test.html # Interactive testing interface
│   └── complex-sample.html # Complex YouTube structure samples
├── scripts/                # Build and utility scripts
│   └── build.js           # esbuild-based build system
├── docs/                   # Comprehensive documentation
│   ├── USER_GUIDE.md      # Detailed user instructions
│   ├── DEVELOPMENT.md     # Development workflow guide
│   ├── API.md             # Complete API reference
│   ├── INDEX.md           # Documentation index
│   └── PRIVACY_POLICY.md  # Privacy policy and data handling
└── dist/                   # Built extension (generated)
    ├── manifest.json       # Processed manifest for Chrome
    ├── background.js       # Background script
    ├── popup.*             # Popup files
    ├── filter.bundle.js    # Bundled content script
    └── icons/              # Icon assets
```

## 🧪 Testing

## 🧪 Testing

### Test Coverage
- **48+ tests** covering all major functionality
- **Performance benchmarks** (160k+ titles/second processing)
- **Edge case handling** (empty strings, special characters, etc.)
- **Integration testing** with real YouTube HTML structures
- **Memory usage monitoring** and optimization validation

### Running Tests
```bash
# Full test suite
npm test

# Individual test categories
npm run test:constants     # Clickbait word/phrase definitions
npm run test:performance   # Speed and memory benchmarks  
npm run test:edge-cases    # Boundary conditions and edge cases
npm run test:integration   # End-to-end filtering scenarios

# Watch mode for development
npm run test:watch
```

### Integration Tests
Interactive browser-based tests for validating filter logic against real YouTube content:

```bash
# Start local server for integration tests
python3 -m http.server 8000
# Then open: http://localhost:8000/integration-tests/youtube-html-test.html
```

See [Integration Tests README](./integration-tests/README.md) for detailed usage instructions.

## 📊 Performance

- **Processing Speed**: 160,000+ titles per second
- **Memory Usage**: <3MB increase during operation
- **DOM Query Time**: <1ms for typical YouTube page
- **Extension Load Time**: <100ms startup

## 🔒 Privacy & Security

- **Local Processing**: All filtering happens on your device
- **No Data Collection**: Zero user data transmission or tracking
- **Minimal Permissions**: Only YouTube access and local storage
- **Open Source**: Full source code available for security review

See [Privacy Policy](./docs/PRIVACY_POLICY.md) for complete details.

## 📚 Documentation

- **[User Guide](./docs/USER_GUIDE.md)** - Detailed features and usage instructions
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup, workflow, and contribution guidelines
- **[API Documentation](./docs/API.md)** - Complete API reference for developers
- **[Changelog](./CHANGELOG.md)** - Version history and updates

## 🛠️ Development

### Prerequisites
- Node.js (v16+)
- Chrome Browser

### Development Workflow
```bash
# Install dependencies
npm install

# Build extension
npm run build

# Run tests
npm test

# Format code
npm run format

# Load extension in Chrome for testing
# (Point to dist/ folder in chrome://extensions/)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run the test suite: `npm test`
5. Format code: `npm run format`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

See [Development Guide](./docs/DEVELOPMENT.md) for detailed contribution guidelines.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/RoryGlenn/YoutubeClickBaitFilter/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/RoryGlenn/YoutubeClickBaitFilter/issues)
- **Questions**: [GitHub Discussions](https://github.com/RoryGlenn/YoutubeClickBaitFilter/discussions)

## 🌟 Show Your Support

If this extension improves your YouTube experience, please:
- ⭐ Star this repository
- 🐛 Report bugs or suggest features
- 🤝 Contribute code or documentation
- 📢 Share with others who might benefit

---

**Made with ❤️ to improve your YouTube experience**
