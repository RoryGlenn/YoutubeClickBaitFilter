# API Documentation - YouTube ClickBait Filter

This document provides detailed API documentation for developers working with or extending the YouTube ClickBait Filter extension.

## 📋 Table of Contents

- [Core APIs](#core-apis)
- [Content Script API](#content-script-api)
- [Background Script API](#background-script-api)
- [Popup Interface API](#popup-interface-api)
- [Chrome Extension APIs](#chrome-extension-apis)
- [Message Passing](#message-passing)
- [Storage API](#storage-api)
- [Filter Rules API](#filter-rules-api)

## 🔧 Core APIs

### Filter Engine

#### `shouldFilter(text: string): boolean`

Determines whether a given text should be filtered based on enabled rules.

**Parameters:**
- `text` (string): The text content to evaluate

**Returns:**
- `boolean`: `true` if text should be filtered, `false` otherwise

**Example:**
```javascript
const title = "SHOCKING video you won't believe!!!";
const shouldHide = shouldFilter(title); // returns true
```

#### `filterRules: Array<FilterRule>`

Array of filter rule objects that define filtering logic.

**Type Definition:**
```typescript
interface FilterRule {
    flag: string;                    // Setting name (e.g., 'filterClickbaitWords')
    test: (text: string) => boolean; // Function to test if text matches rule
}
```

**Example:**
```javascript
export const filterRules = [
    {
        flag: 'filterClickbaitWords',
        test: (text) => CLICKBAIT_WORDS.some((w) => text.toLowerCase().includes(w))
    },
    {
        flag: 'filterUppercase',
        test: hasThreeUpperCaseWords
    }
];
```

### Utility Functions

#### `hasThreeUpperCaseWords(text: string): boolean`

Checks if text contains three or more consecutive uppercase words.

**Parameters:**
- `text` (string): Text to analyze

**Returns:**
- `boolean`: `true` if 3+ uppercase words found

**Example:**
```javascript
hasThreeUpperCaseWords("WATCH THIS AMAZING VIDEO"); // returns true
hasThreeUpperCaseWords("Watch this amazing video"); // returns false
```

#### `hasThreeOrMoreMarks(text: string): boolean`

Checks if text contains three or more consecutive punctuation marks.

**Parameters:**
- `text` (string): Text to analyze

**Returns:**
- `boolean`: `true` if 3+ consecutive punctuation marks found

**Example:**
```javascript
hasThreeOrMoreMarks("What happens next???"); // returns true
hasThreeOrMoreMarks("What happens next?");   // returns false
```

## 📄 Content Script API

### Main Functions

#### `runFilter(): void`

Executes the complete filtering process on the current page.

**Behavior:**
- Checks if filtering is enabled
- Runs all filter methods in sequence
- Updates badge count
- Logs filtering results

**Example:**
```javascript
// Called automatically by MutationObserver
runFilter();
```

#### `loadSettings(): Promise<void>`

Loads user settings from Chrome storage.

**Returns:**
- `Promise<void>`: Resolves when settings are loaded

**Example:**
```javascript
await loadSettings();
console.log('Settings loaded:', userSettings);
```

#### `updateBadge(): void`

Sends message to background script to update extension badge.

**Example:**
```javascript
blockedCount = 5;
updateBadge(); // Badge will show "5"
```

### DOM Filtering Methods

#### `filterStandardCards(): void`

Filters standard YouTube video card elements.

**Targets:**
- `ytd-video-renderer` (list view)
- `ytd-rich-item-renderer` (grid view)
- `ytd-compact-video-renderer` (sidebar)
- `yt-lockup-view-model` (new structure)

#### `filterAriaLabels(): void`

Filters elements based on their `aria-label` attributes.

#### `filterNewLayouts(): void`

Handles newer YouTube layout structures and edge cases.

#### `filterRemainingVideos(): void`

Final pass to catch any videos missed by other methods.

### Observer Setup

#### `setupObserver(): void`

Initializes DOM mutation observer for dynamic content.

**Configuration:**
```javascript
new MutationObserver(runFilter).observe(document.body, {
    childList: true,
    subtree: true
});
```

### Message Handling

#### `registerMessageHandlers(): void`

Sets up message listeners for communication with popup and background scripts.

**Supported Messages:**
- `updateSettings`: Update filter settings
- `getBlockedCount`: Return current blocked count

## 🔄 Background Script API

### Badge Management

#### `updateBadge(count: number, tabId: number): void`

Updates the extension badge text and color.

**Parameters:**
- `count` (number): Number to display on badge
- `tabId` (number): Target tab ID

**Behavior:**
- Sets badge text to count value
- Updates badge color based on count (red for >0, grey for 0)

**Example:**
```javascript
updateBadge(10, tabId); // Shows "10" on badge with red background
updateBadge(0, tabId);  // Shows "0" on badge with grey background
```

### Message Handling

#### Background Message Types

**`updateBadge`**
```javascript
{
    type: 'updateBadge',
    count: number
}
```

**Response:** Updates badge for sending tab

## 🎨 Popup Interface API

### Settings Management

#### `loadSettings(): Promise<void>`

Loads and applies settings to popup interface.

**Behavior:**
- Retrieves settings from Chrome storage
- Updates checkbox states in popup
- Loads blocked count for current tab

#### `saveSettings(): Promise<void>`

Saves current popup settings and notifies content script.

**Behavior:**
- Reads checkbox states from popup
- Saves to Chrome storage
- Sends update message to active tab
- Triggers icon update

### Icon Management

#### `updateIcon(): Promise<void>`

Updates extension icon based on filter enabled state.

**Behavior:**
- Uses colored icons when filters enabled
- Uses grey icons when filters disabled
- Handles multiple icon sizes (16, 32, 48, 128)

**Icon Paths:**
```javascript
const activePaths = {
    16: 'icons/icon16.png',
    32: 'icons/icon32.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png'
};

const inactivePaths = {
    16: 'icons/grey/icon16.png',
    32: 'icons/grey/icon32.png', 
    48: 'icons/grey/icon48.png',
    128: 'icons/grey/icon128.png'
};
```

### UI Event Handlers

#### Checkbox Change Events

All filter checkboxes trigger `saveSettings()` on change:

```javascript
document.getElementById('filter-enabled').addEventListener('change', saveSettings);
document.getElementById('filter-clickbait-words').addEventListener('change', saveSettings);
// ... etc for each filter
```

## 🔌 Chrome Extension APIs

### Storage API Usage

#### `chrome.storage.sync.get(keys, callback)`

**Used for:** Loading user settings

**Example:**
```javascript
chrome.storage.sync.get(userSettings, (stored) => {
    userSettings = stored;
    resolve();
});
```

#### `chrome.storage.sync.set(items, callback)`

**Used for:** Saving user settings

**Example:**
```javascript
chrome.storage.sync.set(settings, () => {
    console.log('Settings saved');
});
```

### Runtime API Usage

#### `chrome.runtime.sendMessage(message, callback)`

**Used for:** Content script → Background communication

**Example:**
```javascript
chrome.runtime.sendMessage({
    type: 'updateBadge',
    count: blockedCount
}, (response) => {
    if (chrome.runtime.lastError) {
        // Handle error
    }
});
```

#### `chrome.runtime.onMessage.addListener(callback)`

**Used for:** Receiving messages

**Example:**
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateSettings') {
        userSettings = message.settings;
        sendResponse({ ok: true });
    }
});
```

### Tabs API Usage

#### `chrome.tabs.query(queryInfo, callback)`

**Used for:** Finding active tab in popup

**Example:**
```javascript
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    // Send message to active tab
});
```

#### `chrome.tabs.sendMessage(tabId, message, callback)`

**Used for:** Popup → Content script communication

**Example:**
```javascript
chrome.tabs.sendMessage(tabs[0].id, {
    type: 'updateSettings',
    settings: userSettings
}, (response) => {
    console.log('Settings updated');
});
```

### Action API Usage

#### `chrome.action.setIcon(details, callback)`

**Used for:** Dynamic icon switching

**Example:**
```javascript
chrome.action.setIcon({
    path: {
        16: 'icons/icon16.png',
        32: 'icons/icon32.png',
        48: 'icons/icon48.png',
        128: 'icons/icon128.png'
    }
}, () => {
    console.log('Icon updated');
});
```

#### `chrome.action.setBadgeText(details)`

**Used for:** Setting badge text

**Example:**
```javascript
chrome.action.setBadgeText({
    text: count > 0 ? count.toString() : '0',
    tabId: tabId
});
```

#### `chrome.action.setBadgeBackgroundColor(details)`

**Used for:** Setting badge color

**Example:**
```javascript
chrome.action.setBadgeBackgroundColor({
    color: count > 0 ? '#FF0000' : '#808080',
    tabId: tabId
});
```

## 📨 Message Passing

### Message Types

#### Content Script → Background

**`updateBadge`**
```typescript
interface UpdateBadgeMessage {
    type: 'updateBadge';
    count: number;
}
```

#### Popup → Content Script

**`updateSettings`**
```typescript
interface UpdateSettingsMessage {
    type: 'updateSettings';
    settings: UserSettings;
}
```

**`getBlockedCount`**
```typescript
interface GetBlockedCountMessage {
    type: 'getBlockedCount';
}

interface GetBlockedCountResponse {
    blockedCount: number;
}
```

### Message Flow Diagram

```
┌─────────┐    updateSettings    ┌─────────────┐
│  Popup  │ ──────────────────→  │   Content   │
│         │                      │   Script    │
│         │ ←──────────────────  │             │
└─────────┘    blockedCount      └─────────────┘
                                       │
                                       │ updateBadge
                                       ▼
                                 ┌─────────────┐
                                 │ Background  │
                                 │   Script    │
                                 └─────────────┘
```

## 💾 Storage API

### Settings Schema

```typescript
interface UserSettings {
    enabled: boolean;                    // Master toggle for all filtering
    filterClickbaitWords: boolean;       // Filter individual clickbait words
    filterClickbaitPhrases: boolean;     // Filter clickbait phrases
    filterUppercase: boolean;            // Filter excessive uppercase
    filterPunctuation: boolean;          // Filter excessive punctuation
}
```

### Default Settings

```javascript
const defaultSettings = {
    enabled: true,
    filterClickbaitWords: true,
    filterClickbaitPhrases: true,
    filterUppercase: true,
    filterPunctuation: true
};
```

### Settings Persistence

Settings are automatically synced across Chrome browsers when Chrome sync is enabled:

```javascript
// Save settings (syncs across devices)
chrome.storage.sync.set(settings);

// Load settings (gets synced data)
chrome.storage.sync.get(defaults, callback);
```

## 🎯 Filter Rules API

### Filter Rule Interface

```typescript
interface FilterRule {
    flag: keyof UserSettings;           // Setting that controls this rule
    test: (text: string) => boolean;    // Function to test text
}
```

### Built-in Filter Rules

#### Clickbait Words Filter
```javascript
{
    flag: 'filterClickbaitWords',
    test: (text) => CLICKBAIT_WORDS.some((word) => 
        text.toLowerCase().includes(word.toLowerCase())
    )
}
```

#### Clickbait Phrases Filter
```javascript
{
    flag: 'filterClickbaitPhrases', 
    test: (text) => CLICKBAIT_PHRASES.some((phrase) =>
        text.toLowerCase().includes(phrase.toLowerCase())
    )
}
```

#### Uppercase Filter
```javascript
{
    flag: 'filterUppercase',
    test: hasThreeUpperCaseWords
}
```

#### Punctuation Filter
```javascript
{
    flag: 'filterPunctuation',
    test: hasThreeOrMoreMarks
}
```

### Adding Custom Filter Rules

To add a new filter rule:

1. **Define the test function:**
```javascript
function hasCustomPattern(text) {
    // Implement your detection logic
    return text.match(/custom-pattern/i) !== null;
}
```

2. **Add to filter rules array:**
```javascript
export const filterRules = [
    // ... existing rules
    {
        flag: 'filterCustomPattern',
        test: hasCustomPattern
    }
];
```

3. **Update settings schema:**
```javascript
const userSettings = {
    // ... existing settings
    filterCustomPattern: true
};
```

4. **Add UI control in popup:**
```html
<div class="setting">
    <input type="checkbox" id="filter-custom-pattern" />
    <label for="filter-custom-pattern">Custom Pattern</label>
</div>
```

### Constants API

#### Clickbait Words
```javascript
export const CLICKBAIT_WORDS = [
    'shocking', 'unprecedented', 'urgent', 'crisis',
    'panic', 'exclusive', 'leaked', 'exposed'
    // ... full list in constants.js
];
```

#### Clickbait Phrases  
```javascript
export const CLICKBAIT_PHRASES = [
    "you won't believe",
    "what happens next",
    "doctors hate this",
    "this will shock you"
    // ... full list in constants.js
];
```

## 🔍 Error Handling

### Common Error Patterns

#### Storage Errors
```javascript
try {
    chrome.storage.sync.get(defaults, callback);
} catch (error) {
    console.warn('Storage failed, using defaults:', error.message);
    // Fallback to defaults
}
```

#### Message Passing Errors
```javascript
chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError) {
        console.warn('Message failed:', chrome.runtime.lastError.message);
        // Handle gracefully
    }
});
```

#### DOM Manipulation Errors
```javascript
try {
    element.remove();
} catch (error) {
    console.warn('DOM manipulation failed:', error);
    // Continue with other elements
}
```

## 📊 Performance Considerations

### API Performance Guidelines

1. **Batch DOM Operations**: Group DOM queries and modifications
2. **Throttle Message Passing**: Avoid excessive message sending
3. **Cache Storage Reads**: Load settings once, cache in memory
4. **Optimize Selectors**: Use specific, efficient CSS selectors
5. **Cleanup Resources**: Remove event listeners and observers when done

### Performance Monitoring

```javascript
// Timing API usage
const start = performance.now();
runFilter();
const duration = performance.now() - start;
console.log(`Filtering took ${duration}ms`);

// Memory monitoring
console.log('Memory usage:', performance.memory.usedJSHeapSize);
```

---

This API documentation provides a complete reference for developing with and extending the YouTube ClickBait Filter extension. For additional examples and implementation details, refer to the source code in the `src/` directory.
