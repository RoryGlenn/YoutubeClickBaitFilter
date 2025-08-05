// jest.setup.js

/**
 * @fileoverview Jest setup file to configure global test environment
 */

// Setup performance API for Node.js environment
if (typeof performance === 'undefined') {
    global.performance = { now: () => Date.now() };
}

// Mock Chrome APIs globally
global.chrome = {
    storage: {
        sync: {
            get: jest.fn((defaults, callback) => {
                callback(defaults);
            }),
            set: jest.fn((data, callback) => {
                if (callback) callback();
            })
        }
    },
    runtime: {
        sendMessage: jest.fn(),
        onMessage: {
            addListener: jest.fn()
        },
        lastError: null
    },
    tabs: {
        query: jest.fn((query, callback) => {
            callback([{ id: 1 }]);
        }),
        sendMessage: jest.fn()
    },
    action: {
        setBadgeText: jest.fn(),
        setBadgeBackgroundColor: jest.fn()
    }
};

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});
