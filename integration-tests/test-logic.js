// test-logic.js
// JavaScript logic for YouTube HTML structure testing

// Import constants from the parent directory
import { CLICKBAIT_PHRASES, CLICKBAIT_WORDS } from '../src/shared/constants.js';
import {
    hasThreeUpperCaseWords,
    hasThreeOrMoreMarks,
    filterRules,
    shouldFilter,
} from '../src/content/filter.js';

// Create userSettings for testing (same defaults as extension)
const userSettings = {
    enabled: true,
    filterClickbaitWords: true,
    filterClickbaitPhrases: true,
    filterUppercase: true,
    filterPunctuation: true,
};

// Test-specific wrapper that provides detailed logging while using the real shouldFilter logic
function shouldFilterWithLogging(text) {
    if (!text || typeof text !== 'string') return false;

    // Use the real shouldFilter function first
    const willFilter = shouldFilter(text);

    if (willFilter) {
        // If it will be filtered, figure out why by checking each rule manually
        filterRules.forEach(({ flag, test }) => {
            if (userSettings[flag] && test(text)) {
                // Provide specific match details
                if (flag === 'filterClickbaitWords') {
                    const matchedWords = CLICKBAIT_WORDS.filter((w) =>
                        text.toLowerCase().includes(w)
                    );
                    log(
                        `  ✓ Matched clickbait word(s): "${matchedWords.join('", "')}"`
                    );
                } else if (flag === 'filterClickbaitPhrases') {
                    const matchedPhrases = CLICKBAIT_PHRASES.filter((p) =>
                        text.toLowerCase().includes(p.toLowerCase())
                    );
                    log(
                        `  ✓ Matched clickbait phrase(s): "${matchedPhrases.join('", "')}"`
                    );
                } else if (flag === 'filterUppercase') {
                    log(`  ✓ Excessive uppercase detected`);
                } else if (flag === 'filterPunctuation') {
                    log(`  ✓ Excessive punctuation detected`);
                }
            }
        });
    }

    return willFilter;
}

let filteredCount = 0;
let keptCount = 0;
let logOutput = '';

function log(message) {
    logOutput += message + '\n';
    console.log(message);
}

