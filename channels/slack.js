// This file contains the logic for sending a message via a Slack Incoming Webhook.

/**
 * Sends the final formatted message to the configured Slack webhook.
 * NOTE: This implementation is currently unreliable due to browser security policies (CORS)
 * interacting with the Slack API. It is kept here for reference and as a starting point
 * for community contributions to find a working solution.
 * 
 * @param {string} baseText - The core message text, already formatted.
 * @param {object|null} locationData - An object with lat, lon, and accuracy, or null.
 */
async function sendMessage(baseText, locationData) {
    if (SLACK_WEBHOOK_URL === "YOUR_SLACK_WEBHOOK_URL_HERE") throw new Error("Slack not configured.");
    
    let text = baseText;

    if (locationData) {
        const { latitude, longitude, accuracy } = locationData;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const locationString = `Lat: ${latitude.toFixed(6)}\nLon: ${longitude.toFixed(6)}\nAcc: ${accuracy.toFixed(0)} meters\n\n<${mapsLink}|Open on Google Maps>`;
        text += `\n\n📍 *Location*\n${locationString}`;
    }

    const payload = { text };
    const body = 'payload=' + JSON.stringify(payload);

    await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body
    });
}