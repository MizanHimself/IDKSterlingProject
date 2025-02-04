// Function to create and insert the quote container
function insertQuoteContainer() {
    const container = document.createElement('div');
    container.className = 'quote-container';
    container.innerHTML = `
        <div class="quote-text"></div>
        <div class="quote-author"></div>
    `;
    
    // Insert before the last script tag
    const scripts = document.getElementsByTagName('script');
    const lastScript = scripts[scripts.length - 1];
    lastScript.parentNode.insertBefore(container, lastScript);
}

// Insert the quote container when the DOM is loaded
document.addEventListener('DOMContentLoaded', insertQuoteContainer); 