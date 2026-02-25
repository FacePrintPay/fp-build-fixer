// Updated dashboard.js

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('Copy successful!');
    } catch (err) {
        console.error('Failed to copy:', err);
        alert('Error copying text to clipboard. Please try again.');
    }
}

document.getElementById('copy-button').addEventListener('click', () => {
    const textToCopy = document.getElementById('text-to-copy').innerText;
    copyToClipboard(textToCopy);
});
