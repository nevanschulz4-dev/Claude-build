import { chromium } from 'playwright';

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

const url = process.argv[2] || 'http://localhost:5174/';
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2000);

// Open Build panel
await page.click('text=Build');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/build_1_panel.png' });

// Select the Reed Cluster item (cheap, easy to afford)
await page.click('text=Reed Cluster');
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/build_2_selected.png' });

// Move mouse over the canvas to a spot on the grass, then click to place
const canvas = await page.$('canvas');
const box = await canvas.boundingBox();
const x = box.x + box.width * 0.65;
const y = box.y + box.height * 0.55;

await page.mouse.move(x, y);
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/build_3_ghost.png' });

// Rotate the ghost with R key
await page.keyboard.press('r');
await page.waitForTimeout(200);

await page.mouse.click(x, y);
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/build_4_placed.png' });

// Place a second one nearby to confirm multi-placement works
const x2 = box.x + box.width * 0.7;
const y2 = box.y + box.height * 0.6;
await page.mouse.move(x2, y2);
await page.waitForTimeout(300);
await page.mouse.click(x2, y2);
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/build_5_placed2.png' });

// Cancel selection
await page.click('text=Cancel');
await page.waitForTimeout(300);

// Enable remove mode and click on a placed decoration
await page.click('text=Remove Decorations');
await page.waitForTimeout(300);
await page.mouse.move(x, y);
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/build_6_remove_hover.png' });
await page.mouse.click(x, y);
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/build_7_removed.png' });

console.log('Console errors:', errors.length ? errors : 'none');

await browser.close();
