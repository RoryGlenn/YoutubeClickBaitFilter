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

        // Set the badge text with better formatting
        await chrome.action.setBadgeText({
            text: count > 0 ? (count > 99 ? '99+' : count.toString()) : '',
            tabId: tabId,
        });

        // Set badge background color and styling for maximum visibility
        await chrome.action.setBadgeBackgroundColor({
            color: count > 10 ? '#FF0000' : '#FF6600', // Red for high counts, orange for lower
            tabId: tabId,
        });

        // Optional: Set badge text color (Chrome 110+)
        try {
            await chrome.action.setBadgeTextColor({
                color: '#FFFFFF', // White text for contrast
                tabId: tabId,
            });
        } catch (error) {
            // Ignore if setBadgeTextColor is not supported
        }

        // Update tooltip with more detailed info
        await chrome.action.setTitle({
            title:
                count > 0
                    ? `YouTube ClickBait Filter - ${count} videos blocked on this page`
                    : 'YouTube ClickBait Filter - No videos blocked',
            tabId: tabId,
        });
    } catch (error) {
        // Silently ignore errors for non-existent tabs
        // (no console logging for production)
    }
}

/**
 * Listen for messages from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.type === 'updateBadge' && sender.tab) {
            updateBadge(message.count, sender.tab.id);
            sendResponse({ success: true });
            return true; // Keep the message channel open
        }
    } catch (error) {
        sendResponse({ error: error.message });
    }
});

/**
 * Clear badge when navigating away from YouTube
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
        if (
            changeInfo.status === 'complete' &&
            tab.url &&
            !tab.url.includes('youtube.com')
        ) {
            // Check if tab still exists before clearing badge
            const tabExists = await chrome.tabs.get(tabId).catch(() => null);
            if (tabExists) {
                await chrome.action.setBadgeText({
                    text: '',
                    tabId: tabId,
                });
            }
        }
    } catch (error) {
        // Silently ignore errors for non-existent tabs
        // (no console logging for production)
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
        // Silently handle errors
    }
});
