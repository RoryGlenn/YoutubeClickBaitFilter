// background.js

/**
 * Update the extension badge with the blocked count
 * @param {number} count - The number of blocked elements
 * @param {number} tabId - The tab ID to update the badge for
 */
function updateBadge(count, tabId) {
    try {
        // Set the badge text
        chrome.action.setBadgeText({
            text: count > 0 ? count.toString() : '',
            tabId: tabId
        });
        
        // Set badge background color (red for blocked content)
        chrome.action.setBadgeBackgroundColor({
            color: '#FF4444',
            tabId: tabId
        });
    } catch (error) {
        console.error('Failed to update badge:', error);
    }
}

/**
 * Listen for messages from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.type === 'updateBadge' && sender.tab) {
            updateBadge(message.count, sender.tab.id);
            sendResponse({success: true});
            return true; // Keep the message channel open
        }
    } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({error: error.message});
    }
});

/**
 * Clear badge when navigating away from YouTube
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    try {
        if (changeInfo.status === 'complete' && tab.url && !tab.url.includes('youtube.com')) {
            chrome.action.setBadgeText({
                text: '',
                tabId: tabId
            });
        }
    } catch (error) {
        console.error('Error clearing badge on navigation:', error);
    }
});

/**
 * Clear badge when tab is closed
 */
chrome.tabs.onRemoved.addListener((tabId) => {
    try {
        chrome.action.setBadgeText({
            text: '',
            tabId: tabId
        });
    } catch (error) {
        console.error('Error clearing badge on tab close:', error);
    }
});
