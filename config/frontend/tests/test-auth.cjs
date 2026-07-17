const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Collect console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });
  
  try {
    console.log('=== Testing Login Page ===');
    await page.goto('https://wikg9ublaqzx.space.minimax.io/login', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check for demo user buttons
    const content = await page.content();
    console.log('Has Demo User button:', content.includes('Demo User'));
    console.log('Has John button:', content.includes('John'));
    console.log('Has Sarah button:', content.includes('Sarah'));
    
    // Click demo user button
    console.log('\n=== Testing Demo Login ===');
    await page.click('button:has-text("Demo User")');
    await page.waitForTimeout(500);
    
    // Submit login
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Check if redirected to dashboard
    const currentUrl = page.url();
    console.log('After login URL:', currentUrl);
    
    // Get body text
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Page contains "Dashboard":', bodyText.includes('Dashboard') || bodyText.includes('dashboard'));
    console.log('Page contains "Welcome":', bodyText.includes('Welcome'));
    console.log('Page contains "PESA":', bodyText.includes('PESA'));
    
    // Check for wallet/balance info
    console.log('\n=== Checking Dashboard ===');
    console.log('Has wallet info:', bodyText.includes('Wallet') || bodyText.includes('Balance'));
    console.log('Has transaction info:', bodyText.includes('Transaction') || bodyText.includes('History'));
    
    // Print relevant console logs
    console.log('\n=== Console Logs ===');
    consoleLogs.forEach(log => {
      if (log.type === 'error' || log.text.includes('error') || log.text.includes('Error') || log.text.includes('initialized')) {
        console.log(`[${log.type}] ${log.text}`);
      }
    });
    
    console.log('\n=== Test Completed Successfully! ===');
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
