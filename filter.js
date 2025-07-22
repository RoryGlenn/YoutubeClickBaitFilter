// filter.js

let blockedCount = 0;

let userSettings = {
    enabled: true,
    filterBad: true,
    filterClickbait: true,
    filterUppercase: true,
    filterPunctuation: true
};

// --- model files hosted on jsDelivr CDN
// const MODEL_BASE = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.4.0/dist/models/ilsilfverskiold/classify-clickbait-titles/quantized';

// --- 1) NEGATIVE keywords
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
    'warning'
];

// --- 2) CLICKBAIT phrases (for reference; we use regex + ML)
const CLICKBAIT = [
    '...',
    '100% effective',
    '100% guaranteed',
    '100% risk free',
    '99% of people',
    'a big secret',
    'about to crack',
    'about to explode',
    'about to get',
    'act fast',
    'act now',
    'after this happened',
    'are ruining the',
    'are secretly ',
    'become impossible',
    'before and after',
    "before it's too late",
    'blows your mind',
    'boost your',
    'breaking news',
    'caught in the act',
    'caught on camera',
    'cheat code',
    'confession',
    'debunked',
    'did you know ',
    'disturbing reality',
    "don't let this happen",
    "don't want you to",
    'dont let this happen',
    'epic fail',
    'exclusive footage',
    'extreme makeover',
    'fails compilation',
    'final warning',
    'financial crisis',
    'for the first time',
    'game changer',
    'getting worse',
    'going to crack',
    'gone viral',
    'gone wrong',
    'government confirmed',
    'hack your',
    'hidden agenda',
    'hidden hack',
    'hidden horrors of ',
    'hidden truth',
    'horrifying truth',
    'how to get ahead of',
    'incredible secret',
    'jaw-dropping',
    'jaw-dropping secrets',
    'just dropped',
    'just leaked',
    'life changing',
    'life hack',
    'life or death situation',
    'life-changing',
    'live:',
    'massive fail',
    'mind blowing',
    'mind-blowing',
    'mind-blowing hack',
    'mind-blowing secrets',
    'miracle hack',
    'must see',
    'must watch',
    'never before',
    'never before seen',
    'no one has told you',
    'no one is talking about',
    'no one talks about',
    'no one tells',
    'nobody tells you',
    'of all time',
    'of the year',
    'offer ends',
    'one simple trick',
    'one trick to',
    'only 1% of people',
    'only way to',
    'pov ',
    'pov:',
    'prepare to be amazed',
    'read this before',
    'rethink everything',
    'rethink your life',
    'ruining every',
    'ruining everything',
    'ruining your',
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
    'than i thought',
    'the one thing',
    'the real reason',
    'the reason why',
    'the truth about',
    'they lied to us',
    'they lied to you',
    'things i wish i knew before',
    "things you don't know",
    'things you need to',
    'this is how',
    'this is what',
    'this will change everything',
    'time bomb',
    'today only',
    'transformation',
    'ultimate guide',
    'ultimate secret',
    'underestimated',
    'unseen footage',
    'viral sensation',
    'ways to',
    'what happens next',
    'what nobody tells you',
    "what they don't want you to know",
    'why are all',
    'why you should ',
    'will make you',
    'you are missing out',
    'you have to see this',
    'you need to',
    "you won't believe",
    'you wont believe',
    "you'll ever need",
    "you're missing out",
    "is this the end",
    "no one wants to",
    "everyone wants to",
    "will shock you",

];


// --- 3) CLICKBAIT MODEL SETUP with explicit URLs
// let clickbaitClassifier = null;
// async function initClickbaitModel() {
//     if (clickbaitClassifier) return clickbaitClassifier;
//     clickbaitClassifier = await pipeline(
//         'text-classification',
//         MODEL_BASE, {
//             quantized: true,
//             max_length: 128,
//             configUrl: `${MODEL_BASE}/config.json`,
//             modelUrl: `${MODEL_BASE}/model.onnx`,
//             tokenizerUrl: `${MODEL_BASE}/tokenizer.json`
//         }
//     );
//     console.log('[Clickbait] Model loaded ✔', clickbaitClassifier);
//     return clickbaitClassifier;
// }

