const { executablePath } = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const {launch, getStream } = require("puppeteer-stream");

puppeteerExtra.use(stealthPlugin());

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
    // const browser = await puppeteerExtra.launch({
    //     defaultViewport: {
    //         width: 1180,
    //         height: 950,
    //     },
    //     headless: "false", //***For running locally make thie false (boolean)
    //     executablePath: executablePath(),
    //     args: [
    //         "--no-sandbox",
    //         "--headless=new",
    //         "--disable-gpu",
    //         "--disable-dev-shm-usage",
    //         "--disable-blink-features=AutomationControlled",
    //     ],
    //     ignoreHTTPSErrors: true,
    //     dumpio: true, // Capture stdout and stderr
    // });

    const browser = await launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: executablePath(),
    });

    const context = browser.defaultBrowserContext();
    await context.overridePermissions("https://meet.google.com/", [
        "microphone",
        "camera",
        "notifications",
    ]);

    const page = await browser.newPage();

    await page.goto("https://meet.google.com/", {
        timeout: 30000,
        waitUntil: "networkidle2",
    });

    await page.waitForSelector('a[href*="ServiceLogin?"]', { visible: true });
    await page.click('a[href*="ServiceLogin?"]', { delay: 2000 });

    console.log("Sign In button clicked!");
    await sleep(2000);
    await page.waitForSelector('input[type="email"]');
    await page.click('input[type="email"]');
    await page.keyboard.type(`deepakm@zignuts.com`, { delay: 300 });
    await sleep(2000);

    await page.waitForSelector("#identifierNext");
    await page.click("#identifierNext");

    await sleep(2000);

    // typing out password
    await page.keyboard.type(`Deepak@zig123`, { delay: 200 });
    await sleep(2000);
    await page.keyboard.press("Enter");

    await sleep(2000);

    await page.waitForSelector('input[type="text"]');
    await page.click('input[type="text"]');
    await sleep(2000);
    await page.keyboard.type(`jit-ngwr-oug`, { delay: 200 });

    await sleep(2000);
    await page.keyboard.press("Enter");

    await sleep(5000);

    // await page.waitForSelector('button[jsname="Qx7uuf"]');
    // await page.click('button[jsname="Qx7uuf"]');
    // await sleep(2000);

    const buttonSelector = 'button[jsname="Qx7uuf"]';

    const button = await page.$(buttonSelector);

    if (button) {
        // If the button exists, click on it
        await button.click();
        console.log("Clicked on the button with jsname='Qx7uuf'");
    } else {
        // If the button doesn't exist, just sleep for 2 seconds
        console.log("Button not found, sleeping for 2 seconds...");
        await sleep(2000);
    }

    // ---------------------------------
    // const stream = await getStream(page, { audio: true, video: false });
    const stream = await getStream(page, {
        audio: true,
        video: false,
        bitsPerSecond: 128000,
        mimeType: "audio/webm;codecs=opus",
        frameSize: 2000,
      });

    // Create a write stream to save the video
    const fileStream = fs.createWriteStream("google_meet.webm");
    stream.pipe(fileStream);

    console.log("Recording started...");

    // Record for a certain duration (e.g., 1 minute here)
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Record for 1 minute

    // Stop the recording
    stream.destroy();
    fileStream.end();

    console.log("Recording saved as google_meet_recording.mp4");

    // Close the browser once done (optional)
    await browser.close();
})();