function testFiltering() {
    console.log('=== TEST FILTERING STARTED ===');
    const htmlInput = document.getElementById('htmlInput');
    const testArea = document.getElementById('testArea');
    const testContent = document.getElementById('testContent');
    const logDiv = document.getElementById('log');
    const statsDiv = document.getElementById('stats');

    if (!htmlInput.value.trim()) {
        alert('Please paste YouTube HTML first!');
        return;
    }

    // Reset counters and logs
    filteredCount = 0;
    keptCount = 0;
    logOutput = '';

    log('=== YouTube Real HTML Filtering Test Started ===');
    log('Loading HTML content...');

    // Load the HTML into test area
    testContent.innerHTML = htmlInput.value;
    testArea.style.display = 'block';

    // Find all video containers (both legacy and new structure)
    const videoSelectors = [
        // Legacy YouTube selectors
        'ytd-video-renderer',
        'ytd-rich-item-renderer',
        'ytd-grid-video-renderer',
        'ytd-compact-video-renderer',
        'ytd-playlist-video-renderer',
        'ytd-movie-renderer',
        'ytd-radio-renderer',
        // New 2025+ YouTube structure
        'yt-lockup-view-model',
        '[class*="yt-lockup-view-model"]',
    ];

    const allContainers = testContent.querySelectorAll(
        videoSelectors.join(', ')
    );
    log(`Found ${allContainers.length} video containers total`);

    if (allContainers.length === 0) {
        log('⚠️  No video containers found with standard selectors!');
        log('Trying alternative detection...');

        // Try to find any elements that might contain video titles
        const alternativeSelectors = [
            'a[href*="/watch"]',
            '[class*="lockup"]',
            '[class*="metadata"]',
            '#video-title',
            '[id*="title"]',
            '[aria-label*="minutes"]',
            '[title]',
        ];

        const possibleElements = testContent.querySelectorAll(
            alternativeSelectors.join(', ')
        );
        log(`Found ${possibleElements.length} possible video-related elements`);

        // Check a few of these elements for titles
        let foundTitles = 0;
        possibleElements.slice(0, 20).forEach((el, i) => {
            const text =
                el.textContent?.trim() ||
                el.getAttribute('aria-label')?.trim() ||
                el.getAttribute('title')?.trim() ||
                '';
            if (text && text.length > 10 && text.length < 200) {
                foundTitles++;
                log(
                    `  Possible title ${foundTitles}: "${text.substring(0, 60)}..."`
                );

                if (shouldFilterWithLogging(text)) {
                    log(`    → Would be FILTERED`);
                    filteredCount++;
                } else {
                    log(`    → Would be KEPT`);
                    keptCount++;
                }
            }
        });

        if (foundTitles === 0) {
            log('❌ No video titles found in the HTML');
            log(
                'Make sure you copied HTML from a YouTube page with sidebar videos'
            );
        }
    } else {
        // Process each container with standard logic
        log(`Processing ${allContainers.length} containers...`);

        allContainers.forEach((container, index) => {
            try {
                log(
                    `\n--- Processing Container ${index + 1} (${container.tagName || container.className}) ---`
                );

                // Try multiple selectors to find the title (both legacy and new)
                const titleSelectors = [
                    // Legacy selectors
                    '#video-title',
                    'a#video-title',
                    '.ytd-video-meta-block #video-title',
                    'h3 a',
                    '.title a',
                    'a[aria-label]',
                    '[role="heading"] a',
                    'span[aria-label]',
                    // New 2025+ selectors
                    '.yt-lockup-metadata-view-model-wiz__title',
                    'a.yt-lockup-metadata-view-model-wiz__title',
                    '.yt-lockup-metadata-view-model-wiz__heading-reset a',
                    'h3.yt-lockup-metadata-view-model-wiz__heading-reset a',
                    '[class*="yt-lockup-metadata-view-model-wiz__title"]',
                    '[class*="lockup"] a[href*="/watch"]',
                    'a[href*="/watch"][aria-label]',
                ];

                let title = '';
                let titleElement = null;
                let usedSelector = '';

                // Try each selector
                for (const selector of titleSelectors) {
                    titleElement = container.querySelector(selector);
                    if (titleElement) {
                        title =
                            titleElement.textContent?.trim() ||
                            titleElement.getAttribute('aria-label')?.trim() ||
                            titleElement.getAttribute('title')?.trim() ||
                            '';
                        if (title) {
                            usedSelector = selector;
                            log(`  Found title via selector "${selector}"`);
                            break;
                        }
                    }
                }

                // Fallback: try aria-label on container
                if (!title) {
                    title =
                        container.getAttribute('aria-label')?.trim() ||
                        container.getAttribute('title')?.trim() ||
                        '';
                    if (title) {
                        usedSelector = 'container attribute';
                        log(`  Found title via container attribute`);
                    }
                }

                if (title) {
                    log(`  Title: "${title}"`);

                    if (shouldFilterWithLogging(title)) {
                        log(`  🚫 DECISION: FILTER this video`);
                        container.classList.add('filtered-video');
                        container.innerHTML =
                            '<div class="filter-badge filtered">FILTERED</div>' +
                            container.innerHTML;
                        filteredCount++;
                    } else {
                        log(`  ✅ DECISION: KEEP this video`);
                        container.classList.add('kept-video');
                        container.innerHTML =
                            '<div class="filter-badge kept">KEPT</div>' +
                            container.innerHTML;
                        keptCount++;
                    }
                } else {
                    log(`  ⚠️  No title found for this container`);
                    log(
                        `  Container HTML preview: ${container.innerHTML.substring(0, 200)}...`
                    );
                }
            } catch (error) {
                log(`  ❌ Error processing container: ${error.message}`);
                console.error('Container processing error:', error);
            }
        });

        log(`Completed processing all ${allContainers.length} containers`);
        console.log('=== CONTAINER PROCESSING COMPLETE ===');
    }

    log(`\n=== Test Complete ===`);
    log(`📊 Results:`);
    log(`  - Videos to filter: ${filteredCount}`);
    log(`  - Videos to keep: ${keptCount}`);
    log(`  - Total processed: ${filteredCount + keptCount}`);

    // Update UI
    console.log('Updating UI with log output length:', logOutput.length);
    console.log('Log div element:', logDiv);

    logDiv.className = 'log';
    logDiv.innerHTML = logOutput;

    console.log('Log div after update:', logDiv.innerHTML.length, 'characters');

    // Show the log toggle button if there's content
    if (window.showLogToggle) {
        console.log('Calling showLogToggle');
        window.showLogToggle();
    } else {
        console.log('showLogToggle not available');
    }

    statsDiv.innerHTML = `
        <div class="stats">
            <h3>📊 Test Results</h3>
            <p><strong>🚫 Videos to Filter:</strong> ${filteredCount}</p>
            <p><strong>✅ Videos to Keep:</strong> ${keptCount}</p>
            <p><strong>📋 Total Processed:</strong> ${filteredCount + keptCount}</p>
            <p><em>Scroll down to see visual results. Filtered videos have red borders, kept videos have green borders.</em></p>
            ${filteredCount + keptCount === 0 ? '<p><strong style="color: #f44336;">⚠️ No videos found! Make sure you pasted YouTube HTML with video content.</strong></p>' : ''}
        </div>
    `;
}

