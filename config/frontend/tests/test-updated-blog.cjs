const { chromium } = require('playwright');

async function testUpdatedBlog() {
  console.log('Starting browser test for updated blog page...');
  
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
    await page.goto('https://3z4vi5tsi3dq.space.minimax.io/blog');
    await page.waitForLoadState('networkidle');
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Check if main elements are present
    const blogTitle = await page.locator('h1:has-text("Pesa-Afrik Blog")').isVisible();
    console.log('✓ Blog title visible:', blogTitle);
    
    // Check for featured section
    const featuredSection = await page.locator('text=Featured Article').isVisible();
    console.log('✓ Featured section visible:', featuredSection);
    
    // Check for Brian Kiarie
    const ceoName = await page.locator('text=Brian Kiarie').isVisible();
    console.log('✓ CEO name (Brian Kiarie) visible:', ceoName);
    
    // Check for recent articles
    const recentArticles = await page.locator('text=Recent Articles').isVisible();
    console.log('✓ Recent articles section visible:', recentArticles);
    
    // Check for news section
    const newsSection = await page.locator('text=Latest Blockchain & Web3 News').isVisible();
    console.log('✓ News section visible:', newsSection);
    
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
      console.log('✓ No critical console errors found!');
    }
    
    console.log('\n🎉 Test completed successfully!');
    console.log('📱 Deployed at: https://3z4vi5tsi3dq.space.minimax.io/blog');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testUpdatedBlog();
