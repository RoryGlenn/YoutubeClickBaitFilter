// build.js
import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

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
        await esbuild.build({
            entryPoints: ['filter.js'],
            bundle: true,
            minify: true,
            platform: 'browser',
            target: ['es2020'],
            outfile: 'dist/filter.bundle.js',
        });

        // Copy essential files
        const filesToCopy = [
            'manifest.json',
            'background.js',
            'popup.html',
            'popup.js',
        ];

        filesToCopy.forEach(file => {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, `dist/${file}`);
                console.log(`Copied: ${file}`);
            } else {
                console.warn(`Warning: ${file} not found`);
            }
        });

        // Copy icons directory
        if (fs.existsSync('icons')) {
            if (!fs.existsSync('dist/icons')) {
                fs.mkdirSync('dist/icons');
            }

            const iconFiles = fs.readdirSync('icons');
            iconFiles.forEach(iconFile => {
                fs.copyFileSync(`icons/${iconFile}`, `dist/icons/${iconFile}`);
                console.log(`Copied icon: ${iconFile}`);
            });
        } else {
            console.warn('Warning: icons directory not found');
        }
        
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();