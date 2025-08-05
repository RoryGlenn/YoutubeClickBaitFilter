// popup.js

/**
 * Queries the current tab for its blocked count and updates the UI display.
 * Sends a message to the content script to get the current blocked video count
 * and updates the popup display with the result.
 * 
 * @function updateBlockedCount
 * @returns {void}
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
    (settings) => {
        document.getElementById('filter-enabled').checked = settings.enabled;
        document.getElementById('filter-clickbait-words').checked = settings.filterClickbaitWords;
        document.getElementById('filter-clickbait-phrases').checked = settings.filterClickbaitPhrases;
        document.getElementById('filter-uppercase').checked = settings.filterUppercase;
        document.getElementById('filter-punctuation').checked = settings.filterPunctuation;

        // Fetch and display the initial blocked count
        updateBlockedCount();
    }
);

/**
 * Reads the current checkbox states, persists them to chrome.storage.sync,
 * and notifies the content script to apply the updated settings.
 * Also refreshes the blocked count display after settings are applied.
 * 
 * @function saveSettings
 * @returns {void}
 */
function saveSettings() {
    const settings = {
        enabled: document.getElementById('filter-enabled').checked,
        filterClickbaitWords: document.getElementById('filter-clickbait-words').checked,
        filterClickbaitPhrases: document.getElementById('filter-clickbait-phrases').checked,
        filterUppercase: document.getElementById('filter-uppercase').checked,
        filterPunctuation: document.getElementById('filter-punctuation').checked,
    };

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
    const element = document.getElementById(`filter-${key}`);
    if (element) {
        element.addEventListener('change', saveSettings);
    } else {
        console.error(`Element with ID filter-${key} not found`);
    }
});
