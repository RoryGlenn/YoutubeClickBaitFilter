// build.js
const fs = require('fs');
const path = require('path');

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