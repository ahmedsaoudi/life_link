// This file contains all the JavaScript logic for the LifeLink Generator page.

const state = {
    service: null, // 'TELEGRAM', 'PUSHOVER', 'NTFY', etc.
    templates: {},
};

// --- DOM ELEMENT REFERENCES ---
const steps = { 1: document.getElementById('step1'), 2: document.getElementById('step2'), 3: document.getElementById('step3') };
const serviceButtons = {
    telegram: document.getElementById('selectTelegram'),
    pushover: document.getElementById('selectPushover'),
    ntfy: document.getElementById('selectNtfy'),
    discord: document.getElementById('selectDiscord'),
    slack: document.getElementById('selectSlack'),
};
const configSections = {
    telegram: document.getElementById('telegramConfig'),
    pushover: document.getElementById('pushoverConfig'),
    ntfy: document.getElementById('ntfyConfig'),
};
const inputs = {
    telegramToken: document.getElementById('telegramToken'),
    telegramChatId: document.getElementById('telegramChatId'),
    pushoverUserKey: document.getElementById('pushoverUserKey'),
    pushoverAppToken: document.getElementById('pushoverAppToken'),
    ntfyTopicUrl: document.getElementById('ntfyTopicUrl'),
};
const actionButtons = {
    backToStep1: document.getElementById('backToStep1'),
    generate: document.getElementById('generateButton'),
    copy: document.getElementById('copyButton'),
    download: document.getElementById('downloadButton'),
    startOver: document.getElementById('startOver'),
};
const displayElements = {
    output: document.getElementById('outputHtml'),
    error: document.getElementById('configError'),
    copyStatus: document.getElementById('copyStatus'),
};

// --- EVENT LISTENERS ---
window.addEventListener('DOMContentLoaded', fetchTemplates);
serviceButtons.telegram.addEventListener('click', () => selectService('TELEGRAM'));
serviceButtons.pushover.addEventListener('click', () => selectService('PUSHOVER'));
serviceButtons.ntfy.addEventListener('click', () => selectService('NTFY'));

actionButtons.backToStep1.addEventListener('click', () => showStep(1));
actionButtons.generate.addEventListener('click', generateApp);
actionButtons.copy.addEventListener('click', copyToClipboard);
actionButtons.download.addEventListener('click', downloadFile);
actionButtons.startOver.addEventListener('click', resetApp);

// --- LOGIC ---
async function fetchTemplates() {
    try {
        const cacheBuster = '?v=' + new Date().getTime();
        // Fetch core templates
        const [base, common] = await Promise.all([
            fetch('./templates/base.html' + cacheBuster).then(res => res.text()),
            fetch('./templates/common.js' + cacheBuster).then(res => res.text()),
        ]);
        // Fetch channel-specific modules
        const [telegram, slack, pushover, ntfy, discord] = await Promise.all([
            fetch('./channels/telegram.js' + cacheBuster).then(res => res.text()),
            fetch('./channels/slack.js' + cacheBuster).then(res => res.text()),
            fetch('./channels/pushover.js' + cacheBuster).then(res => res.text()),
            fetch('./channels/ntfy.js' + cacheBuster).then(res => res.text()),
            fetch('./channels/discord.js' + cacheBuster).then(res => res.text()),
        ]);
        state.templates = { base, common, telegram, slack, pushover, ntfy, discord };
    } catch (error) { 
        console.error("Failed to load templates:", error); 
        alert("Fatal Error: Could not load required project files. Please check the console for details."); 
    }
}

function showStep(stepNumber) {
    Object.values(steps).forEach(s => s.classList.remove('active'));
    if(steps[stepNumber]) steps[stepNumber].classList.add('active');
}

function selectService(service) {
    state.service = service;
    Object.keys(serviceButtons).forEach(key => {
        if (serviceButtons[key].disabled) return;
        serviceButtons[key].classList.toggle('selected', key.toUpperCase() === service);
    });
    Object.keys(configSections).forEach(key => {
        configSections[key].style.display = key.toUpperCase() === service ? 'block' : 'none';
    });
    showStep(2);
}

function resetApp() {
    state.service = null;
    Object.values(inputs).forEach(input => { if (input) input.value = ''; });
    displayElements.output.value = '';
    displayElements.error.textContent = '';
    displayElements.copyStatus.textContent = '';
    Object.values(serviceButtons).forEach(button => button.classList.remove('selected'));
    showStep(1);
}

/**
 * THIS IS THE FULLY CORRECTED GENERATION FUNCTION
 */
function generateApp() {
    displayElements.error.textContent = '';
    if (!state.service) { 
        displayElements.error.textContent = 'Please select a service first.'; 
        return; 
    }

    let configBlock = '';
    let senderBlock = '';

    // Build the configuration block based on the selected service.
    // This logic is now cleaner and ensures correct syntax.
    if (state.service === 'TELEGRAM') {
        const token = inputs.telegramToken.value.trim();
        const chatId = inputs.telegramChatId.value.trim();
        if (!token || !chatId) { 
            displayElements.error.textContent = 'Please fill in both Telegram fields.'; 
            return; 
        }
        // CORRECTED: Explicitly build the string to avoid errors.
        configBlock = `const TELEGRAM_BOT_TOKEN = "${token}";\nconst TELEGRAM_CHAT_ID = "${chatId}";`;
        senderBlock = state.templates.telegram;

    } else if (state.service === 'PUSHOVER') {
        const userKey = inputs.pushoverUserKey.value.trim();
        const appToken = inputs.pushoverAppToken.value.trim();
        if (!userKey || !appToken) { 
            displayElements.error.textContent = 'Please fill in both Pushover fields.'; 
            return; 
        }
        configBlock = `const PUSHOVER_USER_KEY = "${userKey}";\nconst PUSHOVER_APP_TOKEN = "${appToken}";`;
        senderBlock = state.templates.pushover;

    } else if (state.service === 'NTFY') {
        const topicUrl = inputs.ntfyTopicUrl.value.trim();
        if (!topicUrl) { 
            displayElements.error.textContent = 'Please fill in the ntfy.sh Topic URL.'; 
            return; 
        }
        configBlock = `const NTFY_TOPIC_URL = "${topicUrl}";`;
        senderBlock = state.templates.ntfy;
    }

    // CORRECTED: Assemble the full script content first.
    const fullScriptContent = `
        ${configBlock}
        ${state.templates.common}
        ${senderBlock}
    `;

    // CORRECTED: Replace all three placeholders at once in a robust way.
    let finalHtml = state.templates.base
        .replace('//__CONFIG_BLOCK__', '') // Clear the old placeholders
        .replace('//__COMMON_BLOCK__', '')
        .replace('//__SENDER_BLOCK__', fullScriptContent); // Inject the full script
    
    displayElements.output.value = finalHtml;
    showStep(3);
}

function copyToClipboard() {
    const textToCopy = displayElements.output.value;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
        displayElements.copyStatus.textContent = 'Copied to clipboard!';
        setTimeout(() => { displayElements.copyStatus.textContent = ''; }, 3000);
    }).catch(err => {
        displayElements.copyStatus.textContent = 'Failed to copy.';
    });
}

function downloadFile() {
     const textToDownload = displayElements.output.value;
     if (!textToDownload) return;
     const blob = new Blob([textToDownload], { type: 'text/html' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'lifelink.html';
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
}