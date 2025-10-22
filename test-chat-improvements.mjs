import { chromium } from '@playwright/test'

async function testChatImprovements() {
  console.log('Starting chat improvements test...')

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro dimensions
  })
  const page = await context.newPage()

  try {
    // Navigate to the app
    console.log('Navigating to app...')
    await page.goto('http://localhost:3001')
    await page.waitForTimeout(2000)

    // Take initial screenshot
    await page.screenshot({ path: 'test-screenshots/01-initial-load.png', fullPage: true })
    console.log('✓ Screenshot 1: Initial load')

    // Find and click the chat input
    console.log('Starting conversation...')
    const chatInput = page.locator('input[placeholder="Message..."]')

    // Message 1: User shares an interest
    await chatInput.fill('i love working out')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(3000) // Wait for AI response

    await page.screenshot({ path: 'test-screenshots/02-message-1-workout.png', fullPage: true })
    console.log('✓ Screenshot 2: First message - "i love working out"')

    // Check response length
    await page.waitForSelector('.glass-card', { timeout: 10000 })
    const firstResponse = await page.locator('.glass-card').last().textContent()
    const firstWordCount = firstResponse.trim().split(/\s+/).length
    console.log(`  → AI response (${firstWordCount} words): "${firstResponse.trim().substring(0, 100)}..."`)

    if (firstWordCount <= 30) {
      console.log('  ✓ Response is appropriately short')
    } else {
      console.log('  ⚠ Response might be too long')
    }

    await page.waitForTimeout(2000)

    // Message 2: User elaborates
    await chatInput.fill('it helps me clear my head')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(3000)

    await page.screenshot({ path: 'test-screenshots/03-message-2-clear-head.png', fullPage: true })
    console.log('✓ Screenshot 3: Second message - "it helps me clear my head"')

    const secondResponse = await page.locator('.glass-card').last().textContent()
    const secondWordCount = secondResponse.trim().split(/\s+/).length
    console.log(`  → AI response (${secondWordCount} words): "${secondResponse.trim().substring(0, 100)}..."`)

    await page.waitForTimeout(2000)

    // Message 3: User shares more details
    await chatInput.fill('usually work stress')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(3000)

    await page.screenshot({ path: 'test-screenshots/04-message-3-work-stress.png', fullPage: true })
    console.log('✓ Screenshot 4: Third message - "usually work stress"')

    const thirdResponse = await page.locator('.glass-card').last().textContent()
    const thirdWordCount = thirdResponse.trim().split(/\s+/).length
    console.log(`  → AI response (${thirdWordCount} words): "${thirdResponse.trim().substring(0, 100)}..."`)

    await page.waitForTimeout(2000)

    // Message 4: User mentions an activity
    await chatInput.fill('yeah i like coffee shops to decompress')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(3000)

    await page.screenshot({ path: 'test-screenshots/05-message-4-coffee-shops.png', fullPage: true })
    console.log('✓ Screenshot 5: Fourth message - "yeah i like coffee shops to decompress"')

    const fourthResponse = await page.locator('.glass-card').last().textContent()
    const fourthWordCount = fourthResponse.trim().split(/\s+/).length
    console.log(`  → AI response (${fourthWordCount} words): "${fourthResponse.trim().substring(0, 100)}..."`)

    // Check if a glimpse was generated (it shouldn't be at this early stage)
    const glimpseCards = await page.locator('video').count()
    console.log(`  → Glimpses shown: ${glimpseCards}`)

    if (glimpseCards === 0) {
      console.log('  ✓ No premature glimpses (correct behavior)')
    } else {
      console.log('  ⚠ Glimpse shown too early')
    }

    await page.waitForTimeout(2000)

    // Take final full conversation screenshot
    await page.screenshot({ path: 'test-screenshots/06-full-conversation.png', fullPage: true })
    console.log('✓ Screenshot 6: Full conversation view')

    console.log('\n' + '='.repeat(60))
    console.log('TEST SUMMARY')
    console.log('='.repeat(60))
    console.log('Expected behavior:')
    console.log('  ✓ Responses should be 15-25 words (max ~30)')
    console.log('  ✓ AI should ask follow-up questions')
    console.log('  ✓ No glimpses shown before 15+ messages')
    console.log('  ✓ Responses feel like texting a friend')
    console.log('\nScreenshots saved to test-screenshots/ directory')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('Test error:', error)
    await page.screenshot({ path: 'test-screenshots/error.png', fullPage: true })
  } finally {
    await browser.close()
  }
}

// Create screenshots directory
import { mkdirSync } from 'fs'
try {
  mkdirSync('test-screenshots', { recursive: true })
} catch (e) {
  // Directory exists
}

testChatImprovements()
