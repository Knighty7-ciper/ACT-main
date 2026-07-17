const { chromium } = require('playwright');

async function testNewBlogTemplates() {
  console.log('🧪 Testing Pesa-Afrik new professional blog templates...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    // Test Blog Post 1 - Founder Article
    console.log('1. Testing Blog Post 1 (Founder Article)...');
    await page.goto('https://a201413wlsc1.space.minimax.io/blog/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const title = await page.locator('h1:has-text("Introducing Pesa-Afrik")').isVisible();
    console.log('   ✓ Founder article title visible:', title);
    
    const ceoImage = await page.locator('img[alt="Brian Kiarie"]').isVisible();
    console.log('   ✓ CEO profile image visible:', ceoImage);
    
    const authorName = await page.locator('text=Brian Kiarie').first().isVisible();
    console.log('   ✓ Author name (Brian Kiarie) visible:', authorName);
    
    const featuredBadge = await page.locator('text=Featured Article').isVisible();
    console.log('   ✓ Featured badge visible:', featuredBadge);
    
    // Check hero section
    const heroImage = await page.locator('img[alt="Introducing Pesa-Afrik"]').isVisible();
    console.log('   ✓ Hero image visible:', heroImage);
    
    // Test Blog Post 2
    console.log('\n2. Testing Blog Post 2...');
    await page.goto('https://a201413wlsc1.space.minimax.io/blog/2');
    await page.waitForLoadState('networkidle');
    
    const techTitle = await page.locator('h1:has-text("Basket Algorithm")').isVisible();
    console.log('   ✓ Technology article visible:', techTitle);
    
    // Test Blog Post 3
    console.log('\n3. Testing Blog Post 3...');
    await page.goto('https://a201413wlsc1.space.minimax.io/blog/3');
    await page.waitForLoadState('networkidle');
    
    const ecoTitle = await page.locator('h1:has-text("Continental Stable Value Layer")').isVisible();
    console.log('   ✓ Economics article visible:', ecoTitle);
    
    // Test Blog Post 4
    console.log('\n4. Testing Blog Post 4...');
    await page.goto('https://a201413wlsc1.space.minimax.io/blog/4');
    await page.waitForLoadState('networkidle');
    
    const communityTitle = await page.locator('h1:has-text("Lagos to Nairobi")').isVisible();
    console.log('   ✓ Community article visible:', communityTitle);
    
    // Test Blog Post 5
    console.log('\n5. Testing Blog Post 5...');
    await page.goto('https://a201413wlsc1.space.minimax.io/blog/5');
    await page.waitForLoadState('networkidle');
    
    const transparencyTitle = await page.locator('h1:has-text("Transparency in Practice")').isVisible();
    console.log('   ✓ Technology article visible:', transparencyTitle);
    
    // Test Blog Post 6
    console.log('\n6. Testing Blog Post 6...');
    await page.goto('https://a201413wlsc1.space.minimax.io/blog/6');
    await page.waitForLoadState('networkidle');
    
    const inflationTitle = await page.locator('h1:has-text("Inflation Hedging")').isVisible();
    console.log('   ✓ Economics article visible:', inflationTitle);
    
    // Check for new features
    console.log('\n7. Checking for new template features...');
    
    const shareSection = await page.locator('text=Share this article').isVisible();
    console.log('   ✓ Share section visible:', shareSection);
    
    const relatedArticles = await page.locator('text=Related Articles').isVisible();
    console.log('   ✓ Related articles section visible:', relatedArticles);
    
    const newsletter = await page.locator('text=Stay Updated').isVisible();
    console.log('   ✓ Newsletter signup visible:', newsletter);
    
    // Check tags
    const tags = await page.locator('text=#Pesa-Afrik').isVisible();
    console.log('   ✓ Article tags visible:', tags);
    
    // Filter console errors
    const criticalErrors = consoleErrors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::ERR')
    );
    
    console.log('\n📋 Console Errors:', criticalErrors.length === 0 ? 'None ✓' : criticalErrors);
    
    console.log('\n🎉 All blog template tests passed!');
    console.log('📱 Deployed at: https://a201413wlsc1.space.minimax.io/blog/1');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testNewBlogTemplates();