function clearResults() {
    document.getElementById('testArea').style.display = 'none';
    const logDiv = document.getElementById('log');
    logDiv.innerHTML = '';
    logDiv.className = '';
    document.getElementById('stats').innerHTML = '';
    document.getElementById('logToggle').style.display = 'none';
    logOutput = '';
    filteredCount = 0;
    keptCount = 0;
}

function showSampleHTML() {
    document.getElementById('htmlInput').value = `
<!-- Sample YouTube structures for testing -->
<div>
    <!-- New 2025+ YouTube Structure -->
    <yt-lockup-view-model class="yt-lockup-view-model-wiz yt-lockup-view-model-wiz--vertical">
        <div class="yt-lockup-view-model-wiz__metadata">
            <div class="yt-lockup-metadata-view-model-wiz__text-container">
                <h3 class="yt-lockup-metadata-view-model-wiz__heading-reset" title="Everyone is Quitting Big Tech">
                    <a href="/watch?v=test1" class="yt-lockup-metadata-view-model-wiz__title" aria-label="Everyone is Quitting Big Tech. 14 minutes, 17 seconds">
                        <span>Everyone is Quitting Big Tech</span>
                    </a>
                </h3>
            </div>
        </div>
    </yt-lockup-view-model>

    <!-- Legacy YouTube Structure -->
    <ytd-compact-video-renderer>
        <div>
            <a id="video-title" href="/watch?v=test2">You WON'T BELIEVE What Happened Next!!!</a>
            <div>Drama Channel • 500K views • 1 hour ago</div>
        </div>
    </ytd-compact-video-renderer>

    <!-- Regular video (should not be filtered) -->
    <yt-lockup-view-model class="yt-lockup-view-model-wiz">
        <div class="yt-lockup-metadata-view-model-wiz__text-container">
            <h3 class="yt-lockup-metadata-view-model-wiz__heading-reset">
                <a href="/watch?v=test3" class="yt-lockup-metadata-view-model-wiz__title">
                    How to Learn JavaScript - Complete Tutorial
                </a>
            </h3>
        </div>
    </yt-lockup-view-model>

    <!-- Another clickbait video -->
    <yt-lockup-view-model class="yt-lockup-view-model-wiz">
        <div class="yt-lockup-metadata-view-model-wiz__text-container">
            <h3 class="yt-lockup-metadata-view-model-wiz__heading-reset">
                <a href="/watch?v=test4" class="yt-lockup-metadata-view-model-wiz__title">
                    This Will SHOCK You About AI!!!
                </a>
            </h3>
        </div>
    </yt-lockup-view-model>

    <!-- Test the specific video that was missed: "The entry level tech job crisis" -->
    <yt-lockup-view-model class="yt-lockup-view-model-wiz">
        <div class="yt-lockup-metadata-view-model-wiz__text-container">
            <h3 class="yt-lockup-metadata-view-model-wiz__heading-reset">
                <a href="/watch?v=test5" class="yt-lockup-metadata-view-model-wiz__title">
                    The entry level tech job crisis
                </a>
            </h3>
        </div>
    </yt-lockup-view-model>
</div>
    `.trim();
}

