const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:5173';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');
const BUYER_EMAIL = 'mohammedsayemqazi@gmail.com';
const BUYER_PASSWORD = 'SupplyBuddy2024!';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Signup page (role selection step) - logged out
  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, '01-signup.png') });

  // Login page - logged out
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, '02-login.png') });

  // Log in as buyer
  await page.fill('input[type="email"]', BUYER_EMAIL);
  await page.fill('input[type="password"]', BUYER_PASSWORD);
  await page.click('button:has-text("Sign In")');
  await page.waitForURL(`${BASE}/`, { timeout: 15000 });
  await page.waitForTimeout(1000);

  // Home page
  await page.screenshot({ path: path.join(OUT_DIR, '03-home.png') });

  // Supplier directory
  await page.goto(`${BASE}/suppliers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, '04-suppliers.png') });

  // Supplier profile - click first card
  await page.click('text=Dhaka Textile Mills');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, '05-supplier-profile.png') });

  // Add first material to cart
  await page.locator('button:has-text("Add")').first().click();
  await page.waitForTimeout(1000);

  // Cart / booking page - use SPA nav (cart icon link), not page.goto, since cart state is in-memory only
  await page.click('a[href="/cart"]');
  await page.waitForURL(`${BASE}/cart`, { timeout: 5000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, '06-cart-booking.png') });

  await browser.close();
  console.log('Screenshots saved to', OUT_DIR);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
