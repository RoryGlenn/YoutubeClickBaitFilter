# Development Guide - YouTube ClickBait Filter

This guide provides detailed information for developers working on the YouTube ClickBait Filter extension.

## 🛠️ Development Environment Setup

### Prerequisites
- **Node.js**: v16 or higher
- **npm**: Latest version  
- **Git**: For version control
- **Chrome Browser**: For testing and debugging
- **VS Code**: Recommended editor with extensions:
  - Prettier - Code formatter
  - ESLint - JavaScript linting
  - Chrome Debugger - Extension debugging

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/RoryGlenn/YoutubeClickBaitFilter.git
cd YoutubeClickBaitFilter

# Install dependencies
npm install

# Build the extension
npm run build

# Run tests to verify setup
npm test
```

## 📁 Project Architecture

### Directory Structure Explained

```
src/
├── background/
│   └── background.js       # Service worker for badge management
├── content/
│   └── filter.js          # Main filtering logic (injected into YouTube)
├── popup/
│   ├── popup.html         # Extension popup interface
│   ├── popup.css          # Styling (dark theme)
│   └── popup.js           # Settings management and UI logic
├── shared/
│   └── constants.js       # Shared data (clickbait words/phrases)
└── manifest.json          # Extension configuration
```

### Key Design Patterns

#### 1. **Message Passing Architecture**
```javascript
// Content script to background
chrome.runtime.sendMessage({
    type: 'updateBadge',
    count: blockedCount
});

// Popup to content script  
chrome.tabs.sendMessage(tabs[0].id, {
    type: 'updateSettings',
    settings: userSettings
});
```

#### 2. **Settings Persistence**
```javascript
// Save settings
chrome.storage.sync.set(settings, callback);

// Load settings with fallback
chrome.storage.sync.get(defaults, (stored) => {
    userSettings = { ...defaults, ...stored };
});
```

#### 3. **DOM Observation Pattern**
```javascript
const observer = new MutationObserver(runFilter);
observer.observe(document.body, {
    childList: true,
    subtree: true
});
```

## 🔧 Development Workflow

### Daily Development Cycle

1. **Start Development**
   ```bash
   # Pull latest changes
   git pull origin main
   
   # Install any new dependencies
   npm install
   
   # Build extension
   npm run build
   ```

2. **Make Changes**
   - Edit source files in `src/` directory
   - Follow existing code patterns and style
   - Add JSDoc comments for new functions

3. **Test Changes**
   ```bash
   # Run test suite
   npm test
   
   # Run specific tests
   npm run test:performance
   
   # Format code
   npm run format
   ```

4. **Debug Extension**
   - Rebuild: `npm run build`
   - Reload extension in Chrome
   - Test on YouTube pages
   - Check browser console for errors

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: descriptive commit message"
   git push origin feature-branch
   ```

### Hot Reload Development

For faster development, use this workflow:
1. Make changes to source files
2. Run `npm run build` 
3. Click "Reload" on extension in `chrome://extensions/`
4. Refresh YouTube tab to test changes

## 🧪 Testing Strategy

### Test Types and When to Use Them

#### Unit Tests (`test/*.test.js`)
- **Purpose**: Test individual functions and components
- **When to add**: For every new function or significant logic change
- **Example**:
  ```javascript
  test('should filter clickbait words', () => {
      expect(shouldFilter('SHOCKING news today')).toBe(true);
      expect(shouldFilter('Regular video title')).toBe(false);
  });
  ```

#### Integration Tests (`integration-tests/`)
- **Purpose**: Test complete filtering workflows
- **When to add**: For new filter types or major feature changes
- **Example**: Test full YouTube page filtering with real HTML

#### Performance Tests
- **Purpose**: Ensure changes don't degrade performance
- **When to add**: After algorithmic changes or new filters
- **Metrics to monitor**:
  - Processing speed (titles/second)
  - Memory usage
  - DOM query performance

### Writing Good Tests

#### Test Structure
```javascript
describe('Feature Description', () => {
    beforeEach(() => {
        // Setup code
    });
    
    test('should do specific thing', () => {
        // Arrange
        const input = 'test input';
        
        // Act
        const result = functionUnderTest(input);
        
        // Assert
        expect(result).toBe(expectedOutput);
    });
    
    afterEach(() => {
        // Cleanup code
    });
});
```

