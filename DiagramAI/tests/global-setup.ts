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
    // Navigate to the application
    await page.goto(baseURL);
    
    // Perform any global authentication or setup
    // For example, creating test users, setting up test data, etc.
    
    console.log('✅ Application is accessible');
  } catch (error) {
    console.error('❌ Failed to access application:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ Global test setup completed');
}

export default globalSetup;
