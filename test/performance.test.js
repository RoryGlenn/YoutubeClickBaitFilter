// performance.test.js

/**
 * @fileoverview Performance tests for the YouTube ClickBait Filter extension
 */

import { CLICKBAIT_WORDS, CLICKBAIT_PHRASES } from '../constants.js';

describe('Performance Tests', () => {
    describe('Filtering Algorithm Performance', () => {
        test('should filter large arrays of titles efficiently', () => {
            // Generate test data
            const testTitles = [];
            for (let i = 0; i < 10000; i++) {
                if (i % 5 === 0) {
                    testTitles.push(`SHOCKING discovery ${i}!!!`);
                } else if (i % 7 === 0) {
                    testTitles.push(`You won't believe what happened in video ${i}`);
                } else {
                    testTitles.push(`Regular video tutorial ${i}`);
                }
            }

            const startTime = performance.now();
            
            const filteredTitles = testTitles.filter(title => {
                const lowerTitle = title.toLowerCase();
                
                // Check clickbait words
                const hasClickbaitWord = CLICKBAIT_WORDS.some(word => lowerTitle.includes(word));
                if (hasClickbaitWord) return true;
                
                // Check clickbait phrases
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some(phrase => lowerTitle.includes(phrase));
                if (hasClickbaitPhrase) return true;
                
                // Check uppercase
                const words = title.trim().split(/\s+/);
                let uppercaseCount = 0;
                for (const w of words) {
                    if (/[A-Z]/.test(w) && w === w.toUpperCase()) {
                        uppercaseCount++;
                    }
                }
                if (uppercaseCount >= 3) return true;
                
                // Check punctuation
                const exCount = (title.match(/!/g) || []).length;
                const qmCount = (title.match(/\?/g) || []).length;
                if (exCount >= 3 || qmCount >= 3) return true;
                
                return false;
            });
            
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            
            console.log(`Processed ${testTitles.length} titles in ${processingTime.toFixed(2)}ms`);
            console.log(`Filtered ${filteredTitles.length} clickbait titles`);
            console.log(`Processing rate: ${(testTitles.length / processingTime * 1000).toFixed(0)} titles/second`);
            
            // Performance expectations
            expect(processingTime).toBeLessThan(1000); // Should complete in under 1 second
            expect(filteredTitles.length).toBeGreaterThan(0); // Should find some clickbait
            expect(filteredTitles.length).toBeLessThan(testTitles.length); // Shouldn't filter everything
        });

        test('should perform word matching efficiently with various string lengths', () => {
            const shortTitle = 'SHOCKING news';
            const mediumTitle = 'This SHOCKING discovery will absolutely BLOW your mind and change everything';
            const longTitle = 'This is an extremely long title that contains many words and phrases that we need to test for performance when checking against our SHOCKING clickbait detection system which should work efficiently even with very long strings that contain multiple potential matches';

            const titles = [shortTitle, mediumTitle, longTitle];
            
            titles.forEach(title => {
                const iterations = 1000;
                const startTime = performance.now();
                
                for (let i = 0; i < iterations; i++) {
                    const lowerTitle = title.toLowerCase();
                    CLICKBAIT_WORDS.some(word => lowerTitle.includes(word));
                    CLICKBAIT_PHRASES.some(phrase => lowerTitle.includes(phrase));
                }
                
                const endTime = performance.now();
                const avgTime = (endTime - startTime) / iterations;
                
                console.log(`Average processing time for ${title.length} char title: ${avgTime.toFixed(4)}ms`);
                
                // Should process each title in reasonable time
                expect(avgTime).toBeLessThan(1); // Less than 1ms per title
            });
        });
    });

    describe('DOM Manipulation Performance', () => {
        test('should handle frequent DOM queries efficiently', () => {
            // Mock DOM structure
            const mockElements = Array.from({ length: 100 }, (_, i) => ({
                id: `element-${i}`,
                querySelector: () => ({
                    textContent: i % 3 === 0 ? 'SHOCKING content' : 'Normal content',
                    style: {}
                }),
                style: { display: '' }
            }));

            // Mock document methods
            global.document = {
                querySelectorAll: () => mockElements,
                querySelector: () => null
            };

            const startTime = performance.now();
            
            // Simulate filtering DOM elements
            const hiddenElements = [];
            mockElements.forEach(element => {
                const content = element.querySelector().textContent.toLowerCase();
                const shouldHide = CLICKBAIT_WORDS.some(word => content.includes(word));
                
                if (shouldHide) {
                    element.style.display = 'none';
                    hiddenElements.push(element);
                }
            });
            
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            
            console.log(`Processed ${mockElements.length} DOM elements in ${processingTime.toFixed(2)}ms`);
            console.log(`Hidden ${hiddenElements.length} elements`);
            
            expect(processingTime).toBeLessThan(50); // Should be very fast for DOM operations
            expect(hiddenElements.length).toBeGreaterThan(0);
        });
    });

    describe('Memory Usage', () => {
        test('should not create excessive temporary objects during filtering', () => {
            const initialMemory = process.memoryUsage().heapUsed;
            
            // Process many titles without storing results
            for (let batch = 0; batch < 10; batch++) {
                const titles = Array.from({ length: 1000 }, (_, i) => `Test title ${batch}-${i}`);
                
                titles.forEach(title => {
                    const lowerTitle = title.toLowerCase();
                    CLICKBAIT_WORDS.some(word => lowerTitle.includes(word));
                    CLICKBAIT_PHRASES.some(phrase => lowerTitle.includes(phrase));
                });
            }

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            
            console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
            
            // Memory increase should be reasonable (less than 10MB)
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        });
    });

    describe('Regex Performance', () => {
        test('should compare regex vs string methods for uppercase detection', () => {
            const testTitles = [
                'URGENT BREAKING NEWS UPDATE',
                'This is a Normal Title',
                'SHOCKING REVELATION EXPOSED',
                'Regular content here'
            ];

            const iterations = 1000;

            // Test regex approach
            const regexStartTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                testTitles.forEach(title => {
                    const uppercaseMatches = title.match(/\b[A-Z]{2,}\b/g) || [];
                    uppercaseMatches.length >= 3;
                });
            }
            const regexEndTime = performance.now();
            const regexTime = regexEndTime - regexStartTime;

            // Test string method approach
            const stringStartTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                testTitles.forEach(title => {
                    const words = title.trim().split(/\s+/);
                    let uppercaseCount = 0;
                    for (const w of words) {
                        if (/[A-Z]/.test(w) && w === w.toUpperCase()) {
                            uppercaseCount++;
                        }
                    }
                    uppercaseCount >= 3;
                });
            }
            const stringEndTime = performance.now();
            const stringTime = stringEndTime - stringStartTime;

            console.log(`Regex approach: ${regexTime.toFixed(2)}ms`);
            console.log(`String method approach: ${stringTime.toFixed(2)}ms`);
            console.log(`Performance ratio: ${(regexTime / stringTime).toFixed(2)}x`);

            // Both should complete in reasonable time
            expect(regexTime).toBeLessThan(1000);
            expect(stringTime).toBeLessThan(1000);
        });
    });

    describe('Array Search Optimization', () => {
        test('should measure performance of different search strategies', () => {
            const testTitle = 'this shocking video will blow your mind and change everything forever';
            const iterations = 10000;

            // Test Array.some() approach (current)
            const someStartTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                CLICKBAIT_WORDS.some(word => testTitle.includes(word));
            }
            const someEndTime = performance.now();
            const someTime = someEndTime - someStartTime;

            // Test for...of loop approach
            const forStartTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                let found = false;
                for (const word of CLICKBAIT_WORDS) {
                    if (testTitle.includes(word)) {
                        found = true;
                        break;
                    }
                }
            }
            const forEndTime = performance.now();
            const forTime = forEndTime - forStartTime;

            // Test find() approach
            const findStartTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                CLICKBAIT_WORDS.find(word => testTitle.includes(word)) !== undefined;
            }
            const findEndTime = performance.now();
            const findTime = findEndTime - findStartTime;

            console.log(`Array.some(): ${someTime.toFixed(2)}ms`);
            console.log(`for...of loop: ${forTime.toFixed(2)}ms`);
            console.log(`Array.find(): ${findTime.toFixed(2)}ms`);

            // All approaches should be reasonably fast
            expect(someTime).toBeLessThan(1000);
            expect(forTime).toBeLessThan(1000);
            expect(findTime).toBeLessThan(1000);
        });
    });

    describe('Real-world Simulation', () => {
        test('should handle typical YouTube page load simulation', () => {
            // Simulate a typical YouTube page with various video titles
            const youtubeSimulation = [
                'SHOCKING: What Celebrities Don\'t Want You to Know!!!',
                'JavaScript Tutorial - Learn the Basics',
                'You Won\'t BELIEVE What Happened Next...',
                'URGENT: Scientists Discover CRAZY New Species',
                'How to Cook Perfect Pasta - Easy Recipe',
                'EXPOSED: The Truth About Diet Pills!!!',
                'React vs Vue - Which Should You Choose?',
                'This Video Will BLOW Your Mind!!!',
                'Python Programming for Beginners',
                'BREAKING: Shocking Celebrity Scandal Revealed',
                'CSS Grid Layout Tutorial',
                'You\'ll Never Guess What I Found...',
                'Machine Learning Explained Simply',
                'URGENT WARNING: Don\'t Make This Mistake!!!',
                'Git and GitHub Tutorial for Beginners'
            ];

            const startTime = performance.now();
            
            // Simulate processing each video title as they appear
            const filteredVideos = youtubeSimulation.map(title => {
                const lowerTitle = title.toLowerCase();
                
                // Full filtering logic
                const hasClickbaitWord = CLICKBAIT_WORDS.some(word => lowerTitle.includes(word));
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some(phrase => lowerTitle.includes(phrase));
                
                const words = title.trim().split(/\s+/);
                let uppercaseCount = 0;
                for (const w of words) {
                    if (/[A-Z]/.test(w) && w === w.toUpperCase()) {
                        uppercaseCount++;
                    }
                }
                const hasExcessiveUppercase = uppercaseCount >= 3;
                
                const exCount = (title.match(/!/g) || []).length;
                const qmCount = (title.match(/\?/g) || []).length;
                const hasExcessivePunctuation = exCount >= 3 || qmCount >= 3;
                
                return {
                    title,
                    filtered: hasClickbaitWord || hasClickbaitPhrase || hasExcessiveUppercase || hasExcessivePunctuation
                };
            });
            
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            
            const filteredCount = filteredVideos.filter(v => v.filtered).length;
            const regularCount = filteredVideos.length - filteredCount;
            
            console.log(`Processed ${youtubeSimulation.length} video titles in ${processingTime.toFixed(2)}ms`);
            console.log(`Filtered ${filteredCount} clickbait videos, kept ${regularCount} regular videos`);
            
            expect(processingTime).toBeLessThan(10); // Should be very fast for typical page
            expect(filteredCount).toBeGreaterThan(0); // Should detect clickbait
            expect(regularCount).toBeGreaterThan(0); // Should keep regular content
        });
    });
});