#### Test Coverage Goals
- **Functions**: 100% coverage for core filtering logic
- **Edge Cases**: Test boundary conditions
- **Error Handling**: Test failure scenarios
- **Performance**: Benchmark critical paths

## 🎨 UI Development Guidelines

### Popup Interface (`src/popup/`)

#### Design Principles
- **Dark Theme**: Use existing color scheme
- **Accessibility**: Support keyboard navigation
- **Responsive**: Works at different popup sizes
- **Consistent**: Follow existing UI patterns

#### CSS Organization
```css
/* Variables for consistency */
:root {
    --bg-color: #2d2d2d;
    --accent-color: #ff6b35;
    --text-color: #ffffff;
}

/* Component-based styling */
.setting {
    /* Setting row styles */
}

.setting input[type="checkbox"] {
    /* Checkbox styles */
}
```

#### Adding New Settings

1. **Add HTML structure**:
   ```html
   <div class="setting">
       <input type="checkbox" id="new-filter" />
       <label for="new-filter" title="Description">New Filter</label>
   </div>
   ```

2. **Add JavaScript handling**:
   ```javascript
   // In popup.js
   document.getElementById('new-filter').addEventListener('change', saveSettings);
   ```

3. **Update settings object**:
   ```javascript
   const userSettings = {
       // existing settings...
       newFilter: true
   };
   ```

## 🔍 Content Script Development

### Understanding YouTube's DOM Structure

YouTube's structure changes frequently. The filter uses multiple strategies:

#### Selector Strategy
```javascript
const videoSelectors = [
    'ytd-video-renderer',           // Standard list view
    'ytd-rich-item-renderer',       // Home page grid
    'ytd-compact-video-renderer',   // Sidebar videos
    'yt-lockup-view-model',         // New 2025+ structure
];
```

#### Title Extraction Strategy
```javascript
const titleSelectors = [
    '#video-title',                 // Primary title selector
    'a[aria-label]',               // Fallback with aria-label
    '.yt-lockup-metadata-view-model-wiz__title', // New structure
];
```

### Adding New Filter Logic

1. **Define the filter function**:
   ```javascript
   function hasNewPattern(text) {
       // Implement detection logic
       return text.includes('pattern');
   }
   ```

2. **Add to filter rules**:
   ```javascript
   export const filterRules = [
       // existing rules...
       {
           flag: 'filterNewPattern',
           test: hasNewPattern
       }
   ];
   ```

3. **Add settings support**:
   - Update `userSettings` default object
   - Add popup UI control
   - Add test cases

### Performance Considerations

#### Efficient DOM Queries
```javascript
// Good: Specific selectors
const videos = document.querySelectorAll('ytd-video-renderer');

// Bad: Overly broad selectors  
const allDivs = document.querySelectorAll('div');
```

#### Batch DOM Operations
```javascript
// Good: Batch removals
videos.forEach(video => {
    if (shouldFilter(video)) {
        video.style.display = 'none'; // Hide first
        video.remove(); // Then remove
    }
});

// Bad: Individual operations with layout thrashing
```

#### Memory Management
```javascript
// Clean up observers when needed
observer.disconnect();

// Remove event listeners
element.removeEventListener('click', handler);
```

## 🏗️ Build System

### esbuild Configuration

The build system uses esbuild for fast bundling:

```javascript
// scripts/build.js
await esbuild.build({
    entryPoints: ['src/content/filter.js'],
    bundle: true,        // Include all imports
    minify: true,       // Compress for production
    platform: 'browser', // Browser environment
    target: ['es2020'], // Modern JavaScript
    outfile: 'dist/filter.bundle.js'
});
```

### Build Process Steps

1. **Clean**: Remove old dist files
2. **Bundle**: Process content script with esbuild
3. **Copy**: Move static files (HTML, CSS, background.js)
4. **Process**: Fix manifest.json paths for dist folder
5. **Assets**: Copy icons with subdirectory support

### Customizing the Build

