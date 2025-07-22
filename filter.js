// filter.js

import {
    pipeline
} from '@xenova/transformers';

let blockedCount = 0;

let userSettings = {
    enabled: true,
    filterBad: true,
    filterClickbait: true,
    filterUppercase: true,
    filterPunctuation: true
};

// --- model files hosted on jsDelivr CDN
const MODEL_BASE = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.4.0/dist/models/ilsilfverskiold/classify-clickbait-titles/quantized';

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
    'are secretly ',
    'about to crack',
    'a big secret',
    'than i thought',
    'about to explode',
    'after this happened',
    'why are all',
    'about to get',
    'getting worse',
    'act fast',
    'act now',
    'are ruining the',
    'become impossible',
    'before and after',
    "before it's too late",
    'blows your mind',
    'boost your',
    'breaking news',
    'caught in the act',
    'caught on camera',
    'confession',
    'debunked',
    'disturbing reality',
    "don't let this happen",
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
    'rethink everything',
    'rethink your life',
    'jaw-dropping',
    'jaw-dropping secrets',
    'just dropped',
    'just leaked',
    'life hack',
    'life changing',
    'this is what',
    'this is how',
    'life-changing',
    'life or death situation',
    'miracle hack',
    'mind blowing',
    'mind-blowing',
    'mind-blowing hack',
    'mind-blowing secrets',
    'massive fail',
    'must see',
    'for the first time',
    'of all time',
    'you need to',
    'hidden horrors of ',
    'must watch',
    'never before',
    'never before seen',
    'no one is talking about',
    'no one has told you',
    'no one talks about',
    'no one tells',
    'nobody tells you',
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
    "you'll ever need",
    'did you know ',
    'shocking reveal',
    'shocking revelation',
    'shocking truth',
    'simple trick',
    'snake oil',
    'starting to crack',
    'time bomb',
    'today only',
    'transformation',
    'things i wish i knew before',
    'this will change everything',
    'things you need to',
    "things you don't know",
    'will make you',
    'ruining everything',
    'ruining every',
    'ruining your',
    'the one thing',
    'pov:',
    'pov ',
    'live:',
    'the reason why',
    'the real reason',
    'why you should ',
    'the truth about',
    'they lied to us',
    'they lied to you',
    'ultimate guide',
    'ultimate secret',
    'underestimated',
    'unseen footage',
    'viral sensation',
    'ways to',
    'of the year',
    'what happens next',
    'what nobody tells you',
    "what they don't want you to know",
    "don't want you to",
    'you have to see this',
    "you won't believe",
    'you wont believe',
    "you're missing out",
    'you are missing out',
    'how to get ahead of',
    'only 1% of people',
    '99% of people',
    '100% guaranteed',
    '100% risk free',
    '100% effective',
    'cheat code',
    '...'
];

// --- 3) CLICKBAIT MODEL SETUP with explicit URLs
let clickbaitClassifier = null;
async function initClickbaitModel() {
    if (clickbaitClassifier) return clickbaitClassifier;
    clickbaitClassifier = await pipeline(
        'text-classification',
        MODEL_BASE, {
            quantized: true,
            max_length: 128,
            configUrl: `${MODEL_BASE}/config.json`,
            modelUrl: `${MODEL_BASE}/model.onnx`,
            tokenizerUrl: `${MODEL_BASE}/tokenizer.json`
        }
    );
    console.log('[Clickbait] Model loaded ✔', clickbaitClassifier);
    return clickbaitClassifier;
}

// --- 4) Quick regex prefilter for obvious cases
const quickClickbaitRegex = /\b(you wont believe|you won't believe|secret hack|\.{2,}|this is what)\b/i;

(() => {
    // 5) LOAD SETTINGS & PRELOAD MODEL IF NEEDED
    chrome.storage.sync.get(userSettings, stored => {
        userSettings = stored;
        if (userSettings.filterClickbait) initClickbaitModel();
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
        const model = userSettings.filterClickbait ?
            await initClickbaitModel() :
            null;

        for (const card of cards) {
            const titleElem = card.querySelector('#video-title');
            const title = titleElem?.textContent.trim() || '';

            // BAD / UPPERCASE / PUNCTUATION filters
            if (userSettings.filterBad && isBad(title)) {
                card.remove();
                blockedCount++;
                continue;
            }
            if (userSettings.filterUppercase && hasThreeUpperCaseWords(title)) {
                card.remove();
                blockedCount++;
                continue;
            }
            if (userSettings.filterPunctuation && hasThreeOrMoreMarks(title)) {
                card.remove();
                blockedCount++;
                continue;
            }

            // CLICKBAIT quick regex
            if (userSettings.filterClickbait && quickClickbaitRegex.test(title)) {
                card.remove();
                blockedCount++;
                continue;
            }


            // CLICKBAIT ML fallback
            if (userSettings.filterClickbait && model) {
                try {
                    const [{label, score}] = await model(title);
                    if (label === 'CLICKBAIT' && score > 0.75) {
                        card.remove();
                        blockedCount++;
                        console.log('[Clickbait] Removed:', title);
                        continue;
                    }
                } catch (e) {
                    console.warn('Clickbait model error:', e);
                }
            }
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
                (userSettings.filterClickbait && quickClickbaitRegex.test(label))
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
        if (!userSettings.enabled) return;
        await hideStandard();
        removeByAriaRecursive();
        console.log('runFilter - blockedCount:', blockedCount);
    }

    // 9) LISTEN FOR POPUP SETTINGS UPDATES
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'updateSettings') {
            userSettings = message.settings;
            if (userSettings.enabled) runFilter();
            else window.location.reload();
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