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

// Give ourselves money to test buy buttons enabled state
await page.evaluate(() => window.__gameStore.getState().addMoney(10000));

// Open Shop
await page.click('text=Shop');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/shop_fish_tab.png' });

// Rods tab
await page.click('.tab-button:has-text("Rods")');
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/shop_rods_tab.png' });

// Water tab
await page.click('.tab-button:has-text("Water")');
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/shop_water_tab.png' });

// Close shop, add fish to inventory, open inventory
await page.click('.panel-close');
await page.waitForTimeout(300);

await page.evaluate(() => {
  window.__gameStore.getState().addCatch({ speciesId: 'sunfin', weight: 1.23, value: 12 });
  window.__gameStore.getState().addCatch({ speciesId: 'emberkoi', weight: 2.5, value: 80 });
  window.__gameStore.getState().addCatch({ speciesId: 'goldendrake', weight: 5.1, value: 600 });
});

await page.click('text=Inventory');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/inventory_with_fish.png' });

// Test sell flow
await page.click('.sell-button');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/inventory_after_sell.png' });

// Test sell all
const sellAllBtn = await page.$('text=Sell All');
if (sellAllBtn) {
  await sellAllBtn.click();
  await page.waitForTimeout(500);
}
await page.screenshot({ path: '/tmp/inventory_after_sell_all.png' });

console.log('Console errors:', errors.length ? errors : 'none');

await browser.close();
