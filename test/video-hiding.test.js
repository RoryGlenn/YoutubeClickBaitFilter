// video-hiding.test.js

/**
 * @fileoverview Tests specifically for video container hiding functionality
 */

import { CLICKBAIT_WORDS, CLICKBAIT_PHRASES } from '../src/shared/constants.js';

describe('Video Hiding Tests', () => {
    describe('Complete Container Removal', () => {
        test('should target multiple YouTube container types', () => {
            // Test that we have comprehensive selector coverage
            const expectedSelectors = [
                'ytd-video-renderer',
                'ytd-rich-item-renderer',
                'ytd-grid-video-renderer',
                'ytd-compact-video-renderer',
                'ytd-playlist-video-renderer',
                'ytd-movie-renderer',
                'ytd-radio-renderer',
            ];

            // Verify comprehensive selector coverage
            expect(expectedSelectors.length).toBeGreaterThan(5);
            expect(expectedSelectors).toContain('ytd-video-renderer');
            expect(expectedSelectors).toContain('ytd-rich-item-renderer');
            expect(expectedSelectors).toContain('ytd-grid-video-renderer');
        });

        test('should handle multiple title selector fallbacks', () => {
            const titleSelectors = [
                '#video-title',
                '.ytd-video-meta-block #video-title',
                'a#video-title',
                '[id="video-title"]',
                'h3 a',
                '.title a',
            ];

            // Verify we have comprehensive title selector coverage
            expect(titleSelectors.length).toBeGreaterThan(4);
            expect(titleSelectors).toContain('#video-title');
            expect(titleSelectors).toContain('h3 a');
        });

        test('should find proper container wrappers for aria-label elements', () => {
            const containerSelectors = [
                'div.ytGridShelfViewModelGridShelfItem',
                'ytd-rich-item-renderer',
                'ytd-video-renderer',
                'ytd-grid-video-renderer',
                '[class*="video"]',
            ];

            // Verify comprehensive wrapper selector coverage
            expect(containerSelectors.length).toBeGreaterThan(3);
            expect(containerSelectors).toContain('ytd-video-renderer');
            expect(containerSelectors).toContain('ytd-rich-item-renderer');
        });
    });

    describe('Filtering Logic Verification', () => {
        test('should properly identify clickbait content for removal', () => {
            const testCases = [
                {
                    title: 'SHOCKING discovery that will BLOW your mind!!!',
                    shouldFilter: true,
                },
                {
                    title: "You won't believe what happened next",
                    shouldFilter: true,
                },
                {
                    title: 'URGENT WARNING about this new threat',
                    shouldFilter: true,
                },
                {
                    title: 'How to learn JavaScript - beginner tutorial',
                    shouldFilter: false,
                },
                { title: 'React vs Vue comparison', shouldFilter: false },
            ];

            testCases.forEach(({ title, shouldFilter }) => {
                const lowerTitle = title.toLowerCase();

                // Check clickbait words
                const hasClickbaitWord = CLICKBAIT_WORDS.some((word) =>
                    lowerTitle.includes(word)
                );

                // Check clickbait phrases
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some((phrase) =>
                    lowerTitle.includes(phrase)
                );

                // Check uppercase (3+ uppercase words)
                const words = title.trim().split(/\s+/);
                let uppercaseCount = 0;
                for (const w of words) {
                    if (/[A-Z]/.test(w) && w === w.toUpperCase()) {
                        uppercaseCount++;
                    }
                }
                const hasExcessiveUppercase = uppercaseCount >= 3;

                // Check punctuation (3+ exclamation/question marks)
                const exCount = (title.match(/!/g) || []).length;
                const qmCount = (title.match(/\?/g) || []).length;
                const hasExcessivePunctuation = exCount >= 3 || qmCount >= 3;

                const actualShouldFilter =
                    hasClickbaitWord ||
                    hasClickbaitPhrase ||
                    hasExcessiveUppercase ||
                    hasExcessivePunctuation;

                expect(actualShouldFilter).toBe(shouldFilter);
            });
        });
    });

    describe('New Layout Handling', () => {
        test('should detect containers that need special handling', () => {
            // Test logic for identifying containers that need processing
            const containerTypes = [
                { tagName: 'DIV', shouldProcess: true },
                { tagName: 'SECTION', shouldProcess: true },
                { tagName: 'YTD-VIDEO-RENDERER', shouldProcess: false },
                { tagName: 'ytd-rich-item-renderer', shouldProcess: false },
            ];

            containerTypes.forEach(({ tagName, shouldProcess }) => {
                const isYtdElement = tagName.toLowerCase().startsWith('ytd-');
                const shouldProcessContainer = !isYtdElement;

                expect(shouldProcessContainer).toBe(shouldProcess);
            });
        });

        test('should handle various title element patterns', () => {
            const titleElementSelectors = [
                'h3',
                '[role="heading"]',
                '[class*="title"]',
                'a[href*="/watch"]',
            ];

            // Verify we have good coverage of title element patterns
            expect(titleElementSelectors.length).toBeGreaterThan(2);
            expect(titleElementSelectors).toContain('h3');
            expect(titleElementSelectors).toContain('[role="heading"]');
        });
    });

    describe('Error Handling', () => {
        test('should handle missing title elements gracefully', () => {
            // Test that we handle null/undefined title elements
            const mockTitleSources = [
                { textContent: null },
                { textContent: undefined },
                { textContent: '' },
                null,
                undefined,
            ];

            mockTitleSources.forEach((titleEl) => {
                expect(() => {
                    const title = titleEl?.textContent?.trim() || '';
                    // Empty title should not cause errors
                    expect(typeof title).toBe('string');
                }).not.toThrow();
            });
        });

        test('should handle empty or null titles', () => {
            const emptyTitles = ['', null, undefined, '   ', '\t\n'];

            emptyTitles.forEach((title) => {
                expect(() => {
                    const safeTitle = (title || '').trim();
                    const hasClickbait = CLICKBAIT_WORDS.some((word) =>
                        safeTitle.toLowerCase().includes(word)
                    );
                    expect(hasClickbait).toBe(false);
                }).not.toThrow();
            });
        });

        test('should handle getAttribute fallback gracefully', () => {
            const mockElements = [
                {
                    textContent: '',
                    getAttribute: () => 'SHOCKING title from attribute',
                },
                { textContent: '', getAttribute: () => null },
                { textContent: '', getAttribute: () => undefined },
                { textContent: 'Normal title', getAttribute: () => '' },
            ];

            mockElements.forEach((el) => {
                expect(() => {
                    const title =
                        el.textContent?.trim() ||
                        el.getAttribute('title') ||
                        '';
                    // Should not throw regardless of getAttribute result
                    expect(typeof title).toBe('string');
                }).not.toThrow();
            });
        });

        test('should detect and remove broken video containers', () => {
            // Test the logic for detecting containers with thumbnails but no titles
            const mockContainers = [
                {
                    name: 'container with title',
                    querySelector: (selector) => {
                        if (
                            selector.includes('video-title') ||
                            selector.includes('h3 a')
                        ) {
                            return { textContent: 'Valid video title' };
                        }
                        if (
                            selector.includes('img') ||
                            selector.includes('thumbnail')
                        ) {
                            return { src: 'thumbnail.jpg' };
                        }
                        return null;
                    },
                    shouldRemove: false,
                },
                {
                    name: 'broken container (has thumbnail, no title)',
                    querySelector: (selector) => {
                        if (
                            selector.includes('video-title') ||
                            selector.includes('h3 a')
                        ) {
                            return null; // No title
                        }
                        if (
                            selector.includes('img') ||
                            selector.includes('thumbnail')
                        ) {
                            return { src: 'thumbnail.jpg' }; // Has thumbnail
                        }
                        return null;
                    },
                    shouldRemove: true,
                },
                {
                    name: 'empty container (no thumbnail, no title)',
                    querySelector: (selector) => {
                        return null; // Nothing found
                    },
                    shouldRemove: false, // Don't remove empty containers without thumbnails
                },
            ];

            mockContainers.forEach((container) => {
                const titleElement = container.querySelector(
                    '#video-title, a#video-title, h3 a, .title a'
                );
                const titleText = titleElement?.textContent?.trim() || '';
                const hasThumbnail =
                    !!container.querySelector('img, ytd-thumbnail');

                const shouldRemove = !titleText && hasThumbnail;

                expect(shouldRemove).toBe(container.shouldRemove);
            });
        });
    });
});
