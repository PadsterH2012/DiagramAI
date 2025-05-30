import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');

  // Start the development server if not already running
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  
  try {
    // Check if the server is already running
    const response = await fetch(baseURL);
    if (response.ok) {
      console.log('✅ Development server is already running');
    }
  } catch (error) {
    console.log('⚠️ Development server not running, will be started by webServer config');
  }

  // Setup test database if needed
  console.log('🗄️ Setting up test database...');
  
  // You can add database setup logic here
  // For example, running migrations, seeding test data, etc.
  
  // Create a browser instance for shared authentication
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the application with retry logic
    let retries = 5;
    let accessible = false;

    while (retries > 0 && !accessible) {
      try {
        await page.goto(baseURL, { timeout: 10000 });
        accessible = true;
        console.log('✅ Application is accessible');
      } catch (error) {
        retries--;
        if (retries > 0) {
          console.log(`⏳ Application not ready, retrying... (${retries} attempts left)`);
          await page.waitForTimeout(2000);
        } else {
          console.log('⚠️ Application not accessible during setup, but continuing with tests');
          // Don't throw error - let individual tests handle connectivity
        }
      }
    }

    // Perform any global authentication or setup
    // For example, creating test users, setting up test data, etc.

  } catch (error) {
    console.error('⚠️ Global setup encountered issues:', error);
    // Don't throw error - let individual tests handle their own setup
  } finally {
    await browser.close();
  }

  console.log('✅ Global test setup completed');
}

export default globalSetup;
