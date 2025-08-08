// filter.js

import { CLICKBAIT_WORDS, CLICKBAIT_PHRASES } from '../shared/constants.js';

let blockedCount = 0;
let currentUrl = window.location.href;
let userSettings = {
    enabled: true,
    filterClickbaitWords: true,
    filterClickbaitPhrases: true,
    filterUppercase: true,
    filterPunctuation: true,
};

/**
 * Array of filter rules, mapping a userSettings flag to a test function.
 * @type {{flag: string, test: function(string): boolean}[]}
 */
export const filterRules = [
    {
        flag: 'filterClickbaitWords',
        test: (text) =>
            CLICKBAIT_WORDS.some((w) => text.toLowerCase().includes(w)),
    },
    {
        flag: 'filterUppercase',
        test: hasThreeUpperCaseWords,
    },
    {
        flag: 'filterPunctuation',
        test: hasThreeOrMoreMarks,
    },
    {
        flag: 'filterClickbaitPhrases',
        test: (text) =>
            CLICKBAIT_PHRASES.some((w) => text.toLowerCase().includes(w)),
    },
];

/**
 * Load stored user settings from Chrome sync storage.
 * @returns {Promise<void>} Resolves when settings have been loaded.
 */
function loadSettings() {
    return new Promise((resolve) => {
        try {
            chrome.storage.sync.get(userSettings, (stored) => {
                userSettings = stored;
                resolve();
            });
        } catch (error) {
            resolve(); // Resolve anyway to continue with defaults
        }
    });
}

/**
 * Update the extension badge with current blocked count
 */
function updateBadge() {
    // Add a small delay to ensure background script is ready
    setTimeout(() => {
        try {
            chrome.runtime.sendMessage(
                {
                    type: 'updateBadge',
                    count: blockedCount,
                },
                (response) => {
                    // Handle the response or connection errors
                    if (chrome.runtime.lastError) {
                        // Silently ignore connection errors - background script might not be ready
                        // Don't log this as it can spam the console during startup
                        return;
                    }
                }
            );
        } catch (error) {
            // Silently ignore errors during startup
            return;
        }
    }, 100);
}

/**
 * Check if the URL has changed and reset counter if it has
 */
function checkUrlChange() {
    const newUrl = window.location.href;
    if (newUrl !== currentUrl) {
        currentUrl = newUrl;
        blockedCount = 0;
        updateBadge(); // Update badge when counter resets
    }
}

/**
 * Determines whether a given text should be filtered out.
 * @param {string} text The title or label to test.
 * @returns {boolean} True if any enabled rule matches the text.
 */
export function shouldFilter(text) {
    return filterRules.some(
        ({ flag, test }) => userSettings[flag] && test(text)
    );
}

/**
 * Remove standard video cards based on filtering rules.
 */
function filterStandardCards() {
    // Target all common YouTube video container selectors (including new 2025 structure)
    const videoSelectors = [
        'ytd-video-renderer', // Standard list view videos (legacy)
        'ytd-rich-item-renderer', // Home page grid videos (legacy)
        'ytd-grid-video-renderer', // Grid view videos (legacy)
        'ytd-compact-video-renderer', // Sidebar and suggested videos (legacy)
        'ytd-playlist-video-renderer', // Playlist videos (legacy)
        'ytd-movie-renderer', // Movie content (legacy)
        'ytd-radio-renderer', // Radio/mix content (legacy)
        'yt-lockup-view-model', // New 2025+ sidebar video structure
        '[class*="yt-lockup-view-model"]', // Any variations of the new structure
    ];

    const allContainers = document.querySelectorAll(videoSelectors.join(', '));

    allContainers.forEach((card, index) => {
        try {
            // Try multiple selectors for title text - including new 2025 structure
            const titleSelectors = [
                // Legacy selectors
                '#video-title',
                '.ytd-video-meta-block #video-title',
                'a#video-title',
                '[id="video-title"]',
                'h3 a',
                '.title a',
                'a[aria-label]',
                '[role="heading"] a',
                '.ytd-video-primary-info-renderer #video-title',
                '.title-and-badge a',
                'span[aria-label]',
                // New 2025+ selectors for current YouTube structure
                '.yt-lockup-metadata-view-model-wiz__title',
                'a.yt-lockup-metadata-view-model-wiz__title',
                '.yt-lockup-metadata-view-model-wiz__heading-reset a',
                'h3.yt-lockup-metadata-view-model-wiz__heading-reset a',
                '[class*="yt-lockup-metadata-view-model-wiz__title"]',
                '[class*="lockup"] a[href*="/watch"]', // Generic lockup with watch links
                'a[href*="/watch"][aria-label]', // Any watch link with aria-label
            ];

            let title = '';
            let titleElement = null;

            // Try each selector until we find a title
            for (const selector of titleSelectors) {
                titleElement = card.querySelector(selector);
                if (titleElement) {
                    title =
                        titleElement.textContent?.trim() ||
                        titleElement.getAttribute('aria-label')?.trim() ||
                        titleElement.getAttribute('title')?.trim() ||
                        '';
                    if (title) {
                        break;
                    }
                }
            }

            // If we still don't have a title, try getting it from aria-label on the card itself
            if (!title) {
                title =
                    card.getAttribute('aria-label')?.trim() ||
                    card.getAttribute('title')?.trim() ||
                    '';
            }

            if (title) {
                if (shouldFilter(title)) {
                    card.style.display = 'none'; // Hide first
                    card.remove(); // Then remove
                    blockedCount++;
                }
            } else {
                // Log a snippet of the HTML to help debug
                const htmlSnippet = card.outerHTML?.substring(0, 200) + '...';
            }
        } catch (error) {
            // Error processing video card
        }
    });
}

