// filter.js
(() => {
  /**
   * List of keywords indicating negative or crisis-related content.
   * @type {string[]}
   */
  const BAD = [
    'crisis', 'panic', 'epidemic', 'collapse',
    'emergency', 'disaster', 'catastrophe', 'calamity', 'cataclysm', 'debacle',
    'breakdown', 'meltdown', 'crash',
    'turmoil', 'upheaval', 'chaos', 'havoc', 'anarchy', 'uproar', 'mayhem', 'frenzy',
    'pandemic', 'outbreak', 'plague', 'contagion',
  ];

  /**
   * List of phrases commonly used in clickbait titles.
   * @type {string[]}
   */
const CLICKBAIT = [
  'act fast',
  'act now',
  'about to crack',
  'about to explode',
  'are ruining the',
  'before it disappears',
  'before it\'s too late',
  'blows your mind',
  'boost your',
  'breaking news',
  'caught on camera',
  'don\'t let this happen',
  'dont let this happen',
  'exclusive',
  'exposed',
  'financial crisis',
  'final warning',
  'game changer',
  'going to crack',
  'gone wrong',
  'government CONFIRMED',
  'hack your',
  'hacks',
  'hidden truth',
  'horrifying truth',
  'incredible',
  'jaw-dropping',
  'just leaked',
  'life hack',
  'life-changing',
  'mind-blowing',
  'miracle',
  'must see',
  'must watch',
  'never before',
  'one simple trick',
  'one trick to',
  'offer ends',
  'only way to',
  'read this before',
  'revealed',
  'secret weapon',
  'secrets',
  'shocked the world',
  'shocking',
  'simple trick',
  'starting to crack',
  'time bomb',
  'today only',
  'top ',
  'ultimate guide',
  'unbelievable',
  'URGENT',
  'WARNING',
  'ways to',
  'what happens next',
  'what nobody tells you',
  'what they don\'t want you to know',
  'the one thing',
  'the reason why',
  'the real reason',
  'the truth about',
  'they lied to us',
  'they lied to you',
  'you need to know',
  'you need to see this',
  'you won\'t believe',
  'you won\'t believe what',
  'you\'re missing out'
];


  /**
   * Determines if the given text contains any of the BAD keywords.
   * @param {string} text - The text to check.
   * @returns {boolean} True if a BAD keyword is present.
   */
  function isBad(text) {
    return BAD.some(word => text.toLowerCase().includes(word));
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
   * Hides standard YouTube video cards (home feed, search results, channel pages)
   * if their titles match any of the removal criteria.
   */
  function hideStandard() {
    document
      .querySelectorAll(
        'ytd-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer'
      )
      .forEach(card => {
        const title = card.querySelector('#video-title')?.textContent.trim() || '';
        if (
          isBad(title) ||
          isClickbait(title) ||
          hasThreeUpperCaseWords(title) ||
          hasThreeOrMoreMarks(title)
        ) {
          card.remove();
        }
      });
  }

  /**
   * Recursively scans all elements with an aria-label attribute, and
   * whenever it finds one whose label matches any removal criteria,
   * climbs up the DOM tree to find the containing
   * <div class="ytGridShelfViewModelGridShelfItem"> and removes it.
   */
  function removeByAriaRecursive() {
    document.querySelectorAll('[aria-label]').forEach(el => {
      const label = el.getAttribute('aria-label').trim();
      if (
        (label && isBad(label)) ||
        (label && isClickbait(label)) ||
        (label && hasThreeUpperCaseWords(label)) ||
        (label && hasThreeOrMoreMarks(label))
      ) {
        const wrapper = el.closest('div.ytGridShelfViewModelGridShelfItem');
        if (wrapper) {
          wrapper.remove();
        }
      }
    });
  }

  /**
   * Executes all filter passes on the current page.
   */
  function runFilter() {
    hideStandard();
    removeByAriaRecursive();
  }

  // Initial execution
  runFilter();

  // Re-apply filters whenever the DOM changes (infinite scroll, AJAX navigation, etc.)
  new MutationObserver(runFilter).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
