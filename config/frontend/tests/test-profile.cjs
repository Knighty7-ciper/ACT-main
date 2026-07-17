const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Collect all console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });
  
  // Collect failed requests
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({ url: request.url(), failure: request.failure()?.errorText });
  });
  
  try {
    console.log('Navigating to profile page...');
    await page.goto('https://cl63d61h85k6.space.minimax.io/profile', { timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for key elements
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('\nPage contains key words:');
    console.log('- "Welcome":', bodyText.includes('Welcome'));
    console.log('- "profile":', bodyText.includes('profile') || bodyText.includes('Profile'));
    console.log('- "Sign Out":', bodyText.includes('Sign Out') || bodyText.includes('Logout'));
    console.log('- "Login":', bodyText.includes('Login') || bodyText.includes('login'));
    console.log('- "password":', bodyText.includes('password') || bodyText.includes('Password'));
    
    // Show first 500 chars of body
    console.log('\nPage content preview:');
    console.log(bodyText.substring(0, 500));
    
    // Show any failed requests
    if (failedRequests.length > 0) {
      console.log('\nFailed requests:');
      failedRequests.forEach(req => {
        console.log(`  - ${req.url}: ${req.failure}`);
      });
    }
    
    // Show all console logs
    console.log('\nAll console logs:');
    consoleLogs.forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
    });
    
    console.log('\nTest completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
