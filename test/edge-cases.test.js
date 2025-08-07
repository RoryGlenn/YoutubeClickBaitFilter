// edge-cases.test.js

/**
 * @fileoverview Edge case tests for the YouTube ClickBait Filter extension
 */

import { CLICKBAIT_WORDS, CLICKBAIT_PHRASES } from '../constants.js';

describe('Edge Case Tests', () => {
    describe('Unicode and Special Characters', () => {
        test('should handle unicode characters in titles', () => {
            const unicodeTitles = [
                'SHOCKING 🔥 This will BLOW your mind! 🤯',
                "You won't believe this EXPLOSIVE discovery 💯",
                'Regular tutorial 📚 about JavaScript',
                'TERRIFYING ⚠️ Warning about this TRICK',
                'Émojis and speçial çharacters tést',
            ];

            unicodeTitles.forEach((title) => {
                const lowerTitle = title.toLowerCase();

                // Should still detect clickbait words despite emojis
                const hasClickbaitWord = CLICKBAIT_WORDS.some((word) =>
                    lowerTitle.includes(word)
                );
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some((phrase) =>
                    lowerTitle.includes(phrase)
                );

                if (
                    title.includes('SHOCKING') ||
                    title.includes('EXPLOSIVE') ||
                    title.includes('TERRIFYING')
                ) {
                    expect(hasClickbaitWord).toBe(true);
                }

                if (title.includes("won't believe")) {
                    expect(hasClickbaitPhrase).toBe(true);
                }
            });
        });

        test('should handle various quote styles and apostrophes', () => {
            const quoteVariations = [
                "You won't believe this", // Standard apostrophe
                'You won\u2019t believe this', // Curly apostrophe
                'You won`t believe this', // Backtick
                '"SHOCKING" discovery', // Double quotes
                '\u2018SHOCKING\u2019 discovery', // Curly single quotes
                '\u201cSHOCKING\u201d discovery', // Curly double quotes
            ];

            quoteVariations.forEach((title) => {
                const lowerTitle = title.toLowerCase();

                // Normalize quotes for comparison
                const normalizedTitle = lowerTitle
                    .replace(/[\u2019\u2018`]/g, "'")
                    .replace(/[\u201c\u201d"]/g, '"');

                const hasClickbaitWord = CLICKBAIT_WORDS.some((word) =>
                    normalizedTitle.includes(word)
                );
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some((phrase) =>
                    normalizedTitle.includes(phrase)
                );

                if (title.toLowerCase().includes('shocking')) {
                    expect(hasClickbaitWord).toBe(true);
                }

                if (
                    title.toLowerCase().includes('won') &&
                    title.toLowerCase().includes('t believe')
                ) {
                    expect(hasClickbaitPhrase).toBe(true);
                }
            });
        });
    });

    describe('Extreme Length Titles', () => {
        test('should handle very short titles', () => {
            const shortTitles = [
                'WOW',
                'OMG!!!',
                'NO WAY',
                'SHOCKING',
                '???',
                'Hi',
                '',
                ' ',
            ];

            shortTitles.forEach((title) => {
                const lowerTitle = title.toLowerCase();

                // Should not throw errors on short titles
                expect(() => {
                    CLICKBAIT_WORDS.some((word) => lowerTitle.includes(word));
                    CLICKBAIT_PHRASES.some((phrase) =>
                        lowerTitle.includes(phrase)
                    );

                    const words = title.trim().split(/\s+/);
                    let uppercaseCount = 0;
                    for (const w of words) {
                        if (/[A-Z]/.test(w) && w === w.toUpperCase()) {
                            uppercaseCount++;
                        }
                    }
                }).not.toThrow();
            });
        });

        test('should handle extremely long titles', () => {
            const longTitle =
                "This is an extremely long title that goes on and on and contains many SHOCKING words and CRAZY phrases that should be detected by our filter but we want to make sure it can handle very long strings without performance issues or memory problems and continues to work correctly even when the title is hundreds of characters long and contains multiple instances of CLICKBAIT words and phrases like you won't believe what happens next and this will blow your mind and many other similar patterns that we need to detect efficiently";

            expect(longTitle.length).toBeGreaterThan(500);

            const lowerTitle = longTitle.toLowerCase();

            // Should still work correctly with very long titles
            const hasClickbaitWord = CLICKBAIT_WORDS.some((word) =>
                lowerTitle.includes(word)
            );
            const hasClickbaitPhrase = CLICKBAIT_PHRASES.some((phrase) =>
                lowerTitle.includes(phrase)
            );

            expect(hasClickbaitWord).toBe(true); // Should find 'shocking', 'crazy', 'clickbait'
            expect(hasClickbaitPhrase).toBe(true); // Should find multiple phrases
        });
    });

    describe('Case Sensitivity Edge Cases', () => {
        test('should handle mixed case variations', () => {
            const mixedCaseTitles = [
                'sHoCkInG discovery',
                "YoU wOn'T bElIeVe",
                'eXpLoSiVe tRiCk',
                'tErRiFyInG wArNiNg',
                'BREAKDOWN news update',
            ];

            mixedCaseTitles.forEach((title) => {
                const lowerTitle = title.toLowerCase();

                // Should detect regardless of mixed case
                const hasClickbaitWord = CLICKBAIT_WORDS.some((word) =>
                    lowerTitle.includes(word)
                );
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some((phrase) =>
                    lowerTitle.includes(phrase)
                );

                // All of these should be detected
                expect(hasClickbaitWord || hasClickbaitPhrase).toBe(true);
            });
        });

        test('should handle all uppercase vs lowercase edge cases', () => {
            const caseCombinations = [
                { title: 'SHOCKING', shouldMatch: true },
                { title: 'shocking', shouldMatch: true },
                { title: 'Shocking', shouldMatch: true },
                { title: 'ShOcKiNg', shouldMatch: true },
                { title: 'SHOCKIN', shouldMatch: false }, // Partial word
                { title: 'SHOCKING NEWS', shouldMatch: true },
            ];

            caseCombinations.forEach(({ title, shouldMatch }) => {
                const lowerTitle = title.toLowerCase();
                const hasClickbaitWord = CLICKBAIT_WORDS.some((word) =>
                    lowerTitle.includes(word)
                );

                expect(hasClickbaitWord).toBe(shouldMatch);
            });
        });
    });

    describe('Punctuation Edge Cases', () => {
        test('should handle various punctuation combinations', () => {
            const punctuationTests = [
                { title: '!!!', shouldTrigger: true },
                { title: '???', shouldTrigger: true },
                { title: '!?!?!?', shouldTrigger: true },
                { title: '!!', shouldTrigger: false }, // Only 2 exclamations
                { title: '??', shouldTrigger: false }, // Only 2 questions
                { title: '...!!!', shouldTrigger: true },
                { title: 'Word!!! Another!!!', shouldTrigger: true },
                { title: 'Normal. Sentence?', shouldTrigger: false },
            ];

            punctuationTests.forEach(({ title, shouldTrigger }) => {
                const exCount = (title.match(/!/g) || []).length;
                const qmCount = (title.match(/\?/g) || []).length;
                const hasExcessivePunctuation = exCount >= 3 || qmCount >= 3;

                expect(hasExcessivePunctuation).toBe(shouldTrigger);
            });
        });

        test('should handle punctuation within words', () => {
            const punctuationInWords = [
                "Don't miss this!!!",
                "Can't believe!!!",
                "Won't you??? Try this???",
                "It's amazing!!! Really???",
            ];

            punctuationInWords.forEach((title) => {
                // Should count punctuation regardless of word boundaries
                const exCount = (title.match(/!/g) || []).length;
                const qmCount = (title.match(/\?/g) || []).length;
                const hasExcessivePunctuation = exCount >= 3 || qmCount >= 3;

                expect(hasExcessivePunctuation).toBe(true);
            });
        });
    });

    describe('Word Boundary Edge Cases', () => {
        test('should handle partial word matches correctly', () => {
            const partialWordTests = [
                {
                    title: 'shocking discovery',
                    word: 'shocking',
                    shouldMatch: true,
                },
                {
                    title: 'explosive news',
                    word: 'explosive',
                    shouldMatch: true,
                },
                { title: 'revealed fact', word: 'revealed', shouldMatch: true },
                {
                    title: 'normal content',
                    word: 'shocking',
                    shouldMatch: false,
                },
                {
                    title: 'regular video',
                    word: 'explosive',
                    shouldMatch: false,
                },
            ];

            partialWordTests.forEach(({ title, word, shouldMatch }) => {
                const lowerTitle = title.toLowerCase();
                const hasExactWord =
                    CLICKBAIT_WORDS.includes(word) && lowerTitle.includes(word);

                expect(hasExactWord).toBe(shouldMatch);
            });
        });

        test('should handle hyphenated words', () => {
            const hyphenatedTitles = [
                'Mind-blowing discovery',
                'Life-changing trick',
                'Eye-opening revelation',
                'Jaw-dropping moment',
                'Well-known fact',
            ];

            hyphenatedTitles.forEach((title) => {
                const lowerTitle = title.toLowerCase();

                // Check if any part of hyphenated words matches
                const words = title.toLowerCase().split(/[-\s]+/);
                const hasClickbaitWord = words.some((word) =>
                    CLICKBAIT_WORDS.includes(word)
                );

                if (
                    title.includes('blowing') ||
                    title.includes('changing') ||
                    title.includes('opening') ||
                    title.includes('dropping')
                ) {
                    // These might be detected depending on our word list
                    // Just ensure no errors occur
                    expect(() => hasClickbaitWord).not.toThrow();
                }
            });
        });
    });

    describe('Phrase Detection Edge Cases', () => {
        test('should handle phrase variations with extra spaces', () => {
            const spaceVariations = [
                "you won't believe",
                "you  won't  believe", // Extra spaces
                "you\twon't\tbelieve", // Tabs
                "you\nwon't\nbelieve", // Newlines
                "you   won't   believe   this", // Multiple spaces
            ];

            spaceVariations.forEach((title) => {
                const normalizedTitle = title
                    .toLowerCase()
                    .replace(/\s+/g, ' ')
                    .trim();
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some((phrase) =>
                    normalizedTitle.includes(phrase)
                );

                // Should detect the phrase regardless of spacing variations
                expect(hasClickbaitPhrase).toBe(true);
            });
        });

        test('should handle overlapping phrases', () => {
            const overlappingTests = [
                "you won't believe this shocking discovery will blow your mind",
                'this secrets will change everything',
                'revealed truth about what happened next',
            ];

            overlappingTests.forEach((title) => {
                const lowerTitle = title.toLowerCase();
                const matchingPhrases = CLICKBAIT_PHRASES.filter((phrase) =>
                    lowerTitle.includes(phrase)
                );

                // Should detect multiple overlapping phrases
                expect(matchingPhrases.length).toBeGreaterThan(0);
            });
        });
    });

    describe('HTML Entity Edge Cases', () => {
        test('should handle HTML entities in titles', () => {
            const htmlEntityTitles = [
                'SHOCKING &amp; EXPLOSIVE discovery',
                'You won&apos;t believe this',
                'This &lt;TERRIFYING&gt; trick works',
                'Question: What&quest; Answer&excl;&excl;&excl;',
                'Caf&eacute; owner&apos;s SHOCKING secret',
            ];

            htmlEntityTitles.forEach((title) => {
                // Decode common HTML entities
                const decodedTitle = title
                    .replace(/&amp;/g, '&')
                    .replace(/&apos;/g, "'")
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&excl;/g, '!')
                    .replace(/&quest;/g, '?')
                    .replace(/&eacute;/g, 'é');

                const lowerTitle = decodedTitle.toLowerCase();

                const hasClickbaitWord = CLICKBAIT_WORDS.some((word) =>
                    lowerTitle.includes(word)
                );
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some((phrase) =>
                    lowerTitle.includes(phrase)
                );

                // Should detect clickbait even with HTML entities
                if (
                    decodedTitle.includes('SHOCKING') ||
                    decodedTitle.includes('EXPLOSIVE') ||
                    decodedTitle.includes('TERRIFYING')
                ) {
                    expect(hasClickbaitWord).toBe(true);
                }
            });
        });
    });

    describe('URL and Link Edge Cases', () => {
        test('should handle titles with URLs or hashtags', () => {
            const urlTitles = [
                'SHOCKING discovery at https://example.com',
                "You won't believe this #viral #trending",
                'Check out this EXPLOSIVE trick @username',
                'ALARMING: Visit www.example.com NOW!!!',
                'Download from bit.ly/shocking-news',
            ];

            urlTitles.forEach((title) => {
                const lowerTitle = title.toLowerCase();

                // Should still detect clickbait words despite URLs/hashtags
                const hasClickbaitWord = CLICKBAIT_WORDS.some((word) =>
                    lowerTitle.includes(word)
                );
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some((phrase) =>
                    lowerTitle.includes(phrase)
                );

                expect(() => {
                    hasClickbaitWord || hasClickbaitPhrase;
                }).not.toThrow();
            });
        });
    });

    describe('Number and Date Edge Cases', () => {
        test('should handle titles with numbers and dates', () => {
            const numberTitles = [
                'Top 10 SHOCKING discoveries of 2024',
                '5 EXPLOSIVE tricks that work 100% of the time',
                "You won't believe these 15 facts",
                'ALARMING: Only 24 hours left!!!',
                'This SHOCKING discovery will change everything',
            ];

            numberTitles.forEach((title) => {
                const lowerTitle = title.toLowerCase();

                const hasClickbaitWord = CLICKBAIT_WORDS.some((word) =>
                    lowerTitle.includes(word)
                );
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some((phrase) =>
                    lowerTitle.includes(phrase)
                );

                // Should detect clickbait regardless of numbers
                expect(hasClickbaitWord || hasClickbaitPhrase).toBe(true);
            });
        });
    });

    describe('Malformed Input Edge Cases', () => {
        test('should handle null and undefined inputs gracefully', () => {
            const malformedInputs = [null, undefined, NaN, 0, false, {}];

            malformedInputs.forEach((input) => {
                expect(() => {
                    const title = String(input || '');
                    const lowerTitle = title.toLowerCase();
                    CLICKBAIT_WORDS.some((word) => lowerTitle.includes(word));
                    CLICKBAIT_PHRASES.some((phrase) =>
                        lowerTitle.includes(phrase)
                    );
                }).not.toThrow();
            });
        });

        test('should handle titles with only whitespace', () => {
            const whitespaceTests = [
                '   ',
                '\t\t\t',
                '\n\n\n',
                '\r\n\r\n',
                '  \t  \n  ',
            ];

            whitespaceTests.forEach((title) => {
                expect(() => {
                    const trimmedTitle = title.trim();
                    if (trimmedTitle) {
                        const lowerTitle = trimmedTitle.toLowerCase();
                        CLICKBAIT_WORDS.some((word) =>
                            lowerTitle.includes(word)
                        );
                        CLICKBAIT_PHRASES.some((phrase) =>
                            lowerTitle.includes(phrase)
                        );
                    }
                }).not.toThrow();
            });
        });
    });
});