/**
 * Remove elements identified by aria-label based on filtering rules.
 */
function filterAriaLabels() {
    document.querySelectorAll('[aria-label]').forEach((el) => {
        try {
            const label = el.getAttribute('aria-label')?.trim();
            if (label && shouldFilter(label)) {
                // Find the appropriate container to remove - be more specific
                const wrapper =
                    el.closest('ytd-rich-item-renderer') ||
                    el.closest('ytd-video-renderer') ||
                    el.closest('ytd-grid-video-renderer') ||
                    el.closest('ytd-compact-video-renderer') ||
                    el.closest('div.ytGridShelfViewModelGridShelfItem');

                // Only remove if we found a specific video container
                if (
                    wrapper &&
                    (wrapper.tagName.toLowerCase().startsWith('ytd-') ||
                        wrapper.className.includes(
                            'ytGridShelfViewModelGridShelfItem'
                        ))
                ) {
                    wrapper.style.display = 'none'; // Hide first
                    wrapper.remove(); // Then remove
                    blockedCount++;
                } else {
                    // Fallback: just hide the element itself if we can't find a video container
                    // This prevents removing entire sections
                }
            }
        } catch (error) {
            // Error processing aria-label element
        }
    });
}

/**
 * Handle newer YouTube layouts with different structures
 */
function filterNewLayouts() {
    try {
        // Be more selective - only target containers that are clearly video items
        const containerSelectors = [
            '[data-video-id]', // Specific video containers
            'a[href*="/watch"]', // Direct video links
        ];

        containerSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((container) => {
                try {
                    // Skip if already processed by other filters
                    if (
                        container.tagName.toLowerCase().startsWith('ytd-') ||
                        container.style.display === 'none' ||
                        !container.parentNode
                    ) {
                        return;
                    }

                    // For video links, get the container that holds the entire video item
                    let targetContainer = container;
                    if (selector.includes('href*="/watch"')) {
                        // Find the video container, but be more specific
                        targetContainer =
                            container.closest('ytd-video-renderer') ||
                            container.closest('ytd-rich-item-renderer') ||
                            container.closest('ytd-grid-video-renderer') ||
                            container.closest('ytd-compact-video-renderer') ||
                            container.closest('[class*="video-item"]') ||
                            container.closest('[class*="videoItem"]');

                        // If we can't find a specific video container, skip
                        if (!targetContainer || targetContainer === container) {
                            return;
                        }
                    }

                    // Look for title text in various possible locations
                    const titleSelectors = [
                        'h3',
                        '[role="heading"]',
                        '[class*="title"]',
                        'a[href*="/watch"]',
                        '[aria-label]',
                        '[title]',
                    ];

                    for (const titleSelector of titleSelectors) {
                        const titleElements =
                            targetContainer.querySelectorAll(titleSelector);

                        for (const titleEl of titleElements) {
                            const title =
                                titleEl.textContent?.trim() ||
                                titleEl.getAttribute('aria-label')?.trim() ||
                                titleEl.getAttribute('title')?.trim() ||
                                '';

                            if (title && shouldFilter(title)) {
                                targetContainer.style.display = 'none'; // Hide first
                                targetContainer.remove(); // Then remove
                                blockedCount++;
                                return; // Exit since container is removed
                            }
                        }
                    }
                } catch (error) {
                    // Error processing new layout container
                }
            });
        });
    } catch (error) {
        // Error in filterNewLayouts
    }
}

/**
 * Additional selective filtering for any remaining video elements
 */
