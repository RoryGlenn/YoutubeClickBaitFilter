// background.js

/**
 * Update the extension badge with the blocked count
 * @param {number} count - The number of blocked elements
 * @param {number} tabId - The tab ID to update the badge for
 */
async function updateBadge(count, tabId) {
    try {
        // Check if tab still exists before updating badge
        const tab = await chrome.tabs.get(tabId).catch(() => null);
        if (!tab) {
            // Tab no longer exists, silently return
            return;
        }
        
        // Set the badge text
        await chrome.action.setBadgeText({
            text: count > 0 ? count.toString() : '',
            tabId: tabId
        });
        
        // Set badge background color (red for blocked content)
        await chrome.action.setBadgeBackgroundColor({
            color: '#FF4444',
            tabId: tabId
        });
    } catch (error) {
        // Silently ignore errors for non-existent tabs
        if (!error.message.includes('No tab with id')) {
            console.error('Failed to update badge:', error);
        }
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
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
        if (changeInfo.status === 'complete' && tab.url && !tab.url.includes('youtube.com')) {
            // Check if tab still exists before clearing badge
            const tabExists = await chrome.tabs.get(tabId).catch(() => null);
            if (tabExists) {
                await chrome.action.setBadgeText({
                    text: '',
                    tabId: tabId
                });
            }
        }
    } catch (error) {
        // Silently ignore errors for non-existent tabs
        if (!error.message.includes('No tab with id')) {
            console.error('Error clearing badge on navigation:', error);
        }
    }
});

/**
 * Clear badge when tab is closed
 */
chrome.tabs.onRemoved.addListener(async (tabId) => {
    try {
        // No need to clear badge for removed tabs as they're already gone
        // This listener is mainly for cleanup if needed
    } catch (error) {
        console.error('Error in tab removal handler:', error);
    }
});
