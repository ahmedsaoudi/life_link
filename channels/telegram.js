// This file contains the logic for sending a message via the Telegram Bot API.

/**
 * Sends the final formatted message to the configured Telegram chat.
 * @param {string} baseText - The core message text, already formatted.
 * @param {object|null} locationData - An object with lat, lon, and accuracy, or null.
 */
async function sendMessage(baseText, locationData) {
    // Check if the credentials have been replaced by the generator.
    if (TELEGRAM_BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN_HERE") throw new Error("Telegram not configured.");
    
    let text = baseText;

    // If location data is available, format it and append it to the message.
    if (locationData) {
        const { latitude, longitude, accuracy } = locationData;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        // Escape the location values to be safely included in MarkdownV2.
        const escapedLatitude = escapeTelegramMarkdown(latitude.toFixed(6));
        const escapedLongitude = escapeTelegramMarkdown(longitude.toFixed(6));
        const escapedAccuracy = escapeTelegramMarkdown(accuracy.toFixed(0));

        // Format the location data using code blocks for a clean look.
        const locationString = 'Lat: `' + escapedLatitude + '`\nLon: `' + escapedLongitude + '`\nAcc: `' + escapedAccuracy + '` meters\n\n[Open on Google Maps](' + mapsLink + ')';
        
        text += `\n\n📍 **Location**\n${locationString}`;
    }
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    // Send the request to the Telegram API.
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            chat_id: TELEGRAM_CHAT_ID, 
            text, 
            parse_mode: 'MarkdownV2' // Specify that we're using MarkdownV2 formatting.
        })
    });
    
    // If the response is not OK, parse the error message from Telegram and throw an error.
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram Error: ${errorData.description}`);
    }
}