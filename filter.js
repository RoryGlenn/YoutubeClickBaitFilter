// filter.js

import { NEGATIVE, CLICKBAIT } from './constants.js';

let blockedCount = 0;
let userSettings = {
    enabled: true,
    filterBad: true,
    filterClickbait: true,
    filterUppercase: true,
    filterPunctuation: true
};

/**
 * Array of filter rules, mapping a userSettings flag to a test function.
 * @type {{flag: string, test: function(string): boolean}[]}
 */
const filterRules = [
    {
        flag: 'filterBad',
        test: text => NEGATIVE.some(w => text.toLowerCase().includes(w))
    },
    {
        flag: 'filterUppercase',
        test: hasThreeUpperCaseWords
    },
    {
        flag: 'filterPunctuation',
        test: hasThreeOrMoreMarks
    },
    {
        flag: 'filterClickbait',
        test: text => CLICKBAIT.some(w => text.toLowerCase().includes(w))
    }
];

/**
 * Load stored user settings from Chrome sync storage.
 * @returns {Promise<void>} Resolves when settings have been loaded.
 */
function loadSettings() {
    return new Promise(resolve => {
        try {
            chrome.storage.sync.get(userSettings, stored => {
                userSettings = stored;
                resolve();
            });
        } catch (error) {
            console.error('Failed to load settings:', error);
            resolve(); // Resolve anyway to continue with defaults
        }
    });
}

/**
 * Determines whether a given text should be filtered out.
 * @param {string} text The title or label to test.
 * @returns {boolean} True if any enabled rule matches the text.
 */
function shouldFilter(text) {
    return filterRules.some(({ flag, test }) => userSettings[flag] && test(text));
}

/**
 * Remove standard video cards based on filtering rules.
 */
function filterStandardCards() {
    document
        .querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer')
        .forEach(card => {
            const title = card.querySelector('#video-title')?.textContent.trim() || '';
            if (shouldFilter(title)) {
                card.remove();
                blockedCount++;
            }
        });
}

/**
 * Remove elements identified by aria-label based on filtering rules.
 */
function filterAriaLabels() {
    document.querySelectorAll('[aria-label]').forEach(el => {
        const label = el.getAttribute('aria-label').trim();
        if (shouldFilter(label)) {
            const wrapper = el.closest('div.ytGridShelfViewModelGridShelfItem') || el;
            wrapper.remove();
            blockedCount++;
        }
    });
}

/**
 * Run all filtering passes if enabled.
 */
function runFilter() {
    if (!userSettings.enabled) return;
    filterStandardCards();
    filterAriaLabels();
    console.log('runFilter - blockedCount:', blockedCount);
}

/**
 * Observe DOM mutations and re-run filter when new nodes appear.
 */
function setupObserver() {
    new MutationObserver(runFilter).observe(document.body, {
        childList: true,
        subtree: true
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
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    });
}

/**
 * Check if text contains three or more fully uppercase words.
 * @param {string} text
 * @returns {boolean}
 */
function hasThreeUpperCaseWords(text) {
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
function hasThreeOrMoreMarks(title) {
    const exCount = (title.match(/!/g) || []).length;
    const qmCount = (title.match(/\?/g) || []).length;
    return exCount >= 3 || qmCount >= 3;
}

// Initialization sequence
(async function init() {
    await loadSettings();
    runFilter();
    setupObserver();
    registerMessageHandlers();
})();
