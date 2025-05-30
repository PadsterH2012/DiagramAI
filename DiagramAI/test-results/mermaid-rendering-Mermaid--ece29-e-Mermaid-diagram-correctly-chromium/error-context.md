# Test info

- Name: Mermaid Diagram Rendering >> should render simple Mermaid diagram correctly
- Location: /mnt/network_repo/DiagramAI-1/DiagramAI/tests/e2e/mermaid-rendering.spec.ts:10:7

# Error details

```
Error: locator.textContent: Error: strict mode violation: locator('h1') resolved to 2 elements:
    1) <h1 class="text-xl font-bold text-gray-900">DiagramAI</h1> aka getByRole('heading', { name: 'DiagramAI' })
    2) <h1 class="text-2xl font-bold text-gray-900">Simple Mermaid Test</h1> aka getByRole('heading', { name: 'Simple Mermaid Test' })

Call log:
  - waiting for locator('h1')

    at /mnt/network_repo/DiagramAI-1/DiagramAI/tests/e2e/mermaid-rendering.spec.ts:21:44
```

# Page snapshot

```yaml
- banner:
  - heading "DiagramAI" [level=1]
  - navigation:
    - link "Home":
      - /url: /
    - link "Editor":
      - /url: /editor
    - link "Dashboard":
      - /url: /dashboard
    - link "⚙️ Settings":
      - /url: /settings
- main:
  - button "← Back"
  - heading "Simple Mermaid Test" [level=1]
  - paragraph: Basic test to debug Mermaid rendering
  - text: 📝 Mermaid 🌐 Public
  - link "Edit Diagram":
    - /url: /editor?id=f50ff3c6-f439-4952-9370-49d686372c22
  - paragraph: ❌ Rendering Error
  - paragraph: Failed to render diagram
  - group: View Mermaid Syntax
  - heading "Diagram Information" [level=3]
  - text: Created:May 30, 2025 at 07:58 AM Last Modified:May 30, 2025 at 07:58 AM Format:mermaid Visibility:Public
- contentinfo:
  - paragraph: © 2025 DiagramAI. AI-Powered Diagram Generation Platform.
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test'
   2 |
   3 | test.describe('Mermaid Diagram Rendering', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Wait for server to be ready
   6 |     await page.goto('http://localhost:3000')
   7 |     await page.waitForLoadState('networkidle')
   8 |   })
   9 |
   10 |   test('should render simple Mermaid diagram correctly', async ({ page }) => {
   11 |     console.log('Testing simple Mermaid diagram...')
   12 |     
   13 |     // Navigate to the simple Mermaid diagram
   14 |     await page.goto('http://localhost:3000/diagram/f50ff3c6-f439-4952-9370-49d686372c22')
   15 |     await page.waitForLoadState('networkidle')
   16 |     
   17 |     // Wait for the page to load completely
   18 |     await page.waitForTimeout(2000)
   19 |     
   20 |     // Check if the page title is correct
>  21 |     const title = await page.locator('h1').textContent()
      |                                            ^ Error: locator.textContent: Error: strict mode violation: locator('h1') resolved to 2 elements:
   22 |     console.log('Page title:', title)
   23 |     expect(title).toContain('Simple Mermaid Test')
   24 |     
   25 |     // Check if Mermaid View indicator is present
   26 |     const mermaidView = await page.locator('text=Mermaid View').isVisible()
   27 |     console.log('Mermaid View indicator visible:', mermaidView)
   28 |     expect(mermaidView).toBe(true)
   29 |     
   30 |     // Check for any error messages
   31 |     const errorMessage = await page.locator('text=Rendering Error').isVisible()
   32 |     console.log('Error message visible:', errorMessage)
   33 |     expect(errorMessage).toBe(false)
   34 |     
   35 |     // Check if loading indicator is gone
   36 |     const loadingIndicator = await page.locator('text=Rendering diagram...').isVisible()
   37 |     console.log('Loading indicator visible:', loadingIndicator)
   38 |     expect(loadingIndicator).toBe(false)
   39 |     
   40 |     // Check if SVG element exists (this indicates successful Mermaid rendering)
   41 |     const svgElement = await page.locator('svg').first()
   42 |     const svgExists = await svgElement.isVisible()
   43 |     console.log('SVG element visible:', svgExists)
   44 |     expect(svgExists).toBe(true)
   45 |     
   46 |     // Get SVG content to verify it's actually rendered
   47 |     if (svgExists) {
   48 |       const svgContent = await svgElement.innerHTML()
   49 |       console.log('SVG content length:', svgContent.length)
   50 |       console.log('SVG content preview:', svgContent.substring(0, 200) + '...')
   51 |       expect(svgContent.length).toBeGreaterThan(100) // Should have substantial content
   52 |     }
   53 |     
   54 |     // Check for specific Mermaid elements (nodes A, B, C)
   55 |     const pageContent = await page.content()
   56 |     console.log('Page contains node A:', pageContent.includes('A'))
   57 |     console.log('Page contains node B:', pageContent.includes('B'))
   58 |     console.log('Page contains node C:', pageContent.includes('C'))
   59 |     
   60 |     // Take a screenshot for visual verification
   61 |     await page.screenshot({ 
   62 |       path: 'DiagramAI/tests/screenshots/simple-mermaid-test.png',
   63 |       fullPage: true 
   64 |     })
   65 |     console.log('Screenshot saved to tests/screenshots/simple-mermaid-test.png')
   66 |   })
   67 |
   68 |   test('should render complex Mermaid diagram correctly', async ({ page }) => {
   69 |     console.log('Testing complex Mermaid diagram...')
   70 |     
   71 |     // Navigate to the complex Mermaid diagram
   72 |     await page.goto('http://localhost:3000/diagram/74a7ac31-15cc-4c87-a522-2ce85435d963')
   73 |     await page.waitForLoadState('networkidle')
   74 |     
   75 |     // Wait for the page to load completely
   76 |     await page.waitForTimeout(3000)
   77 |     
   78 |     // Check if the page title is correct
   79 |     const title = await page.locator('h1').textContent()
   80 |     console.log('Page title:', title)
   81 |     expect(title).toContain('AI Agent Architecture Demo')
   82 |     
   83 |     // Check if Mermaid View indicator is present
   84 |     const mermaidView = await page.locator('text=Mermaid View').isVisible()
   85 |     console.log('Mermaid View indicator visible:', mermaidView)
   86 |     expect(mermaidView).toBe(true)
   87 |     
   88 |     // Check for any error messages
   89 |     const errorMessage = await page.locator('text=Rendering Error').isVisible()
   90 |     console.log('Error message visible:', errorMessage)
   91 |     
   92 |     if (errorMessage) {
   93 |       // If there's an error, capture the error details
   94 |       const errorDetails = await page.locator('.text-red-600').textContent()
   95 |       console.log('Error details:', errorDetails)
   96 |       
   97 |       // Also check if there's more error info
   98 |       const errorInfo = await page.locator('.text-gray-600').textContent()
   99 |       console.log('Additional error info:', errorInfo)
  100 |     }
  101 |     
  102 |     expect(errorMessage).toBe(false)
  103 |     
  104 |     // Check if loading indicator is gone
  105 |     const loadingIndicator = await page.locator('text=Rendering diagram...').isVisible()
  106 |     console.log('Loading indicator visible:', loadingIndicator)
  107 |     expect(loadingIndicator).toBe(false)
  108 |     
  109 |     // Check if SVG element exists
  110 |     const svgElement = await page.locator('svg').first()
  111 |     const svgExists = await svgElement.isVisible()
  112 |     console.log('SVG element visible:', svgExists)
  113 |     expect(svgExists).toBe(true)
  114 |     
  115 |     // Get SVG content to verify it's actually rendered
  116 |     if (svgExists) {
  117 |       const svgContent = await svgElement.innerHTML()
  118 |       console.log('SVG content length:', svgContent.length)
  119 |       console.log('SVG content preview:', svgContent.substring(0, 300) + '...')
  120 |       expect(svgContent.length).toBeGreaterThan(500) // Complex diagram should have more content
  121 |     }
```