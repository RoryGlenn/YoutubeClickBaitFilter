function toggleLogView() {
    console.log('Toggle button clicked');
    const logDiv = document.getElementById('log');
    const logToggle = document.getElementById('logToggle');

    console.log('Log div:', logDiv);
    console.log('Log toggle button:', logToggle);
    console.log('Current classes:', logDiv.className);

    if (logDiv.classList.contains('expanded')) {
        logDiv.classList.remove('expanded');
        logToggle.textContent = '📜 Show Full Log';
        console.log('Collapsed log');
    } else {
        logDiv.classList.add('expanded');
        logToggle.textContent = '📝 Collapse Log';
        console.log('Expanded log');
    }
}

// Show the toggle button when there's log content
function showLogToggle() {
    console.log('Showing log toggle button');
    const toggleBtn = document.getElementById('logToggle');
    toggleBtn.style.display = 'inline-block';
    console.log('Toggle button display:', toggleBtn.style.display);
}

// Make it available globally
window.showLogToggle = showLogToggle;
