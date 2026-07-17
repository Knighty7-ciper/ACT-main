const { chromium } = require('playwright');

async function testBlogPage() {
  console.log('Starting browser test...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    console.log('Navigating to blog page...');
    await page.goto('https://w2kf7myzm9tw.space.minimax.io/blog');
    await page.waitForLoadState('networkidle');
    
    // Wait for news to load
    await page.waitForTimeout(5000);
    
    // Check if main elements are present
    const blogTitle = await page.locator('h1:has-text("Pesa-Afrik Blog")').isVisible();
    console.log('Blog title visible:', blogTitle);
    
    // Check for news section
    const newsSection = await page.locator('text=Latest Blockchain & Web3 News').isVisible();
    console.log('News section visible:', newsSection);
    
    // Filter console errors
    const criticalErrors = consoleErrors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::ERR')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    } else {
      console.log('No critical console errors found!');
    }
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testBlogPage();
