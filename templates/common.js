// This file contains all the shared JavaScript logic for the final LifeLink app,
// such as form handling, UI updates, and geolocation. It is service-agnostic.

// --- DOM ELEMENT REFERENCES ---
const messageForm = document.getElementById('messageForm');
const sendButton = document.getElementById('sendButton');
const messageTextarea = document.getElementById('message');
const includeLocationCheckbox = document.getElementById('includeLocation');
const statusMessage = document.getElementById('statusMessage');

// --- EVENT LISTENERS ---
messageForm.addEventListener('submit', handleFormSubmit);

/**
 * Escapes characters that have special meaning in Telegram's MarkdownV2 format.
 * This prevents user input from breaking the message formatting.
 * @param {string} text The text to escape.
 * @returns {string} The escaped text.
 */
function escapeTelegramMarkdown(text) {
    if (typeof text !== 'string') return text;
    // This regex matches any character that needs to be escaped in MarkdownV2.
    return text.replace(/([_*[\]()~`>#+\-={}.!])/g, '\\$1');
}

/**
 * Main handler for the form submission.
 * @param {Event} e The form submission event.
 */
async function handleFormSubmit(e) {
    e.preventDefault(); // Prevent the default form submission which reloads the page.
    const originalMessage = messageTextarea.value.trim();

    if (!originalMessage) {
        showStatus('Please enter a message.', 'error');
        return;
    }

    setLoadingState(true);
    showStatus('Sending...', 'info');

    // The base message format. We escape the user's message to ensure it's displayed correctly.
    const escapedMessage = escapeTelegramMarkdown(originalMessage);
    let messageToSend = `🆘 LifeLink Alert 🆘\n\n${escapedMessage}`;
    
    let locationDataForMessage = null;

    try {
        // If the location checkbox is checked, try to get the user's location.
        if (includeLocationCheckbox.checked) {
            showStatus('Getting location...', 'info');
            try {
                locationDataForMessage = await getUserLocation();
            } catch (locationError) {
                // If getting location fails, append an error message to the main alert.
                const escapedError = escapeTelegramMarkdown(locationError.message);
                messageToSend += `\n\n(User tried to send location, but it failed: ${escapedError})`;
                showStatus('Location failed. Sending message without it.', 'warning');
            }
        }
        
        // Call the globally available sendMessage function (defined in a channel-specific file).
        await sendMessage(messageToSend, locationDataForMessage);
        
        showStatus('Alert sent successfully!', 'success');
        messageTextarea.value = ''; // Clear the textarea on success.

    } catch (error) {
        console.error('Failed to send message:', error);
        showStatus(`Error: Could not send alert.`, 'error');
    } finally {
        // Always reset the button state, whether the send succeeded or failed.
        setLoadingState(false);
    }
}

/**
 * Uses the browser's Geolocation API to get the user's current position.
 * @returns {Promise<object>} A promise that resolves with an object containing latitude, longitude, and accuracy.
 */
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
            return reject(new Error('Geolocation not supported.'));
        }

        // Request the current position with high accuracy.
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                resolve({ latitude, longitude, accuracy });
            },
            (error) => {
                // Translate the error code into a user-friendly message.
                let msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED: msg = 'Permission denied.'; break;
                    case error.POSITION_UNAVAILABLE: msg = 'Position unavailable.'; break;
                    case error.TIMEOUT: msg = 'Request timed out.'; break;
                    default: msg = 'Unknown error.'; break;
                }
                reject(new Error(msg));
            },
            // Options for the location request.
            { 
                enableHighAccuracy: true, // Request the most accurate position possible.
                timeout: 10000,           // 10 seconds before timing out.
                maximumAge: 0             // Don't use a cached position.
            }
        );
    });
}

/**
 * Toggles the UI into a loading state (e.g., disables the send button).
 * @param {boolean} isLoading - Whether the UI should be in a loading state.
 */
function setLoadingState(isLoading) {
    sendButton.disabled = isLoading;
    sendButton.textContent = isLoading ? 'Sending...' : 'Send Alert';
}

/**
 * Displays a status message to the user and styles it based on the message type.
 * @param {string} message - The message to display.
 * @param {'info' | 'success' | 'warning' | 'error'} type - The type of message.
 */
function showStatus(message, type) {
    statusMessage.textContent = message;
    let color;
    switch (type) {
        case 'success': color = 'var(--success-color)'; break;
        case 'warning': color = 'var(--warning-color)'; break;
        case 'error':   color = 'var(--danger-color)'; break;
        case 'info':
        default:        color = 'var(--accent-color)'; break;
    }
    statusMessage.style.color = color;
}