const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let errorCount = 0;
  page.on('response', response => {
    if (response.status() >= 400) {
      console.error(`[ERROR] ${response.status()} ${response.url()}`);
      errorCount++;
    }
  });

  console.log('Starting stress test...');
  
  try {
    console.log('Navigating to login...');
    await page.goto('https://photorium-production.up.railway.app/login', { waitUntil: 'networkidle' });
    
    await page.fill('#identifier', 'stresstester@photorium.com');
    await page.fill('#password', 'Password123!');
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => console.log('No navigation event fired')),
      page.click('button:has-text("Enter the Fryer")')
    ]);
    
    // Wait for navigation to dashboard
    await page.waitForSelector('h1:has-text("Your Stash")', { timeout: 10000 });
    console.log('Logged in successfully!');

    const iterations = 10;
    for (let i = 0; i < iterations; i++) {
      console.log(`Iteration ${i + 1}/${iterations}...`);
      
      // Upload an image
      console.log('  Uploading a test image...');
      await page.click('button:has-text("Toss in the Fryer")');
      await page.waitForSelector('h2:has-text("New Batch")');
      
      // Select the SVG file
      const fileInput = await page.$('input[type="file"]');
      await fileInput.setInputFiles(path.resolve(__dirname, '../../react/public/favicon.svg'));
      
      await page.fill('input[name="title"]', `Stress Test Photo ${Date.now()}`);
      await page.fill('input[name="category"]', 'Stress Test');
      await page.fill('textarea[name="description"]', 'Uploaded during the automated stress test.');
      
      await page.click('button:has-text("Fry It!")');
      
      // Wait for the modal to close / reload
      await page.waitForTimeout(3000); 

      // Navigate to Hash Brown Hub to check attributes
      console.log('  Visiting Hash Brown Hub...');
      await page.goto('https://photorium-production.up.railway.app/hash-brown-hub');
      await page.waitForSelector('h1:has-text("Hash Brown Hub")');
      
      // Rapidly browse some photos or go back
      console.log('  Going back to dashboard...');
      await page.goto('https://photorium-production.up.railway.app/dashboard');
      await page.waitForTimeout(1000);
    }
    
    console.log(`Stress test completed. Total network errors: ${errorCount}`);
  } catch (err) {
    console.error('Stress test encountered an error:', err);
  } finally {
    await browser.close();
  }
})();
