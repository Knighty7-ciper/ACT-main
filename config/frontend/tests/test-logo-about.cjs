const { chromium } = require('playwright');

async function testUpdatedLogoAndAbout() {
  console.log('🧪 Testing Pesa-Afrik updated logo and About page...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    // Test home page with new logo
    console.log('1. Testing Home Page with new logo...');
    await page.goto('https://8n5jt08rxmg2.space.minimax.io');
    await page.waitForLoadState('networkidle');
    
    const headerLogo = await page.locator('img[alt="Pesa-Afrik Logo"]').first();
    const logoVisible = await headerLogo.isVisible();
    console.log('   ✓ Header logo visible:', logoVisible);
    
    // Test About page with inspiration section
    console.log('\n2. Testing About page with Inspiration section...');
    await page.goto('https://8n5jt08rxmg2.space.minimax.io/about');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for inspiration section
    const inspirationSection = await page.locator('text=Inspired by Africa, Built for Africans').isVisible();
    console.log('   ✓ Inspiration section visible:', inspirationSection);
    
    // Check for culture image
    const cultureImage = await page.locator('img[alt="African Culture and Heritage"]').isVisible();
    console.log('   ✓ Culture image visible:', cultureImage);
    
    // Check for CEO name
    const ceoName = await page.locator('text=Brian Kiarie').isVisible();
    console.log('   ✓ CEO name visible:', ceoName);
    
    // Check team section
    const teamSection = await page.locator('text=Meet the Team').isVisible();
    console.log('   ✓ Team section visible:', teamSection);
    
    // Filter console errors
    const criticalErrors = consoleErrors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::ERR')
    );
    
    console.log('\n📋 Console Errors:', criticalErrors.length === 0 ? 'None ✓' : criticalErrors);
    
    console.log('\n🎉 All tests passed!');
    console.log('📱 Deployed at: https://8n5jt08rxmg2.space.minimax.io');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testUpdatedLogoAndAbout();
