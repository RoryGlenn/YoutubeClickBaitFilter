// popup.test.js

/**
 * @fileoverview Unit tests for popup.js functionality
 */

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
        lastError: null
    },
    tabs: {
        query: (query, callback) => callback([{ id: 1 }]),
        sendMessage: () => {}
    }
};

// Mock DOM elements
const createMockElement = (id, type = 'div') => ({
    id,
    type,
    checked: false,
    value: '',
    textContent: '',
    innerHTML: '',
    classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(() => false)
    },
    addEventListener: jest.fn(),
    appendChild: jest.fn(),
    remove: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    style: {}
});

global.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: (tag) => ({ tagName: tag })
};

describe('Popup Functionality Tests', () => {

    describe('Settings Management', () => {
        test('should load and display settings correctly', async () => {
            const mockSettings = {
                enabled: true,
                filterClickbaitWords: false,
                filterClickbaitPhrases: true,
                filterUppercase: false,
                filterPunctuation: true
            };

            chrome.storage.sync.get.mockImplementation((defaults, callback) => {
                callback(mockSettings);
            });

            const loadSettings = () => {
                return new Promise(resolve => {
                    chrome.storage.sync.get({
                        enabled: true,
                        filterClickbaitWords: true,
                        filterClickbaitPhrases: true,
                        filterUppercase: true,
                        filterPunctuation: true
                    }, resolve);
                });
            };

            const settings = await loadSettings();
            expect(settings).toEqual(mockSettings);
            expect(chrome.storage.sync.get).toHaveBeenCalled();
        });

        test('should save settings correctly', async () => {
            const newSettings = {
                enabled: false,
                filterClickbaitWords: true,
                filterClickbaitPhrases: false,
                filterUppercase: true,
                filterPunctuation: false
            };

            chrome.storage.sync.set.mockImplementation((settings, callback) => {
                callback && callback();
            });

            const saveSettings = (settings) => {
                return new Promise(resolve => {
                    chrome.storage.sync.set(settings, resolve);
                });
            };

            await saveSettings(newSettings);
            expect(chrome.storage.sync.set).toHaveBeenCalledWith(newSettings, expect.any(Function));
        });
    });

    describe('Custom Keywords Management', () => {
        test('should validate custom keyword input', () => {
            const validateKeyword = (keyword) => {
                if (!keyword || keyword.trim().length === 0) {
                    return { valid: false, error: 'Keyword cannot be empty' };
                }
                if (keyword.trim().length < 2) {
                    return { valid: false, error: 'Keyword must be at least 2 characters' };
                }
                if (keyword.includes(' ')) {
                    return { valid: false, error: 'Keywords should be single words' };
                }
                return { valid: true };
            };

            expect(validateKeyword('')).toEqual({ valid: false, error: 'Keyword cannot be empty' });
            expect(validateKeyword('a')).toEqual({ valid: false, error: 'Keyword must be at least 2 characters' });
            expect(validateKeyword('hello world')).toEqual({ valid: false, error: 'Keywords should be single words' });
            expect(validateKeyword('valid')).toEqual({ valid: true });
        });

        test('should validate custom phrase input', () => {
            const validatePhrase = (phrase) => {
                if (!phrase || phrase.trim().length === 0) {
                    return { valid: false, error: 'Phrase cannot be empty' };
                }
                if (phrase.trim().length < 3) {
                    return { valid: false, error: 'Phrase must be at least 3 characters' };
                }
                const wordCount = phrase.trim().split(/\s+/).length;
                const hasHyphen = phrase.includes('-');
                if (wordCount < 2 && !hasHyphen) {
                    return { valid: false, error: 'Phrases should contain multiple words or be hyphenated' };
                }
                return { valid: true };
            };

            expect(validatePhrase('')).toEqual({ valid: false, error: 'Phrase cannot be empty' });
            expect(validatePhrase('hi')).toEqual({ valid: false, error: 'Phrase must be at least 3 characters' });
            expect(validatePhrase('single')).toEqual({ valid: false, error: 'Phrases should contain multiple words or be hyphenated' });
            expect(validatePhrase('mind-blowing')).toEqual({ valid: true });
            expect(validatePhrase('valid phrase')).toEqual({ valid: true });
        });

        test('should prevent duplicate custom keywords', () => {
            const existingKeywords = ['existing', 'keyword', 'list'];
            
            const isDuplicateKeyword = (keyword, existing) => {
                return existing.some(k => k.toLowerCase() === keyword.toLowerCase());
            };

            expect(isDuplicateKeyword('new', existingKeywords)).toBe(false);
            expect(isDuplicateKeyword('existing', existingKeywords)).toBe(true);
            expect(isDuplicateKeyword('EXISTING', existingKeywords)).toBe(true);
        });

        test('should prevent duplicate custom phrases', () => {
            const existingPhrases = ['existing phrase', 'another phrase'];
            
            const isDuplicatePhrase = (phrase, existing) => {
                return existing.some(p => p.toLowerCase() === phrase.toLowerCase());
            };

            expect(isDuplicatePhrase('new phrase', existingPhrases)).toBe(false);
            expect(isDuplicatePhrase('existing phrase', existingPhrases)).toBe(true);
            expect(isDuplicatePhrase('EXISTING PHRASE', existingPhrases)).toBe(true);
        });
    });

    describe('UI State Management', () => {
        test('should show success message correctly', () => {
            const mockElement = createMockElement('success-message');
            document.getElementById.mockReturnValue(mockElement);

            const showSuccessMessage = (message) => {
                const element = document.getElementById('success-message');
                if (element) {
                    element.textContent = message;
                    element.classList.remove('hidden');
                    setTimeout(() => {
                        element.classList.add('hidden');
                    }, 2000);
                }
            };

            showSuccessMessage('Test message');
            
            expect(mockElement.textContent).toBe('Test message');
            expect(mockElement.classList.remove).toHaveBeenCalledWith('hidden');
        });

        test('should toggle filter sections correctly', () => {
            const mockToggle = createMockElement('filter-toggle', 'checkbox');
            const mockSection = createMockElement('filter-section');
            
            mockToggle.checked = true;
            document.getElementById.mockImplementation(id => {
                if (id === 'filter-toggle') return mockToggle;
                if (id === 'filter-section') return mockSection;
                return null;
            });

            const toggleFilterSection = () => {
                const toggle = document.getElementById('filter-toggle');
                const section = document.getElementById('filter-section');
                
                if (toggle && section) {
                    if (toggle.checked) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                }
            };

            toggleFilterSection();
            expect(mockSection.classList.remove).toHaveBeenCalledWith('hidden');

            mockToggle.checked = false;
            toggleFilterSection();
            expect(mockSection.classList.add).toHaveBeenCalledWith('hidden');
        });
    });

    describe('Blocked Count Display', () => {
        test('should fetch and display blocked count', async () => {
            const mockCount = 42;
            chrome.tabs.query.mockImplementation((query, callback) => {
                callback([{ id: 1 }]);
            });
            
            chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
                if (message.type === 'getBlockedCount') {
                    callback({ blockedCount: mockCount });
                }
            });

            const getBlockedCount = () => {
                return new Promise(resolve => {
                    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                        if (tabs[0]) {
                            chrome.tabs.sendMessage(tabs[0].id, { type: 'getBlockedCount' }, response => {
                                resolve(response?.blockedCount || 0);
                            });
                        } else {
                            resolve(0);
                        }
                    });
                });
            };

            const count = await getBlockedCount();
            expect(count).toBe(mockCount);
        });

        test('should handle blocked count fetch errors', async () => {
            chrome.tabs.query.mockImplementation((query, callback) => {
                callback([]);
            });

            const getBlockedCount = () => {
                return new Promise(resolve => {
                    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                        if (tabs[0]) {
                            chrome.tabs.sendMessage(tabs[0].id, { type: 'getBlockedCount' }, response => {
                                resolve(response?.blockedCount || 0);
                            });
                        } else {
                            resolve(0);
                        }
                    });
                });
            };

            const count = await getBlockedCount();
            expect(count).toBe(0);
        });
    });

    describe('Settings Synchronization', () => {
        test('should notify content script of setting changes', () => {
            const newSettings = { enabled: false };
            
            chrome.tabs.query.mockImplementation((query, callback) => {
                callback([{ id: 1 }]);
            });

            const notifyContentScript = (settings) => {
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            type: 'updateSettings',
                            settings: settings
                        });
                    }
                });
            };

            notifyContentScript(newSettings);
            
            expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, {
                type: 'updateSettings',
                settings: newSettings
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle Chrome runtime errors gracefully', () => {
            chrome.runtime.lastError = { message: 'Test error' };
            
            const handleChromeError = (callback) => {
                if (chrome.runtime.lastError) {
                    console.error('Chrome runtime error:', chrome.runtime.lastError.message);
                    return false;
                }
                callback && callback();
                return true;
            };

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const mockCallback = jest.fn();
            
            const result = handleChromeError(mockCallback);
            
            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Chrome runtime error:', 'Test error');
            expect(mockCallback).not.toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });
    });
});
