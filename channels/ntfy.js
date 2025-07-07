// This file contains the logic for sending a message to a ntfy.sh topic.

/**
 * Sends the final formatted message to the configured ntfy.sh topic.
 * This service has excellent CORS support and is ideal for this use case.
 * @param {string} baseText - The core message text, already formatted.
 * @param {object|null} locationData - An object with lat, lon, and accuracy, or null.
 */
async function sendMessage(baseText, locationData) {
    if (NTFY_TOPIC_URL === "YOUR_NTFY_TOPIC_URL_HERE") throw new Error("ntfy.sh not configured.");

    let topicUrl = NTFY_TOPIC_URL;
    if (!topicUrl.startsWith('http://') && !topicUrl.startsWith('https://')) {
        topicUrl = 'https://' + topicUrl;
    }

    let message = baseText;
    let actions = [];

    if (locationData) {
        const { latitude, longitude, accuracy } = locationData;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `\n\nLat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}\nAccuracy: ${accuracy.toFixed(0)} meters`;
        
        actions.push({
            action: 'view',
            label: 'Open on Google Maps',
            url: mapsLink,
            clear: false
        });
    }

    const headers = {
        'Title': 'LifeLink Alert!',
        'Priority': 'urgent',
        'Tags': 'rotating_light,sos',
        ...(actions.length > 0 && { 'Actions': JSON.stringify(actions) })
    };

    const response = await fetch(topicUrl, {
        method: 'POST',
        body: message,
        headers: headers
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ntfy.sh Error: ${errorText}`);
    }
}