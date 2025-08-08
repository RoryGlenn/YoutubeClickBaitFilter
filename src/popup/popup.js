/**
 * @fileoverview YouTube ClickBait Filter - Popup Interface
 * Popup script that manages the extension's user interface and settings.
 * 
 * This script handles the popup window that appears when users click the extension icon.
 * It provides controls for enabling/disabling filters, displays blocked video counts,
 * and manages user preferences with real-time updates to the content script.
 * 
 * Features:
 * - Real-time blocked count display
 * - Filter toggle controls (clickbait words, phrases, uppercase, punctuation)
 * - Settings persistence via Chrome storage sync
 * - Dynamic icon updates based on enabled state
 * - Immediate settings application to active tabs
 * 
 * @author Rory Glenn
 * @version 1.0.0
 * @since 2025-08-08
 */

// popup.js

/**
 * Queries the current tab for its blocked count and updates the UI display.
 * Sends a message to the content script to get the current blocked video count
 * and updates the popup display with the result. Handles cases where the content
 * script might not be ready or available.
 *
 * @function updateBlockedCount
 * @returns {void}
 * @example
 * updateBlockedCount(); // Updates the #blocked-count element with current count
 */
function updateBlockedCount() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: 'getBlockedCount' },
                (response) => {
                    const el = document.getElementById('blocked-count');
                    if (chrome.runtime.lastError) {
                        // Content script might not be ready yet
                        el.textContent = 'N/A';
                        return;
                    }
                    el.textContent =
                        response && typeof response.blockedCount === 'number'
                            ? response.blockedCount
                            : 'N/A';
                }
            );
        }
    });
}

/**
 * Loads saved settings from chrome.storage.sync and initializes the popup UI controls.
 * Sets the checkbox states based on stored user preferences and displays the initial blocked count.
 * This function is executed immediately when the popup loads.
 *
 * @function initializePopup
 * @returns {void}
 */
chrome.storage.sync.get(
    {
        enabled: true,
        filterClickbaitWords: true,
        filterClickbaitPhrases: true,
        filterUppercase: true,
        filterPunctuation: true,
    },
    async (settings) => {
        document.getElementById('filter-enabled').checked = settings.enabled;
        document.getElementById('filter-clickbait-words').checked =
            settings.filterClickbaitWords;
        document.getElementById('filter-clickbait-phrases').checked =
            settings.filterClickbaitPhrases;
        document.getElementById('filter-uppercase').checked =
            settings.filterUppercase;
        document.getElementById('filter-punctuation').checked =
            settings.filterPunctuation;

        // Update the icon based on the enabled state
        await updateIcon(settings.enabled);

        // Fetch and display the initial blocked count
        updateBlockedCount();
    }
);

/**
 * Updates the extension icon based on the enabled state.
 * Uses grey icons when disabled and regular icons when enabled.
 *
 * @function updateIcon
 * @param {boolean} enabled - Whether the filter is enabled
 * @returns {Promise<void>}
 */
function updateIcon(enabled) {
    return new Promise((resolve, reject) => {
        // Use the minimal approach - just the icon path as a string
        const iconPath = enabled ? 'icons/icon16.png' : 'icons/grey/icon16.png';

        // Try the most basic approach first
        chrome.action.setIcon({ path: iconPath }, () => {
            if (chrome.runtime.lastError) {
                // Try with the full icon object instead
                const fullIconPath = enabled
                    ? {
                          16: 'icons/icon16.png',
                          32: 'icons/icon32.png',
                          48: 'icons/icon48.png',
                          128: 'icons/icon128.png',
                      }
                    : {
                          16: 'icons/grey/icon16.png',
                          32: 'icons/grey/icon32.png',
                          48: 'icons/grey/icon48.png',
                          128: 'icons/grey/icon128.png',
                      };

                chrome.action.setIcon({ path: fullIconPath }, () => {
                    if (chrome.runtime.lastError) {
                        // Don't reject, just resolve to continue
                        resolve();
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
}

/**
 * Reads the current checkbox states, persists them to chrome.storage.sync,
 * and notifies the content script to apply the updated settings.
 * Also refreshes the blocked count display after settings are applied.
 *
 * @async
 * @function saveSettings
 * @returns {Promise<void>}
 */
async function saveSettings() {
    const settings = {
        enabled: document.getElementById('filter-enabled').checked,
        filterClickbaitWords: document.getElementById('filter-clickbait-words')
            .checked,
        filterClickbaitPhrases: document.getElementById(
            'filter-clickbait-phrases'
        ).checked,
        filterUppercase: document.getElementById('filter-uppercase').checked,
        filterPunctuation:
            document.getElementById('filter-punctuation').checked,
    };

    // Update the icon based on enabled state
    await updateIcon(settings.enabled);

    // Persist settings, then message the content-script and refresh count
    chrome.storage.sync.set(settings, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { type: 'updateSettings', settings },
                    () => {
                        if (chrome.runtime.lastError) {
                            // Content script might not be ready, ignore error
                            return;
                        }
                        // After settings applied, update the count display
                        updateBlockedCount();
                    }
                );
            }
        });
    });
}

// Wire up all checkbox changes to saveSettings()
[
    'enabled',
    'clickbait-words',
    'clickbait-phrases',
    'uppercase',
    'punctuation',
].forEach((key) => {
    document
        .getElementById(`filter-${key}`)
        .addEventListener('change', saveSettings);
});
