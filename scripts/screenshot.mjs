import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5173/';
const outPath = process.argv[3] || '/tmp/screenshot.png';
const clickSelector = process.argv[4];
const waitAfterClick = Number(process.argv[5] || 1000);

const browser = await chromium.launch({
  args: ['--no-sandbox'],
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2000);

if (clickSelector) {
  await page.click(clickSelector);
  await page.waitForTimeout(waitAfterClick);
}

await page.screenshot({ path: outPath });

console.log('Console errors:', errors.length ? errors : 'none');
await browser.close();
