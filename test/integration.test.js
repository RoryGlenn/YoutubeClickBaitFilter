// integration.test.js

/**
 * @fileoverview Integration tests for the YouTube ClickBait Filter extension
 */

import { CLICKBAIT_WORDS, CLICKBAIT_PHRASES } from '../constants.js';

// Mock Chrome APIs
global.chrome = {
    storage: {
        sync: {
            get: (defaults, callback) => callback(defaults),
            set: (data, callback) => callback && callback()
        }
    },
    runtime: {
        sendMessage: () => {},
        onMessage: { addListener: () => {} },
        lastError: null
    },
    tabs: {
        query: (query, callback) => callback([{ id: 1 }]),
        sendMessage: () => {}
    }
};

describe('Integration Tests', () => {

    describe('End-to-End Filtering Workflow', () => {
        test('should filter videos with clickbait titles from constants', () => {
            const testVideos = [
                { title: 'This SHOCKING discovery will change everything!', shouldBeFiltered: true },
                { title: 'You won\'t believe what happened next', shouldBeFiltered: true },
                { title: 'Learn JavaScript - Complete Tutorial', shouldBeFiltered: false },
                { title: 'URGENT: Scientists hate this one trick', shouldBeFiltered: true },
                { title: 'How to bake a cake - step by step', shouldBeFiltered: false }
            ];

            testVideos.forEach(video => {
                const title = video.title.toLowerCase();
                
                // Test against CLICKBAIT_WORDS
                const hasClickbaitWord = CLICKBAIT_WORDS.some(word => title.includes(word));
                
                // Test against CLICKBAIT_PHRASES  
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some(phrase => title.includes(phrase));
                
                // Test uppercase detection
                const words = video.title.trim().split(/\s+/);
                let uppercaseCount = 0;
                for (const w of words) {
                    if (/[A-Z]/.test(w) && w === w.toUpperCase()) {
                        uppercaseCount++;
                    }
                }
                const hasExcessiveUppercase = uppercaseCount >= 3;
                
                // Test punctuation detection
                const exCount = (video.title.match(/!/g) || []).length;
                const qmCount = (video.title.match(/\?/g) || []).length;
                const hasExcessivePunctuation = exCount >= 3 || qmCount >= 3;
                
                const shouldFilter = hasClickbaitWord || hasClickbaitPhrase || hasExcessiveUppercase || hasExcessivePunctuation;
                
                expect(shouldFilter).toBe(video.shouldBeFiltered);
            });
        });

        test('should handle custom keywords integration', async () => {
            const customKeywords = ['scam', 'viral', 'exposed'];
            const customPhrases = ['doctors hate this', 'one weird trick'];
            
            // Mock storage to return custom keywords
            global.chrome.storage.sync.get = (defaults, callback) => {
                callback({
                    ...defaults,
                    customKeywords,
                    customPhrases
                });
            };

            const testTitles = [
                'This viral video is trending',
                'Doctors hate this simple method',
                'Regular cooking tutorial',
                'EXPOSED: The truth about diets'
            ];

            testTitles.forEach(title => {
                const lowerTitle = title.toLowerCase();
                
                // Check built-in detection
                const hasBuiltInWord = CLICKBAIT_WORDS.some(word => lowerTitle.includes(word));
                const hasBuiltInPhrase = CLICKBAIT_PHRASES.some(phrase => lowerTitle.includes(phrase));
                
                // Check custom detection
                const hasCustomWord = customKeywords.some(word => lowerTitle.includes(word));
                const hasCustomPhrase = customPhrases.some(phrase => lowerTitle.includes(phrase));
                
                const shouldFilter = hasBuiltInWord || hasBuiltInPhrase || hasCustomWord || hasCustomPhrase;
                
                // Verify expected results
                if (title.includes('viral') || title.includes('EXPOSED')) {
                    expect(shouldFilter).toBe(true);
                } else if (title.includes('Doctors hate this')) {
                    expect(shouldFilter).toBe(true);
                } else if (title.includes('Regular cooking')) {
                    expect(shouldFilter).toBe(false);
                }
            });
        });
    });

    describe('Settings Persistence Integration', () => {
        test('should save and load complete settings configuration', async () => {
            const testSettings = {
                enabled: true,
                filterClickbaitWords: false,
                filterClickbaitPhrases: true,
                filterUppercase: false,
                filterPunctuation: true,
                customKeywords: ['test', 'keyword'],
                customPhrases: ['test phrase', 'another phrase']
            };

            // Mock successful save
            global.chrome.storage.sync.set = (settings, callback) => {
                callback && callback();
            };

            // Mock successful load
            global.chrome.storage.sync.get = (defaults, callback) => {
                callback(testSettings);
            };

            // Simulate save operation
            const saveSettings = (settings) => {
                return new Promise(resolve => {
                    global.chrome.storage.sync.set(settings, resolve);
                });
            };

            // Simulate load operation
            const loadSettings = (defaults) => {
                return new Promise(resolve => {
                    global.chrome.storage.sync.get(defaults, resolve);
                });
            };

            await saveSettings(testSettings);
            const loadedSettings = await loadSettings({});

            expect(loadedSettings).toEqual(testSettings);
        });
    });

    describe('Content Script Communication Integration', () => {
        test('should handle bidirectional communication between popup and content script', async () => {
            const mockTabId = 123;
            const mockBlockedCount = 15;

            // Mock tab query
            global.chrome.tabs.query = (query, callback) => {
                callback([{ id: mockTabId }]);
            };

            // Mock content script response
            global.chrome.tabs.sendMessage = (tabId, message, callback) => {
                if (message.type === 'getBlockedCount') {
                    callback({ blockedCount: mockBlockedCount });
                } else if (message.type === 'updateSettings') {
                    callback({ ok: true });
                }
            };

            // Test getting blocked count
            const getBlockedCount = () => {
                return new Promise(resolve => {
                    global.chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                        if (tabs[0]) {
                            global.chrome.tabs.sendMessage(tabs[0].id, { type: 'getBlockedCount' }, response => {
                                resolve(response?.blockedCount || 0);
                            });
                        }
                    });
                });
            };

            // Test updating settings
            const updateContentScriptSettings = (settings) => {
                return new Promise(resolve => {
                    global.chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                        if (tabs[0]) {
                            global.chrome.tabs.sendMessage(tabs[0].id, {
                                type: 'updateSettings',
                                settings
                            }, response => {
                                resolve(response);
                            });
                        }
                    });
                });
            };

            const count = await getBlockedCount();
            expect(count).toBe(mockBlockedCount);

            const updateResponse = await updateContentScriptSettings({ enabled: false });
            expect(updateResponse).toEqual({ ok: true });
        });
    });

    describe('Filter Rule Combinations', () => {
        test('should handle multiple filter types simultaneously', () => {
            const testCases = [
                {
                    title: 'SHOCKING!!! You won\'t believe this EXPLOSIVE TERRIFYING trick!!!',
                    expected: {
                        clickbaitWord: true,      // 'shocking', 'explosive', 'terrifying'
                        clickbaitPhrase: true,    // 'you won\'t believe'
                        upperCase: true,          // SHOCKING, EXPLOSIVE, TERRIFYING (3 uppercase words)
                        punctuation: true         // Multiple !!!
                    }
                },
                {
                    title: 'Simple cooking recipe tutorial',
                    expected: {
                        clickbaitWord: false,
                        clickbaitPhrase: false, 
                        upperCase: false,
                        punctuation: false
                    }
                },
                {
                    title: 'URGENT WARNING MESSAGE',
                    expected: {
                        clickbaitWord: true,      // 'urgent', 'warning'
                        clickbaitPhrase: false,
                        upperCase: true,          // 3 words, all caps = 3 >= 3
                        punctuation: false
                    }
                }
            ];

            testCases.forEach(({ title, expected }) => {
                const lowerTitle = title.toLowerCase();
                
                // Test clickbait words
                const hasClickbaitWord = CLICKBAIT_WORDS.some(word => lowerTitle.includes(word));
                expect(hasClickbaitWord).toBe(expected.clickbaitWord);
                
                // Test clickbait phrases
                const hasClickbaitPhrase = CLICKBAIT_PHRASES.some(phrase => lowerTitle.includes(phrase));
                expect(hasClickbaitPhrase).toBe(expected.clickbaitPhrase);
                
                // Test uppercase
                const words = title.trim().split(/\s+/);
                let uppercaseCount = 0;
                for (const w of words) {
                    if (/[A-Z]/.test(w) && w === w.toUpperCase()) {
                        uppercaseCount++;
                    }
                }
                const hasExcessiveUppercase = uppercaseCount >= 3;
                expect(hasExcessiveUppercase).toBe(expected.upperCase);
                
                // Test punctuation
                const exCount = (title.match(/!/g) || []).length;
                const qmCount = (title.match(/\?/g) || []).length;
                const hasExcessivePunctuation = exCount >= 3 || qmCount >= 3;
                expect(hasExcessivePunctuation).toBe(expected.punctuation);
            });
        });
    });

    describe('Performance Integration', () => {
        test('should handle large numbers of DOM elements efficiently', () => {
            const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
                title: i % 10 === 0 ? `SHOCKING video ${i}` : `Normal video ${i}`,
                shouldFilter: i % 10 === 0
            }));

            const startTime = performance.now();
            
            const results = largeDataSet.map(item => {
                const lowerTitle = item.title.toLowerCase();
                return CLICKBAIT_WORDS.some(word => lowerTitle.includes(word));
            });
            
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            
            // Should process 1000 items in reasonable time (< 100ms)
            expect(processingTime).toBeLessThan(100);
            
            // Verify correct filtering
            const filteredCount = results.filter(Boolean).length;
            expect(filteredCount).toBe(100); // Every 10th item should be filtered
        });
    });

    describe('Error Recovery Integration', () => {
        test('should gracefully handle storage failures throughout the system', async () => {
            // Mock storage failure
            const originalGet = global.chrome.storage.sync.get;
            global.chrome.storage.sync.get = () => {
                throw new Error('Storage unavailable');
            };

            const loadSettingsWithFallback = (defaults) => {
                return new Promise(resolve => {
                    try {
                        global.chrome.storage.sync.get(defaults, resolve);
                    } catch (error) {
                        console.warn('Storage failed, using defaults:', error.message);
                        resolve(defaults);
                    }
                });
            };

            const defaultSettings = { enabled: true, filterClickbaitWords: true };
            
            const settings = await loadSettingsWithFallback(defaultSettings);
            
            expect(settings).toEqual(defaultSettings);

            // Restore original function
            global.chrome.storage.sync.get = originalGet;
        });
    });
});
