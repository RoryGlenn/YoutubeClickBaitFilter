let blockedCount = 0;

let userSettings = {
    enabled: true,
    filterBad: true,
    filterClickbait: true,
    filterUppercase: true,
    filterPunctuation: true
};

(() => {
    /**
     * List of keywords indicating negative or crisis-related content.
     * @type {string[]}
     */
    const NEGATIVE = [
        'anarchy',
        'breakdown',
        'calamity',
        'cataclysm',
        'catastrophe',
        'chaos',
        'collapse',
        'contagion',
        'crash',
        'crisis',
        'debacle',
        'disaster',
        'emergency',
        'epidemic',
        'exclusive',
        'exposed',
        'frenzy',
        'hacks',
        'havoc',
        'mayhem',
        'meltdown',
        'outbreak',
        'pandemic',
        'panic',
        'plague',
        'revealed',
        'secrets',
        'shocking',
        'turmoil',
        'unbelievable',
        'upheaval',
        'uproar',
        'urgent',
        'warning',
    ];

    /**
     * List of phrases commonly used in clickbait titles.
     * @type {string[]}
     */
    const CLICKBAIT = [
        'about to crack',
        'about to explode',
        'act fast',
        'act now',
        'are ruining the',
        'before and after',
        'before it disappears',
        'before it\'s too late',
        'blows your mind',
        'boost your',
        'breaking news',
        'caught in the act',
        'caught on camera',
        'confession',
        'debunked',
        'don\'t let this happen',
        'dont let this happen',
        'epic fail',
        'exclusive footage',
        'extreme makeover',
        'fails compilation',
        'final warning',
        'financial crisis',
        'game changer',
        'going to crack',
        'gone viral',
        'gone wrong',
        'government confirmed',
        'hack your',
        'hidden agenda',
        'hidden hack',
        'hidden truth',
        'horrifying truth',
        'incredible secret',
        'jaw-dropping',
        'jaw-dropping secrets',
        'just dropped',
        'just leaked',
        'life hack',
        'life changing',
        'life-changing',
        'life-changing hack',
        'life or death situation',
        'miracle hack',
        'mind blowing',
        'mind-blowing',
        'mind-blowing hack',
        'mind-blowing secrets',
        'massive fail',
        'must see',
        'must watch',
        'never before',
        'never before seen',
        'offer ends',
        'one simple trick',
        'one trick to',
        'only way to',
        'prepare to be amazed',
        'read this before',
        'scientists hate him',
        'secret hack',
        'secret weapon',
        'secrets of',
        'shocked the world',
        'shocking discovery',
        'shocking reveal',
        'shocking revelation',
        'shocking truth',
        'simple trick',
        'snake oil',
        'starting to crack',
        'time bomb',
        'today only',
        'transformation',
        'this will change everything',
        'the one thing',
        'the reason why',
        'the real reason',
        'the truth about',
        'they lied to us',
        'they lied to you',
        'ultimate guide',
        'ultimate secret',
        'underestimated',
        'unseen footage',
        'viral sensation',
        'ways to',
        'what happens next',
        'what nobody tells you',
        'what they don\'t want you to know',
        'you have to see this',
        'you need to know',
        'you need to see this',
        'you won\'t believe',
        'you won\'t believe what',
        'you won’t believe your eyes',
        'you\'re missing out'
    ];

    // 1) Load settings from chrome.storage then start filter & observer
    chrome.storage.sync.get(userSettings, stored => {
        userSettings = stored;
        runFilter();
        new MutationObserver(runFilter).observe(document.body, {
            childList: true,
            subtree: true
        });
    });

    /**
     * Determines if the given text contains any of the BAD keywords.
     * @param {string} text - The text to check.
     * @returns {boolean} True if a BAD keyword is present.
     */
    function isBad(text) {
        return NEGATIVE.some(word => text.toLowerCase().includes(word));
    }

    /**
     * Determines if the given text contains any clickbait phrases.
     * @param {string} text - The text to check.
     * @returns {boolean} True if a clickbait phrase is present.
     */
    function isClickbait(text) {
        return CLICKBAIT.some(word => text.toLowerCase().includes(word));
    }

    /**
     * Checks if the text contains three or more all-uppercase words.
     * @param {string} text - The text to analyze.
     * @returns {boolean} True if three or more uppercase words are found.
     */
    function hasThreeUpperCaseWords(text) {
        const words = text.trim().split(/\s+/);
        let count = 0;
        for (const w of words) {
            if (/[A-Z]/.test(w) && w === w.toUpperCase()) {
                count++;
                if (count >= 3) return true;
            }
        }
        return false;
    }

    /**
     * Checks if the title contains at least three exclamation marks or
     * at least three question marks anywhere in the string.
     * @param {string} title - The title to check.
     * @returns {boolean} True if three or more '!' or '?' are present.
     */
    function hasThreeOrMoreMarks(title) {
        const exCount = (title.match(/!/g) || []).length;
        const qmCount = (title.match(/\?/g) || []).length;
        return exCount >= 3 || qmCount >= 3;
    }

    /**
     * Hides standard YouTube video cards if their titles match any enabled filter.
     */
    function hideStandard() {
        document
            .querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer')
            .forEach(card => {
                const title = card.querySelector('#video-title')?.textContent.trim() || '';
                if (
                    (userSettings.filterBad && isBad(title)) ||
                    (userSettings.filterClickbait && isClickbait(title)) ||
                    (userSettings.filterUppercase && hasThreeUpperCaseWords(title)) ||
                    (userSettings.filterPunctuation && hasThreeOrMoreMarks(title))
                ) {
                    card.remove();
                    blockedCount++;
                }
            });
    }

    /**
     * Scans [aria-label] elements and removes their container if any enabled filter matches.
     */
    function removeByAriaRecursive() {
        document.querySelectorAll('[aria-label]').forEach(el => {
            const label = el.getAttribute('aria-label').trim();
            if (
                (userSettings.filterBad && isBad(label)) ||
                (userSettings.filterClickbait && isClickbait(label)) ||
                (userSettings.filterUppercase && hasThreeUpperCaseWords(label)) ||
                (userSettings.filterPunctuation && hasThreeOrMoreMarks(label))
            ) {
                const wrapper = el.closest('div.ytGridShelfViewModelGridShelfItem');
                if (wrapper) {
                    wrapper.remove();
                    blockedCount++;
                }
            }
        });
    }

    /**
     * Runs all enabled filters and logs the blocked count.
     */
    function runFilter() {
        if (!userSettings.enabled) return;
        // blockedCount = 0;
        hideStandard();
        removeByAriaRecursive();
        console.log('runFilter – blockedCount:', blockedCount);
    }

    // 2) Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('filter.js got message', message);

        if (message.type === 'updateSettings') {
            userSettings = message.settings;
            if (userSettings.enabled) {
                runFilter();
            } else {
                window.location.reload();
            }
            sendResponse({ok: true});
            return;
        }

        if (message.type === 'getBlockedCount') {
            sendResponse({blockedCount});
        }
    });
})();
