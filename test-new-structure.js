// Quick test of new filtering logic against real YouTube HTML
import { readFileSync } from 'fs';

console.log('=== Testing New YouTube Structure Detection ===');

// Read the YouTube HTML file
const htmlContent = readFileSync('/Users/roryglenn/Desktop/YoutubeClickBaitFilter/youtube-body-test.html', 'utf8');

// Count occurrences of different structures
const legacyContainers = (htmlContent.match(/ytd-compact-video-renderer/g) || []).length;
const newContainers = (htmlContent.match(/yt-lockup-view-model/g) || []).length;
const newTitleSelectors = (htmlContent.match(/yt-lockup-metadata-view-model-wiz__title/g) || []).length;

console.log('Structure Analysis:');
console.log(`- Legacy containers (ytd-compact-video-renderer): ${legacyContainers}`);
console.log(`- New containers (yt-lockup-view-model): ${newContainers}`);
console.log(`- New title selectors (yt-lockup-metadata-view-model-wiz__title): ${newTitleSelectors}`);

// Test filtering phrases
const testTitles = [
    'Everyone is Quitting Big Tech',
    'The Tech Job Market Divide: WTF is Happening?',
    'Equal Rights, Equal Fights! When Guys Fight Back',
    'Inside The AI Job Shock: CEOs Warn Of Mass'
];

console.log('\nFiltering Test:');
const CLICKBAIT_PHRASES = ['everyone is', 'wtf is', 'shock', 'warn of'];

testTitles.forEach(title => {
    const lowerTitle = title.toLowerCase();
    const shouldFilter = CLICKBAIT_PHRASES.some(phrase => lowerTitle.includes(phrase.toLowerCase()));
    console.log(`"${title}" -> ${shouldFilter ? '🚫 FILTER' : '✅ KEEP'}`);
});

console.log('\n=== Analysis Complete ===');
