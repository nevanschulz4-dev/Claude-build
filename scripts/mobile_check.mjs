import { chromium } from 'playwright';

const browser = await chromium.launch({
  args: ['--no-sandbox'],
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

const errors = [];
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 2,
});
const page = await context.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto('http://localhost:5173/', { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/mobile_1_home.png' });

// Open Build panel
await page.click('text=Build');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/mobile_2_build.png' });

// Select the first decoration item (Reed Cluster)
const firstItem = await page.$('.item-card');
await firstItem.click();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/mobile_3_selected.png' });

const rotateBtn = await page.$('.build-rotate-button');
console.log('Rotate button found:', !!rotateBtn);

const canvasBox = await page.locator('canvas').first().boundingBox();
// A spot in the visible canvas strip above the build panel, known to land on valid grass
const tapX = canvasBox.x + canvasBox.width * 0.15;
const tapY = canvasBox.y + canvasBox.height * 0.25;

// Tap the on-screen Rotate button before placing
await rotateBtn.click();
await page.waitForTimeout(200);

const moneyBefore = await page.evaluate(() => window.__gameStore.getState().money);
const placedBefore = await page.evaluate(() => window.__gameStore.getState().placedDecorations.length);

// Hover to show ghost, then click to place (tap = mouse down+up at same spot)
await page.mouse.move(tapX, tapY);
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/mobile_3b_ghost.png' });
await page.mouse.click(tapX, tapY);
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/mobile_4_after_tap.png' });

const moneyAfter = await page.evaluate(() => window.__gameStore.getState().money);
const placedAfter = await page.evaluate(() => window.__gameStore.getState().placedDecorations.length);
const rotationAfter = await page.evaluate(() => window.__gameStore.getState().placedDecorations.at(-1)?.rotationY);
console.log('money before/after:', moneyBefore, moneyAfter);
console.log('placed before/after:', placedBefore, placedAfter);
console.log('placed rotationY (should be ~PI/4 = 0.785):', rotationAfter);

// Select another item and simulate a drag (camera orbit) gesture - should NOT place
await page.click('text=Lily Pad Patch');
await page.waitForTimeout(300);
const placedBeforeDrag = await page.evaluate(() => window.__gameStore.getState().placedDecorations.length);
await page.mouse.move(tapX, tapY);
await page.mouse.down();
await page.mouse.move(tapX + 120, tapY + 10, { steps: 10 });
await page.mouse.up();
await page.waitForTimeout(400);
const placedAfterDrag = await page.evaluate(() => window.__gameStore.getState().placedDecorations.length);
console.log('placed before/after drag (should be equal):', placedBeforeDrag, placedAfterDrag);
await page.screenshot({ path: '/tmp/mobile_5_after_drag.png' });

console.log('Console errors:', errors.length ? errors : 'none');
await browser.close();
