# Integration Tests

This directory contains integration tests for the YouTube ClickBait Filter extension. These tests validate the filtering logic against real YouTube HTML structures and help ensure the extension works correctly with YouTube's evolving DOM structure.

## Files Overview

- **`youtube-html-test.html`** - Interactive web interface for testing the filter logic
- **`test-logic.js`** - JavaScript module containing the testing functionality
- **`complex-sample.html`** - Sample YouTube HTML with 20+ realistic video structures

## Quick Start

**⚠️ Important: Local Server Required**

The integration tests use ES6 modules and must be served from a local HTTP server. Opening the HTML file directly (`file://`) will cause CORS errors.

### Setting up a Local Server

Choose one of these methods:

**Option A: Python (usually pre-installed on macOS)**
```bash
# From the project root directory
cd /Users/roryglenn/Desktop/YoutubeClickBaitFilter
python3 -m http.server 8000
# Then open: http://localhost:8000/integration-tests/youtube-html-test.html
```

**Option B: Node.js (if you have it installed)**
```bash
# Install a simple server globally
npm install -g http-server
# From the project root directory
cd /Users/roryglenn/Desktop/YoutubeClickBaitFilter
http-server
# Then open: http://localhost:8080/integration-tests/youtube-html-test.html
```

**Option C: VS Code Live Server Extension**
1. Install the "Live Server" extension in VS Code
2. Right-click on `youtube-html-test.html` in VS Code
3. Select "Open with Live Server"

### Method 1: Use Pre-loaded Samples (Recommended for First Time)

1. Start a local server using one of the methods above

2. Open the test page in your browser:
   - Python: `http://localhost:8000/integration-tests/youtube-html-test.html`
   - Node.js: `http://localhost:8080/integration-tests/youtube-html-test.html`
   - Live Server: Will open automatically

3. Click **"🔬 Load Complex Sample HTML"** to load realistic test data

4. Click **"🔍 Test Filtering"** to run the analysis

5. Review the results:
   - **Stats summary** shows how many videos would be filtered vs kept
   - **Visual results** show each video with colored borders (red = filtered, green = kept)
   - **Full log** (click "📜 Show Full Log") provides detailed analysis of each decision

### Method 2: Test with Real YouTube Content

1. Ensure your local server is running (see setup instructions above)

2. Open the test page in your browser using the appropriate localhost URL

3. Go to YouTube in another tab and navigate to any video page with recommended videos in the sidebar

4. Right-click on the YouTube page and select **"View Page Source"** (or press `Ctrl+U` / `Cmd+U`)

5. Copy sections containing video recommendations (or copy the entire source)

6. Paste the HTML into the textarea in the test interface

7. Click **"🔍 Test Filtering"** to analyze real YouTube content

## Understanding the Results

### Statistics Panel
- **🚫 Videos to Filter**: Number of videos that would be hidden by the extension
- **✅ Videos to Keep**: Number of videos that would remain visible
- **📋 Total Processed**: Total number of video containers found

### Visual Results
- **Red border + "FILTERED" badge**: Videos that match clickbait patterns
- **Green border + "KEPT" badge**: Videos that would remain visible
- The original HTML structure is preserved with visual indicators added

### Detailed Log
The full log shows:
- How many video containers were found
- Which DOM selectors successfully located video titles
- For each filtered video, exactly which clickbait patterns triggered the filter:
  - Clickbait words (e.g., "shocking", "insane", "unbelievable")
  - Clickbait phrases (e.g., "you won't believe", "this will shock you")
  - Excessive uppercase letters
  - Excessive punctuation marks

## Technical Details

### What Gets Tested
The integration tests validate:
- **DOM Structure Recognition**: Can we find video containers in YouTube's HTML?
- **Title Extraction**: Can we extract video titles from various YouTube structures?
- **Filter Logic**: Does our filtering algorithm correctly identify clickbait content?
- **Browser Compatibility**: Does the code work in real browser environments?

### YouTube Structure Support
The tests handle both legacy and modern YouTube structures:

**Legacy Selectors** (pre-2024):
- `ytd-video-renderer`
- `ytd-compact-video-renderer`
- `#video-title`

**Modern Selectors** (2024+):
- `yt-lockup-view-model`
- `.yt-lockup-metadata-view-model-wiz__title`
- New nested DOM structures

### Filter Rules Tested
1. **Clickbait Words**: Common clickbait terms like "shocking", "insane", "unbelievable"
2. **Clickbait Phrases**: Longer patterns like "you won't believe what happened"
3. **Excessive Uppercase**: Titles with too many capital letters
4. **Excessive Punctuation**: Titles with multiple exclamation marks or question marks

## Troubleshooting

### No Videos Found
If you see "⚠️ No video containers found":
- Make sure you copied HTML from a YouTube page with sidebar videos
- Try copying from a video watch page rather than the homepage
- Look for sections with `yt-lockup-view-model` or `ytd-compact-video-renderer`

### JavaScript Errors
If the test doesn't run:
- **CORS/Module Errors**: Make sure you're using a local server (see setup instructions above), not opening the file directly
- Check the browser console (F12) for specific error messages
- Ensure you're using a modern browser that supports ES6 modules (Chrome, Firefox, Safari, Edge)

### Import/Module Errors
The test uses ES6 modules and imports from the main extension code:
- `../src/content/filter.js` - Main filtering logic
- `../src/shared/constants.js` - Clickbait word/phrase lists

Common solutions:
- **Use a local server**: Direct file access (`file://`) blocks module imports
- **Check file paths**: Ensure the main extension files are in the correct locations
- **Modern browser**: Older browsers don't support ES6 modules

## Customizing Tests

### Adding Your Own Test Cases
You can modify `showSampleHTML()` in `test-logic.js` to add custom test cases:

```javascript
function showSampleHTML() {
    document.getElementById('htmlInput').value = `
        <!-- Add your custom YouTube HTML structures here -->
        <yt-lockup-view-model class="yt-lockup-view-model-wiz">
            <div class="yt-lockup-metadata-view-model-wiz__text-container">
                <h3 class="yt-lockup-metadata-view-model-wiz__heading-reset">
                    <a href="/watch?v=test" class="yt-lockup-metadata-view-model-wiz__title">
                        Your Test Video Title Here
                    </a>
                </h3>
            </div>
        </yt-lockup-view-model>
    `;
}
```

### Modifying Filter Settings
The tests use these default settings (same as the extension):
```javascript
const userSettings = {
    enabled: true,
    filterClickbaitWords: true,
    filterClickbaitPhrases: true,
    filterUppercase: true,
    filterPunctuation: true,
};
```

You can modify these in `test-logic.js` to test different filtering configurations.

## Best Practices

1. **Start with samples**: Use the pre-loaded samples first to understand how the tests work
2. **Test regularly**: Run these tests when YouTube updates their structure
3. **Check logs**: Always review the detailed log to understand filtering decisions
4. **Test edge cases**: Try unusual video titles, special characters, non-English content
5. **Validate changes**: Run these tests after modifying the filter logic

## Performance Notes

- The tests can process 80+ video containers efficiently
- Large HTML files (entire YouTube page source) work fine but may take a few seconds
- The visual results help identify patterns in what gets filtered
- Use the log toggle to manage long output when testing many videos

## Integration with Main Extension

These tests use the exact same filtering logic as the main extension:
- Same `shouldFilter()` function
- Same clickbait word/phrase lists
- Same filter rules and settings
- Results here directly predict extension behavior

This ensures that successful integration tests correlate with successful real-world filtering.
