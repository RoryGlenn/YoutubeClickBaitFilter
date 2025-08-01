// build.js
const fs = require('fs');
const path = require('path');

/**
 * Builds the Chrome extension by bundling the content script and copying necessary files.
 * Creates the dist directory, bundles filter.js with esbuild, and copies background.js.
 * 
 * @async
 * @function build
 * @returns {Promise<void>} Resolves when build completes successfully
 * @throws {Error} Exits process with code 1 if build fails
 */
async function build() {
    try {
        // Ensure dist directory exists
        if (!fs.existsSync('dist')) {
            fs.mkdirSync('dist');
        }

        // Bundle the content script
        await require('esbuild').build({
            entryPoints: ['filter.js'],
            bundle: true,
            minify: true,
            platform: 'browser',
            target: ['es2020'],
            outfile: 'dist/filter.bundle.js',
        });

        // Copy background.js to dist (doesn't need bundling)
        fs.copyFileSync('background.js', 'dist/background.js');
        
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();