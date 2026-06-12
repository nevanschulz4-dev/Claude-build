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

await page.goto('http://localhost:5173/', { waitUntil: 'load' });
await page.waitForTimeout(1500);

await page.click('text=Fish');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/flow_1_panel.png' });

// Cast the line
await page.click('text=Cast Line');
console.log('Cast clicked');

// Poll for the bite phase, then call hook() directly via the debug store handle
// (headless Chrome throttles rAF heavily, making the real-time bite window too
// short to reliably click in time; this exercises the same state transition).
let hooked = false;
for (let i = 0; i < 60; i++) {
  await page.waitForTimeout(150);
  const phase = await page.evaluate(() => window.__fishingStore.getState().phase);
  if (phase === 'bite') {
    await page.screenshot({ path: '/tmp/flow_2_bite.png' });
    await page.evaluate(() => window.__fishingStore.getState().hook());
    hooked = true;
    console.log('Hooked at iteration', i);
    break;
  }
  if (phase === 'result') {
    console.log('Missed bite at iteration', i);
    break;
  }
}
console.log('hooked:', hooked);

await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/flow_3_reeling.png' });

// Hold reel button repeatedly to win the minigame
let resultReached = false;
for (let i = 0; i < 30; i++) {
  const reelBtn = await page.$('text=HOLD TO REEL');
  if (reelBtn) {
    const box = await reelBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(500);
      await page.mouse.up();
      await page.waitForTimeout(150);
    }
  } else {
    await page.waitForTimeout(300);
  }
  const cont = await page.$('text=Continue');
  if (cont) {
    resultReached = true;
    console.log('result reached at iter', i);
    break;
  }
}
await page.screenshot({ path: '/tmp/flow_4_result.png' });
console.log('resultReached:', resultReached);

if (resultReached) {
  await page.click('text=Continue');
  await page.waitForTimeout(300);
  await page.click('text=Inventory');
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/flow_5_inventory.png' });
}

console.log('Console errors:', errors.length ? errors : 'none');

await browser.close();
