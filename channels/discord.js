// This file contains the logic for sending a message via a Discord webhook.

/**
 * Sends the final formatted message to the configured Discord webhook.
 * NOTE: This is a placeholder for future implementation. Like Slack, Discord's
 * webhooks have strict CORS policies, and direct calls from a browser are
 * likely to fail silently with the 'no-cors' workaround. This template exists
 * to make it easier for a contributor to solve this issue.
 * 
 * @param {string} baseText - The core message text, already formatted.
 * @param {object|null} locationData - An object with lat, lon, and accuracy, or null.
 */
async function sendMessage(baseText, locationData) {
    if (DISCORD_WEBHOOK_URL === "YOUR_DISCORD_WEBHOOK_URL_HERE") throw new Error("Discord not configured.");

    let content = baseText;

    if (locationData) {
        const { latitude, longitude } = locationData;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        content += `\n\n**Location:**\n${mapsLink}`;
    }

    // This fetch call will likely have the same issues as the Slack one.
    // It is here as a starting point for a developer to debug and fix.
    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: content,
            username: "LifeLink Alert"
        })
    });
}