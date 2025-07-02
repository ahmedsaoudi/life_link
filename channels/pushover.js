// This file contains the logic for sending a message via the Pushover service.

/**
 * Sends the final formatted message to the configured Pushover user/group.
 * Pushover's API is browser-friendly and a great fit for LifeLink.
 * @param {string} baseText - The core message text, already formatted.
 * @param {object|null} locationData - An object with lat, lon, and accuracy, or null.
 */
async function sendMessage(baseText, locationData) {
    if (PUSHOVER_USER_KEY === "YOUR_USER_KEY_HERE") throw new Error("Pushover not configured.");

    let message = baseText;
    
    let locationUrl = '';
    if (locationData) {
        const { latitude, longitude, accuracy } = locationData;
        locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `\n\nLat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}\nAccuracy: ${accuracy.toFixed(0)} meters`;
    }

    const body = new FormData();
    body.append('token', PUSHOVER_APP_TOKEN);
    body.append('user', PUSHOVER_USER_KEY);
    body.append('message', message);
    body.append('title', '🆘 LifeLink Alert!');
    body.append('priority', 1); // 1 = High Priority, bypasses quiet hours.
    body.append('sound', 'siren'); // Use a more alerting sound.
    if (locationUrl) {
        body.append('url', locationUrl);
        body.append('url_title', 'View on Google Maps');
    }

    const response = await fetch("https://api.pushover.net/1/messages.json", {
        method: 'POST',
        body: body
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Pushover Error: ${errorData.errors.join(', ')}`);
    }
}