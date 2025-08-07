// constants.test.js

/**
 * @fileoverview Unit tests for constants.js to ensure data integrity
 */

import { CLICKBAIT_WORDS, CLICKBAIT_PHRASES } from '../constants.js';

describe('Constants Data Integrity Tests', () => {
    describe('Superset Detection', () => {
        test('CLICKBAIT_PHRASES should not contain phrases that are supersets of CLICKBAIT_WORDS', () => {
            const redundantPhrases = [];

            // Check each phrase against each word
            CLICKBAIT_PHRASES.forEach((phrase) => {
                CLICKBAIT_WORDS.forEach((word) => {
                    // Check if the phrase contains the word as a complete word (not just a substring)
                    const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                    if (wordRegex.test(phrase)) {
                        redundantPhrases.push({
                            phrase: phrase,
                            containsWord: word,
                            reason: `Phrase "${phrase}" contains word "${word}" which is already filtered`,
                        });
                    }
                });
            });

            // If we find any redundant phrases, fail the test with details
            if (redundantPhrases.length > 0) {
                const errorMessage =
                    `Found ${redundantPhrases.length} redundant phrases:\n` +
                    redundantPhrases
                        .map((item) => `  - ${item.reason}`)
                        .join('\n');
                throw new Error(errorMessage);
            }
        });

        test('CLICKBAIT_WORDS should not contain duplicate entries', () => {
            const duplicates = [];
            const seen = new Set();

            CLICKBAIT_WORDS.forEach((word) => {
                if (seen.has(word.toLowerCase())) {
                    duplicates.push(word);
                } else {
                    seen.add(word.toLowerCase());
                }
            });

            expect(duplicates).toEqual([]);
        });

        test('CLICKBAIT_PHRASES should not contain duplicate entries', () => {
            const duplicates = [];
            const seen = new Set();

            CLICKBAIT_PHRASES.forEach((phrase) => {
                if (seen.has(phrase.toLowerCase())) {
                    duplicates.push(phrase);
                } else {
                    seen.add(phrase.toLowerCase());
                }
            });

            expect(duplicates).toEqual([]);
        });
    });

    describe('Data Format Validation', () => {
        test('CLICKBAIT_WORDS should be an array of non-empty strings', () => {
            expect(Array.isArray(CLICKBAIT_WORDS)).toBe(true);
            expect(CLICKBAIT_WORDS.length).toBeGreaterThan(0);

            CLICKBAIT_WORDS.forEach((word, index) => {
                expect(typeof word).toBe('string');
                expect(word.trim().length).toBeGreaterThan(0);
                expect(word).toBe(word.toLowerCase()); // Should be lowercase
            });
        });

        test('CLICKBAIT_PHRASES should be an array of non-empty strings', () => {
            expect(Array.isArray(CLICKBAIT_PHRASES)).toBe(true);
            expect(CLICKBAIT_PHRASES.length).toBeGreaterThan(0);

            CLICKBAIT_PHRASES.forEach((phrase, index) => {
                expect(typeof phrase).toBe('string');
                expect(phrase.trim().length).toBeGreaterThan(0);
                expect(phrase).toBe(phrase.toLowerCase()); // Should be lowercase

                // Check if phrase is multi-word and provide detailed error if not
                const wordCount = phrase.split(' ').length;
                const hasHyphen = phrase.includes('-');

                // Allow single "words" if they contain hyphens (e.g., "jaw-dropping", "life-changing")
                if (wordCount <= 1 && !hasHyphen) {
                    throw new Error(
                        `Phrase at index ${index} is not multi-word and has no hyphen: "${phrase}" (word count: ${wordCount})`
                    );
                }

                // Should be multi-word OR hyphenated
                expect(wordCount > 1 || hasHyphen).toBe(true);
            });
        });

        test('Arrays should be alphabetically sorted', () => {
            const sortedWords = [...CLICKBAIT_WORDS].sort();
            expect(CLICKBAIT_WORDS).toEqual(sortedWords);

            const sortedPhrases = [...CLICKBAIT_PHRASES].sort();
            expect(CLICKBAIT_PHRASES).toEqual(sortedPhrases);
        });
    });

    describe('Content Quality', () => {
        test('CLICKBAIT_WORDS should not contain multi-word phrases', () => {
            const multiWordEntries = CLICKBAIT_WORDS.filter(
                (word) => word.includes(' ') && !word.endsWith(':')
            );

            if (multiWordEntries.length > 0) {
                throw new Error(
                    `Found multi-word entries in CLICKBAIT_WORDS: ${multiWordEntries.join(', ')}`
                );
            }
        });

        // test('CLICKBAIT_PHRASES should not contain single words', () => {
        //     const singleWordEntries = CLICKBAIT_PHRASES.filter(phrase =>
        //         !phrase.includes(' ')
        //     );

        //     if (singleWordEntries.length > 0) {
        //         throw new Error(`Found single-word entries in CLICKBAIT_PHRASES: ${singleWordEntries.join(', ')}`);
        //     }
        // });
    });
});