function showComplexSampleHTML() {
    // Load the complex sample HTML directly (avoids fetch security issues)
    // Add cache-busting parameter to ensure fresh content
    const cacheBuster = Date.now();
    fetch(`./complex-sample.html?v=${cacheBuster}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then((html) => {
            document.getElementById('htmlInput').value = html;
            console.log('Complex sample HTML loaded successfully');
        })
        .catch((error) => {
            console.error('Error loading complex HTML:', error);
            // Fallback to a basic sample if fetch fails
            console.log('Using fallback sample HTML');
            document.getElementById('htmlInput').value = `
<!-- Fallback Complex YouTube HTML Sample -->
<div class="ytd-watch-flexy">
  <yt-lockup-view-model class="yt-lockup-view-model-wiz">
    <div class="yt-lockup-metadata-view-model-wiz">
      <h3 class="yt-lockup-metadata-view-model-wiz__heading-reset">
        <a href="/watch?v=test1" class="yt-lockup-metadata-view-model-wiz__title">
          AI Machine Learning Roadmap: Self Study AI!
        </a>
      </h3>
    </div>
  </yt-lockup-view-model>
  
  <yt-lockup-view-model class="yt-lockup-view-model-wiz">
    <div class="yt-lockup-metadata-view-model-wiz">
      <h3 class="yt-lockup-metadata-view-model-wiz__heading-reset">
        <a href="/watch?v=test2" class="yt-lockup-metadata-view-model-wiz__title">
          This Is How You Actually Learn AI and Machine learning
        </a>
      </h3>
    </div>
  </yt-lockup-view-model>
  
  <yt-lockup-view-model class="yt-lockup-view-model-wiz">
    <div class="yt-lockup-metadata-view-model-wiz">
      <h3 class="yt-lockup-metadata-view-model-wiz__heading-reset">
        <a href="/watch?v=test3" class="yt-lockup-metadata-view-model-wiz__title">
          Everyone is Quitting Big Tech.
        </a>
      </h3>
    </div>
  </yt-lockup-view-model>
  
  <yt-lockup-view-model class="yt-lockup-view-model-wiz">
    <div class="yt-lockup-metadata-view-model-wiz">
      <h3 class="yt-lockup-metadata-view-model-wiz__heading-reset">
        <a href="/watch?v=test4" class="yt-lockup-metadata-view-model-wiz__title">
          The entry level tech job crisis
        </a>
      </h3>
    </div>
  </yt-lockup-view-model>
</div>
            `.trim();
        });
}

// function showComplexSampleHTML2() {
//     // Another complex HTML sample
//     document.getElementById('htmlInput').value = `
// <!-- Another complex HTML example -->
//     `.trim();
// }

// function showComplexSampleHTML3() {
//     // Yet another complex HTML sample
//     document.getElementById('htmlInput').value = `
// <!-- Third complex HTML example -->
//     `.trim();
// }

// Make functions available globally for the HTML buttons
window.testFiltering = testFiltering;
window.clearResults = clearResults;
window.showSampleHTML = showSampleHTML;
window.showComplexSampleHTML = showComplexSampleHTML;
// window.showComplexSampleHTML2 = showComplexSampleHTML2;
// window.showComplexSampleHTML3 = showComplexSampleHTML3;