// --- 4) Quick regex prefilter for obvious cases
// const quickClickbaitRegex = /\b(you wont believe|you won't believe|secret hack|\.{2,}|this is what)\b/i;

(() => {
    // 5) LOAD SETTINGS & PRELOAD MODEL IF NEEDED
    chrome.storage.sync.get(userSettings, stored => {
        userSettings = stored;
        // if (userSettings.filterClickbait) initClickbaitModel();
        runFilter();
        new MutationObserver(runFilter).observe(document.body, {
            childList: true,
            subtree: true
        });
    });

    // 6) ASYNC STANDARD VIDEO CARD HIDING
    async function hideStandard() {
        const cards = document.querySelectorAll(
            'ytd-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer'
        );
        // const model = userSettings.filterClickbait ?
        //     await initClickbaitModel() :
        //     null;

        for (const card of cards) {
            const titleElem = card.querySelector('#video-title');
            const title = titleElem?.textContent.trim() || '';

            if (userSettings.filterBad && isBad(title)) {
                card.remove();
                blockedCount++;
            } else if (userSettings.filterUppercase && hasThreeUpperCaseWords(title)) {
                card.remove();
                blockedCount++;

            } else if (userSettings.filterPunctuation && hasThreeOrMoreMarks(title)) {
                card.remove();
                blockedCount++;

            } else if (userSettings.filterBad && isClickbait(title)) {
                card.remove();
                blockedCount++;
            }

            // CLICKBAIT quick regex
            // if (userSettings.filterClickbait && quickClickbaitRegex.test(title)) {
            //     card.remove();
            //     blockedCount++;
            //     continue;
            // }

            // CLICKBAIT ML fallback
            // if (userSettings.filterClickbait && model) {
            //     try {
            //         const [{label, score}] = await model(title);
            //         if (label === 'CLICKBAIT' && score > 0.75) {
            //             card.remove();
            //             blockedCount++;
            //             console.log('[Clickbait] Removed:', title);
            //             continue;
            //         }
            //     } catch (e) {
            //         console.warn('Clickbait model error:', e);
            //     }
            // }
        }
    }

    // 7) SYNC ARIA-LABEL REMOVAL
    function removeByAriaRecursive() {
        document.querySelectorAll('[aria-label]').forEach(el => {
            const label = el.getAttribute('aria-label').trim();
            if (
                (userSettings.filterBad && isBad(label)) ||
                (userSettings.filterUppercase && hasThreeUpperCaseWords(label)) ||
                (userSettings.filterPunctuation && hasThreeOrMoreMarks(label)) ||
                // (userSettings.filterClickbait && quickClickbaitRegex.test(label))
                (userSettings.filterClickbait && isClickbait(label))
            ) {
                const wrapper = el.closest('div.ytGridShelfViewModelGridShelfItem');
                if (wrapper) {
                    wrapper.remove();
                    blockedCount++;
                }
            }
        });
    }

    // 8) RUN ALL FILTERS
    async function runFilter() {
        if (!userSettings.enabled) {
            return;
        }
        await hideStandard();
        removeByAriaRecursive();
        console.log('runFilter - blockedCount:', blockedCount);
    }

    // 9) LISTEN FOR POPUP SETTINGS UPDATES
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'updateSettings') {
            userSettings = message.settings;
            if (userSettings.enabled) {
                runFilter();
            } else {
                window.location.reload();
            }
            sendResponse({
                ok: true
            });
            return;
        }
        if (message.type === 'getBlockedCount') {
            sendResponse({
                blockedCount
            });
        }
    });

    // 10) HELPER FUNCTIONS
    function isBad(text) {
        return NEGATIVE.some(word => text.toLowerCase().includes(word));
    }

    function isClickbait(text) {
        return CLICKBAIT.some(word => text.toLowerCase().includes(word));
    }

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

    function hasThreeOrMoreMarks(title) {
        const exCount = (title.match(/!/g) || []).length;
        const qmCount = (title.match(/\?/g) || []).length;
        return exCount >= 3 || qmCount >= 3;
    }
})();