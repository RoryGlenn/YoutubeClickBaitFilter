// Load saved settings
chrome.storage.sync.get({
    enabled: true,
    filterBad: true,
    filterClickbait: true,
    filterUppercase: true,
    filterPunctuation: true
}, (settings) => {
    document.getElementById('filter-enabled').checked = settings.enabled;
    document.getElementById('filter-bad').checked = settings.filterBad;
    document.getElementById('filter-clickbait').checked = settings.filterClickbait;
    document.getElementById('filter-uppercase').checked = settings.filterUppercase;
    document.getElementById('filter-punctuation').checked = settings.filterPunctuation;
});

// Save settings when changed
function saveSettings() {
    const settings = {
        enabled: document.getElementById('filter-enabled').checked,
        filterBad: document.getElementById('filter-bad').checked,
        filterClickbait: document.getElementById('filter-clickbait').checked,
        filterUppercase: document.getElementById('filter-uppercase').checked,
        filterPunctuation: document.getElementById('filter-punctuation').checked
    };
    
    chrome.storage.sync.set(settings);
    
    // Send message to content script to update settings
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'updateSettings', settings: settings});
    });
}

// Add event listeners
document.getElementById('filter-enabled').addEventListener('change', saveSettings);
document.getElementById('filter-bad').addEventListener('change', saveSettings);
document.getElementById('filter-clickbait').addEventListener('change', saveSettings);
document.getElementById('filter-uppercase').addEventListener('change', saveSettings);
document.getElementById('filter-punctuation').addEventListener('change', saveSettings);

// Fetch and display the number of blocked videos
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'getBlockedCount'}, (response) => {
        if (response && typeof response.blockedCount === 'number') {
            document.getElementById('blocked-count').textContent = response.blockedCount;
        }
    });
});
