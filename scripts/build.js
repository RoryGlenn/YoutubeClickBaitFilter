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
            entryPoints: ['src/content/filter.js'],
            bundle: true,
            minify: true,
            platform: 'browser',
            target: ['es2020'],
            outfile: 'dist/filter.bundle.js',
        });

        // Copy and fix manifest.json
        if (fs.existsSync('src/manifest.json')) {
            const manifestContent = fs.readFileSync(
                'src/manifest.json',
                'utf8'
            );
            const manifest = JSON.parse(manifestContent);

            // Fix paths for the dist folder
            if (manifest.background && manifest.background.service_worker) {
                manifest.background.service_worker = 'background.js';
            }
            if (manifest.content_scripts) {
                manifest.content_scripts.forEach((script) => {
                    if (script.js) {
                        script.js = script.js.map((jsFile) =>
                            jsFile.replace('dist/', '')
                        );
                    }
                });
            }

            fs.writeFileSync(
                'dist/manifest.json',
                JSON.stringify(manifest, null, 2)
            );
            console.log('Copied and fixed: manifest.json');
        } else {
            console.warn('Warning: src/manifest.json not found');
        }

        // Copy other essential files
        const filesToCopy = [
            'src/background/background.js',
            'src/popup/popup.html',
            'src/popup/popup.js',
            'src/popup/popup.css',
        ];

        filesToCopy.forEach((file) => {
            if (fs.existsSync(file)) {
                const fileName = path.basename(file);
                fs.copyFileSync(file, `dist/${fileName}`);
                console.log(`Copied: ${fileName}`);
            } else {
                console.warn(`Warning: ${file} not found`);
            }
        });

        // Copy icons directory
        if (fs.existsSync('assets/icons')) {
            if (!fs.existsSync('dist/icons')) {
                fs.mkdirSync('dist/icons');
            }

            const iconFiles = fs.readdirSync('assets/icons');
            iconFiles.forEach((iconFile) => {
                const sourcePath = `assets/icons/${iconFile}`;
                const destPath = `dist/icons/${iconFile}`;

                if (fs.statSync(sourcePath).isDirectory()) {
                    // Handle subdirectories (like grey folder)
                    if (!fs.existsSync(destPath)) {
                        fs.mkdirSync(destPath);
                    }

                    const subFiles = fs.readdirSync(sourcePath);
                    subFiles.forEach((subFile) => {
                        fs.copyFileSync(
                            `${sourcePath}/${subFile}`,
                            `${destPath}/${subFile}`
                        );
                        console.log(`Copied icon: ${iconFile}/${subFile}`);
                    });
                } else {
                    // Handle regular files
                    fs.copyFileSync(sourcePath, destPath);
                    console.log(`Copied icon: ${iconFile}`);
                }
            });
        } else {
            console.warn('Warning: assets/icons directory not found');
        }

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
