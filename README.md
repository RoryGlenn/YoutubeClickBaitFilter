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
│   ├── popup/               # Extension popup interface
│   ├── content/             # Content scripts for YouTube filtering
│   ├── shared/              # Shared utilities and constants
│   └── manifest.json        # Chrome extension manifest
├── assets/icons/            # Extension icons (active and inactive states)
├── test/                    # Unit tests (48+ tests)
├── integration-tests/       # End-to-end tests
├── scripts/                 # Build and utility scripts
├── docs/                    # Documentation
└── dist/                    # Built extension (generated)
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:constants     # Test clickbait definitions
npm run test:performance   # Run performance benchmarks
npm run test:edge-cases    # Test edge case scenarios
npm run test:integration   # Run integration tests

# Watch mode for development
npm run test:watch
```

**Test Results:** 48+ tests covering filtering logic, performance, edge cases, and integration scenarios.

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

```
YoutubeClickBaitFilter/
├── src/                     # Source code
│   ├── background/          # Background script
│   │   └── background.js    # Badge updates and extension lifecycle
│   ├── popup/               # Extension popup UI
│   │   ├── popup.html       # Popup interface
│   │   ├── popup.css        # Dark theme styling
│   │   └── popup.js         # Settings management and icon switching
│   ├── content/             # Content scripts
│   │   └── filter.js        # Main filtering logic for YouTube pages
│   ├── shared/              # Shared utilities
│   │   └── constants.js     # Clickbait words and phrases definitions
│   └── manifest.json        # Chrome extension manifest (Manifest V3)
├── assets/                  # Static assets
│   └── icons/               # Extension icons (active and grey states)
│       ├── icon*.png        # Active state icons (colored)
│       └── grey/            # Inactive state icons (greyscale)
├── test/                    # Unit tests
│   ├── constants.test.js    # Test clickbait definitions
│   ├── edge-cases.test.js   # Edge case scenarios
│   ├── integration.test.js  # Integration testing
│   ├── performance.test.js  # Performance benchmarks
│   └── video-hiding.test.js # Core filtering logic tests
├── integration-tests/       # End-to-end tests
│   ├── test-logic.js        # Integration test utilities
│   ├── youtube-html-test.html # YouTube structure tests
│   └── complex-sample.html  # Complex scenario testing
├── scripts/                 # Build and utility scripts
│   └── build.js            # esbuild-based build system
├── docs/                   # Documentation
│   ├── README.md           # Detailed project documentation
│   └── PRIVACY_POLICY.md   # Privacy policy and data handling
├── dist/                   # Built extension (generated by build process)
│   ├── manifest.json       # Processed manifest for Chrome
│   ├── background.js       # Background script
│   ├── popup.*             # Popup files
│   ├── filter.bundle.js    # Bundled and minified content script
│   └── icons/              # Icon assets
└── node_modules/           # Dependencies (generated)
```

## 🚀 Development

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (latest version)
- **Chrome Browser** (for testing)

### Installation
```bash
# Clone the repository
git clone https://github.com/RoryGlenn/YoutubeClickBaitFilter.git
cd YoutubeClickBaitFilter

# Install dependencies
npm install
```

### Building
```bash
# Build the extension for production
npm run build

# The built extension will be in the dist/ folder
```

### Development Scripts
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:constants     # Test clickbait definitions
npm run test:performance   # Run performance benchmarks
npm run test:edge-cases    # Test edge case scenarios
npm run test:integration   # Run integration tests

# Watch mode for continuous testing
npm run test:watch

# Code formatting
npm run format            # Format all code files
npm run format:check      # Check if code is properly formatted
```

### Loading the Extension in Chrome

1. **Build the extension**: `npm run build`
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the `dist/` folder
5. **Pin the extension** to your Chrome toolbar for easy access

## 🧪 Testing

The project includes comprehensive testing with multiple test suites:

### Test Coverage
- **48+ tests** covering all major functionality
- **Performance benchmarks** (160k+ titles/second processing)
- **Edge case handling** (empty strings, special characters, etc.)
- **Integration testing** with real YouTube-like HTML structures
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
```

## 🔧 How It Works

### Content Filtering Process
1. **Page Monitoring**: Uses `MutationObserver` to detect new YouTube content
2. **Multi-Stage Filtering**: Applies multiple filtering strategies for comprehensive coverage
3. **Smart Detection**: Analyzes video titles, descriptions, and metadata
4. **DOM Manipulation**: Safely removes filtered content while preserving page functionality
5. **Performance Optimization**: Efficient filtering with minimal impact on page load times

### Filter Types
- **Clickbait Words**: Filters individual words like "shocking", "urgent", "unprecedented"
- **Clickbait Phrases**: Removes videos with phrases like "You Won't Believe", "What Happens Next"
- **Excessive Caps**: Hides titles with 3+ consecutive uppercase words
- **Excessive Punctuation**: Filters titles with 3+ consecutive exclamation/question marks

### Technical Architecture
- **Manifest V3**: Uses latest Chrome extension standards
- **ES2020 Modules**: Modern JavaScript with import/export syntax
- **esbuild Bundling**: Fast, efficient bundling for production
- **Chrome Storage API**: Persistent settings across browser sessions
- **Background Scripts**: Lightweight badge management and messaging

## 📊 Performance

- **Processing Speed**: 160,000+ titles per second
- **Memory Efficient**: <3MB memory increase during operation
- **Low CPU Impact**: Optimized DOM queries and efficient filtering algorithms
- **Battery Friendly**: Minimal background processing, event-driven architecture

## 🔒 Privacy & Security

- **No Data Collection**: Extension works entirely locally
- **No External Requests**: All processing happens on your device
- **Minimal Permissions**: Only requests necessary permissions for YouTube filtering
- **Open Source**: Full source code available for security review

See [Privacy Policy](./docs/PRIVACY_POLICY.md) for complete details.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes and add tests**
4. **Run the test suite**: `npm test`
5. **Format code**: `npm run format`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines
- Follow existing code style (Prettier formatting)
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛠️ Built With

- **JavaScript ES2020** - Modern JavaScript features
- **Chrome Extension API** - Manifest V3
- **esbuild** - Fast JavaScript bundler
- **Jest** - JavaScript testing framework
- **Prettier** - Code formatting
- **Chrome Storage API** - Settings persistence

## 📈 Roadmap

- [ ] Firefox extension support
- [ ] Additional filtering categories
- [ ] Machine learning-based detection
- [ ] Custom word/phrase lists
- [ ] Statistics dashboard
- [ ] Export/import settings

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/RoryGlenn/YoutubeClickBaitFilter/issues) page to report bugs or request features.

---

**Made with ❤️ to improve your YouTube experience**
npm run test:watch
```

### Code Formatting
```bash
npm run format
npm run format:check
```

## Loading the Extension

1. Build the extension: `npm run build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder

## Features

- Filter clickbait words and phrases
- Remove videos with excessive capitalization
- Hide videos with excessive punctuation
- Customizable filter settings
- Real-time video count tracking

For detailed documentation, see the [docs](./docs/) folder.