function filterRemainingVideos() {
    try {
        // Target any links to watch pages that might have escaped other filters
        const watchLinks = document.querySelectorAll('a[href*="/watch"]');

        watchLinks.forEach((link) => {
            try {
                const title =
                    link.textContent?.trim() ||
                    link.getAttribute('aria-label')?.trim() ||
                    link.getAttribute('title')?.trim() ||
                    '';

                if (title) {
                    if (shouldFilter(title)) {
                        // Find the video container - be more specific about what we remove
                        const videoContainer =
                            link.closest('ytd-video-renderer') ||
                            link.closest('ytd-rich-item-renderer') ||
                            link.closest('ytd-grid-video-renderer') ||
                            link.closest('ytd-compact-video-renderer');

                        if (videoContainer) {
                            videoContainer.style.display = 'none';
                            videoContainer.remove();
                            blockedCount++;
                        } else {
                            // If we can't find a specific ytd container, look for other video-specific containers
                            const fallbackContainer =
                                link.closest('[class*="video-item"]') ||
                                link.closest('[class*="videoItem"]') ||
                                link.closest('[data-video-id]');

                            if (fallbackContainer) {
                                fallbackContainer.style.display = 'none';
                                fallbackContainer.remove();
                                blockedCount++;
                            } else {
                                link.style.display = 'none';
                                link.remove();
                            }
                        }
                    }
                }
            } catch (error) {
                // Error processing video link
            }
        });

        // Additional pass: look for broken video containers, but be more selective
        const allContainers = document.querySelectorAll(
            'ytd-compact-video-renderer, ytd-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer'
        );

        allContainers.forEach((container) => {
            try {
                // Check if this container has no visible title text
                const titleElement = container.querySelector(
                    '#video-title, a#video-title, h3 a, .title a'
                );
                const titleText = titleElement?.textContent?.trim() || '';

                // If container exists but has no title text AND has a thumbnail, it might be in a broken state
                if (
                    !titleText &&
                    container.querySelector(
                        'img[src], ytd-thumbnail, [class*="thumbnail"]'
                    )
                ) {
                    container.style.display = 'none';
                    container.remove();
                    blockedCount++;
                }
            } catch (error) {
                // Error checking for broken video containers
            }
        });
    } catch (error) {
        // Error in filterRemainingVideos
    }
}

/**
 * Run all filtering passes if enabled.
 */
function runFilter() {
    if (!userSettings.enabled) return;

    // Check if URL has changed and reset counter if needed
    checkUrlChange();

    const previousCount = blockedCount;

    // Run all filtering methods - be comprehensive
    filterStandardCards();
    filterAriaLabels();
    filterNewLayouts();
    filterRemainingVideos(); // Add this missing call

    // Only update badge if count changed
    if (blockedCount !== previousCount) {
        updateBadge();
    }
}

/**
 * Observe DOM mutations and re-run filter when new nodes appear.
 */
function setupObserver() {
    new MutationObserver(runFilter).observe(document.body, {
        childList: true,
        subtree: true,
    });
}

/**
 * Listen for messages from the popup to update settings or report counts.
 */
function registerMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            if (message.type === 'updateSettings') {
                userSettings = message.settings;
                if (userSettings.enabled) runFilter();
                else window.location.reload();
                sendResponse({ ok: true });
            }
            if (message.type === 'getBlockedCount') {
                sendResponse({ blockedCount });
            }
        } catch (error) {
            sendResponse({ error: error.message });
        }
    });
}

/**
 * Setup listeners for page visibility changes to handle refreshes
 */
function setupPageListeners() {
    // Listen for page visibility changes (handles refreshes and tab switches)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkUrlChange();
        }
    });

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', () => {
        checkUrlChange();
    });
}

/**
 * Check if text contains three or more fully uppercase words.
 * @param {string} text
 * @returns {boolean}
 */
export function hasThreeUpperCaseWords(text) {
    const words = text.trim().split(/\s+/);
    let count = 0;
    for (const w of words) {
        if (/[A-Z]/.test(w) && w === w.toUpperCase()) {
            if (++count >= 3) return true;
        }
    }
    return false;
}

/**
 * Check if text contains three or more exclamation or question marks.
 * @param {string} title
 * @returns {boolean}
 */
export function hasThreeOrMoreMarks(title) {
    const exCount = (title.match(/!/g) || []).length;
    const qmCount = (title.match(/\?/g) || []).length;
    return exCount >= 3 || qmCount >= 3;
}

// Initialization sequence (only run if not being imported as module)
if (typeof window !== 'undefined' && window.location) {
    (async function init() {
        await loadSettings();
        runFilter();
        setupObserver();
        setupPageListeners();
        registerMessageHandlers();
    })();
}
