import { chromium } from 'playwright';

const browser = await chromium.launch({
  args: ['--no-sandbox'],
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
const page = await context.newPage();
page.on('pageerror', (err) => console.log('pageerror', String(err)));

await page.goto('http://localhost:5173/', { waitUntil: 'load' });
await page.waitForTimeout(1500);

await page.click('text=Build');
await page.waitForTimeout(500);
const firstItem = await page.$('.item-card');
await firstItem.click();
await page.waitForTimeout(300);

const canvasBox = await page.locator('canvas').first().boundingBox();

for (const fx of [0.15, 0.35, 0.5, 0.65, 0.85]) {
  for (const fy of [0.05, 0.1, 0.18, 0.25]) {
    const x = canvasBox.x + canvasBox.width * fx;
    const y = canvasBox.y + canvasBox.height * fy;
    await page.mouse.move(x, y);
    await page.waitForTimeout(150);
    const placedBefore = await page.evaluate(() => window.__gameStore.getState().placedDecorations.length);
    const moneyBefore = await page.evaluate(() => window.__gameStore.getState().money);
    await page.mouse.click(x, y);
    await page.waitForTimeout(300);
    const placedAfter = await page.evaluate(() => window.__gameStore.getState().placedDecorations.length);
    const moneyAfter = await page.evaluate(() => window.__gameStore.getState().money);
    if (placedAfter > placedBefore) {
      console.log(`PLACED at fx=${fx} fy=${fy} (x=${x.toFixed(0)}, y=${y.toFixed(0)}) money ${moneyBefore}->${moneyAfter}`);
      await page.screenshot({ path: '/tmp/sweep_placed.png' });
      await browser.close();
      process.exit(0);
    }
  }
}
console.log('No placement found across sweep');
await page.screenshot({ path: '/tmp/sweep_none.png' });
await browser.close();
