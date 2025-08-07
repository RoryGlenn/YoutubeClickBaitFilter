# YouTube ClickBait Filter

A Chrome extension that filters clickbait content from YouTube to improve your viewing experience.

## Project Structure

```
YoutubeClickBaitFilter/
├── src/                     # Source code
│   ├── background/          # Background script
│   │   └── background.js
│   ├── popup/               # Extension popup
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── content/             # Content scripts
│   │   └── filter.js
│   ├── shared/              # Shared utilities
│   │   └── constants.js
│   └── manifest.json        # Extension manifest
├── assets/                  # Static assets
│   └── icons/               # Extension icons
├── test/                    # Unit tests
├── integration-tests/       # Integration tests
├── scripts/                 # Build scripts
│   └── build.js
├── docs/                    # Documentation
├── dist/                    # Built extension (generated)
└── node_modules/            # Dependencies (generated)
```

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation
```bash
npm install
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
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
