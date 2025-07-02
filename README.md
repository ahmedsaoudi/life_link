# LifeLink

*A simple, private, no-install emergency alert web app.*

LifeLink is a self-contained, single-file web application designed to be the simplest, fastest way for a loved one to send an emergency alert. It solves the problem of needing a quick alert system without forcing the user to install an app, create an account, or learn a complex interface.

---

### 🚨 Important Disclaimer: Not a Replacement for Emergency Services

This application is provided as a best-effort, supplemental tool. It is **NOT** a reliable or official channel for emergency communication and **CANNOT** contact emergency services (e.g., 911, 112, 999).

**ALWAYS prioritize calling official emergency services first if you are able.**

The author and contributors of this project provide this software "as is" and assume no liability for its use or failure to function in any situation. Use it at your own risk.

---

### The Philosophy: Speed and Simplicity in a Crisis

LifeLink was designed to answer one question: What is the most reliable way to send an alert when everything else has failed?

#### The "Lost Phone" Problem
Modern communication apps are secured with two-step authentication. If you lose your phone, you can't log into your accounts on a stranger's device to ask for help, because you can't receive the verification code. LifeLink bypasses this, as it's just a secret website link accessible from any browser.

#### What About Calling or SMS?
If you can call or text, you should! But LifeLink is the backup for when you can't, such as when a borrowed phone has Wi-Fi but no cellular credit.

#### Designed for the Worst-Case Scenario
*   **No Logins:** No passwords to remember in a moment of panic.
*   **Extremely Lightweight:** At only ~8.5 KB, the app loads almost instantly, even on an extremely slow or unstable internet connection.

---

### Security Trade-off: A Conscious Choice

The core design of LifeLink embeds your notification credentials directly into the final `.html` file. This is an intentional security trade-off. It allows the app to be a single, maintenance-free file, but it means anyone with the URL can see the credentials. Mitigate this risk by using a dedicated, single-purpose bot or webhook that can be easily revoked.

---

## Guide for the "Deployer" (You)

As the Deployer, your role is to set up the notification service and generate the final `lifelink.html` file.

#### Step 1: Set Up Your Notification Service

Choose **one** of the recommended, fully supported services.

**Recommended Services:**
*   **Telegram:** Reliable messages sent via a Telegram bot.
*   **Pushover:** High-priority push notifications with custom sounds.
*   **ntfy.sh:** Simple, free, topic-based push notifications.

**Setup Instructions:**
*   **Telegram:** 1. Get a **Bot Token** from `@BotFather`. 2. Get your **Chat ID** from `@userinfobot`.
*   **Pushover:** 1. Get your **User Key** from your [Pushover dashboard](https://pushover.net/). 2. Create a new Application to get an **API Token**.
*   **ntfy.sh:** 1. Invent a secret topic name (e.g., `lifelink-alerts-for-jane-a1b2c3`). 2. Your URL is `https://ntfy.sh/your-secret-topic-name`. 3. Subscribe to this topic in the ntfy app.

---
**Coming Soon / Experimental Services:**

> **Note:** The following services are not yet functional. They have known issues with browser security policies (`CORS`) that prevent them from working reliably. Contributions to fix them are welcome!

*   **Discord**
*   **Slack**

#### Step 2: Generate Your App File
1.  Download the project files.
2.  Run a simple local web server in the project folder (e.g., `python -m http.server`).
3.  Open your browser and go to `http://localhost:8000/lifelink_gen.html`.
4.  Select a service, enter your credentials, and click "Generate App File".
5.  Download the generated `lifelink.html` file.

#### Step 3: Deploy and Share
1.  Host your `lifelink.html` file. The easiest method is [Netlify Drop](https://app.netlify.com/drop).
2.  Drag and drop your file to get a unique, public URL.
3.  **Test the URL yourself** before sharing it.

---

## Guide for the "User" (Your Loved One)

Your role is simple: save the link and know how to use it.

#### Step 1: Save the Link
The person who set this up for you will send you a secret web link. You must save this link so you can access it quickly.
*   **Bookmark it** in your phone's web browser.
*   **Add it to your phone's Home Screen.** Both iOS and Android allow you to save a website shortcut to your home screen, making it look and feel just like a regular app.

#### Step 2: How to Use in an Emergency
1.  Open the link you saved.
2.  Type a short message describing your situation.
3.  For best results, check the "Append my current location" box. Your browser will ask for permission; please **Allow** it.
4.  Tap the big "Send Alert" button.

---

## For Developers

The project is structured to make adding new notification channels easy.

#### File Structure


├── lifelink_gen.html # The generator UI (HTML only)
├── README.md # This file.
├── assets/ # Assets for the generator app
│ ├── css/
│ │ └── gen_style.css
│ └── js/
│ └── gen_script.js
├── templates/ # Core templates for the final app
│ ├── base.html
│ └── common.js
└── channels/ # Modules for each notification service
├── discord.js
├── ntfy.js
├── pushover.js
├── slack.js
└── telegram.js 


#### Contributing: Adding a New Channel

1.  **Create the Channel File:** Add a new JavaScript file inside the `channels/` directory (e.g., `my_service.js`).
2.  **Implement the `sendMessage` Function:** The file must contain a single `async` function with the signature `async function sendMessage(baseText, locationData)`. It should throw an `Error` on failure.
3.  **Update the Generator (`lifelink_gen.html` and `assets/js/gen_script.js`):** Add the UI and logic to fetch, configure, and generate the app with your new channel.

**Key Consideration:** The service's API must be callable from a browser. Services with strict CORS policies that don't support browser-side calls are challenging to implement.

---
**License:** This project is licensed under the MIT License.
