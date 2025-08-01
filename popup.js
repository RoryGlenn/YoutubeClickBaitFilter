// popup.js

/**
 * Queries the current tab for its blocked count and updates the UI.
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
 * Load saved settings from chrome.storage and initialize the controls.
 */
chrome.storage.sync.get(
    {
        enabled: true,
        filterBad: true,
        filterClickbait: true,
        filterUppercase: true,
        filterPunctuation: true,
    },
    (settings) => {
        document.getElementById('filter-enabled').checked = settings.enabled;
        document.getElementById('filter-bad').checked = settings.filterBad;
        document.getElementById('filter-clickbait').checked = settings.filterClickbait;
        document.getElementById('filter-uppercase').checked = settings.filterUppercase;
        document.getElementById('filter-punctuation').checked = settings.filterPunctuation;

        // Fetch and display the initial blocked count
        updateBlockedCount();
    }
);

/**
 * Read the current checkbox states and persist them, then notify the content-script.
 */
function saveSettings() {
    const settings = {
        enabled: document.getElementById('filter-enabled').checked,
        filterBad: document.getElementById('filter-bad').checked,
        filterClickbait: document.getElementById('filter-clickbait').checked,
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
    'bad',
    'clickbait',
    'uppercase',
    'punctuation',
].forEach((key) => {
    document
        .getElementById(`filter-${key}`)
        .addEventListener('change', saveSettings);
});
