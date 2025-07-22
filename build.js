// build.js
require('esbuild').build({
    entryPoints: ['filter.js'],
    bundle: true,
    minify: true,
    platform: 'browser',
    target: ['es2020'],
    outfile: 'dist/filter.bundle.js',
}).catch(() => process.exit(1));