#### Adding New Entry Points
```javascript
// For multiple bundles
await esbuild.build({
    entryPoints: {
        'content': 'src/content/filter.js',
        'popup': 'src/popup/popup.js'
    },
    // ...other options
});
```

#### Development vs Production Builds
```javascript
const isDev = process.env.NODE_ENV === 'development';

await esbuild.build({
    minify: !isDev,
    sourcemap: isDev,
    // ...
});
```

## 🐛 Debugging Guide

### Chrome DevTools Setup

1. **Enable Extension Debugging**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "background page" or "service worker" link

2. **Content Script Debugging**:
   - Open YouTube page
   - Press F12 to open DevTools
   - Check Console for filtering messages
   - Use Sources tab to set breakpoints

3. **Popup Debugging**:
   - Right-click extension icon
   - Select "Inspect popup"
   - Debug popup.js in opened DevTools

### Common Debugging Patterns

#### Console Logging Strategy
```javascript
// Use prefixed console messages
console.log('YCF:', 'Filtering video:', title);
console.warn('YCF:', 'Error processing:', error);

// Group related logs
console.group('YCF: Filtering pass');
// ... filtering logic
console.groupEnd();
```

#### Error Handling
```javascript
try {
    // Risky operation
    filterVideos();
} catch (error) {
    console.error('YCF: Filter error:', error);
    // Graceful fallback
}
```

### Performance Debugging

#### Memory Usage Monitoring
```javascript
console.log('Memory usage:', performance.memory.usedJSHeapSize);
```

#### Timing Critical Operations
```javascript
const start = performance.now();
filterVideos();
const end = performance.now();
console.log(`Filtering took ${end - start}ms`);
```

## 📦 Release Process

### Version Management

1. **Update Version Numbers**:
   - `package.json`: npm version
   - `src/manifest.json`: Extension version
   - Follow semantic versioning (major.minor.patch)

2. **Update Changelog**:
   - Document new features
   - List bug fixes
   - Note breaking changes

3. **Test Release Build**:
   ```bash
   npm test
   npm run build
   # Test extension manually
   ```

### Git Workflow

#### Branch Strategy
```bash
# Feature development
git checkout -b feature/new-feature
# ... make changes
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create pull request

# Bug fixes
git checkout -b fix/bug-description
# ... fix bug
git commit -m "fix: resolve bug description"
```

#### Commit Message Format
```
type(scope): description

feat: new feature
fix: bug fix
docs: documentation update
style: code style changes
refactor: code refactoring
test: test updates
chore: maintenance tasks
```

### Chrome Web Store Deployment

1. **Prepare Release Package**:
   - Build production version
   - Zip dist folder contents
   - Include store assets (screenshots, descriptions)

2. **Store Listing Updates**:
   - Update feature descriptions
   - Add new screenshots if UI changed
   - Update privacy policy if needed

## 🚀 Performance Optimization

### Monitoring Performance

#### Key Metrics
- **Title Processing Speed**: Aim for >100k titles/second
- **Memory Growth**: <5MB increase during heavy use
- **DOM Query Time**: <10ms for page analysis
- **Extension Load Time**: <100ms startup

#### Profiling Tools
```javascript
// Performance marks
performance.mark('filter-start');
// ... filtering code
performance.mark('filter-end');
performance.measure('filtering', 'filter-start', 'filter-end');
```

### Optimization Strategies

#### Algorithm Optimization
```javascript
// Good: Early exit conditions
function shouldFilter(text) {
    if (!userSettings.enabled) return false;
    
    // Check fastest filters first
    if (userSettings.filterPunctuation && hasExcessivePunctuation(text)) {
        return true;
    }
    
    // More expensive checks last
    return checkClickbaitWords(text);
}
```

#### DOM Optimization
```javascript
// Good: Cache DOM queries
const videoContainers = document.querySelectorAll(videoSelectors.join(','));

// Bad: Repeated queries
document.querySelectorAll('ytd-video-renderer').forEach(/* ... */);
document.querySelectorAll('ytd-rich-item-renderer').forEach(/* ... */);
```

---

This development guide should help you contribute effectively to the YouTube ClickBait Filter project. For questions or clarifications, please refer to the main documentation or open an issue on GitHub.
