# Test info

- Name: Diagram Editor >> should display React Flow visual editor
- Location: /mnt/network_repo/DiagramAI-1/DiagramAI/tests/e2e/diagram-editor.spec.ts:32:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('.node-palette')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('.node-palette')

    at /mnt/network_repo/DiagramAI-1/DiagramAI/tests/e2e/diagram-editor.spec.ts:40:49
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
- main:
  - heading "Diagram Editor" [level=1]
  - paragraph: Create and edit diagrams with AI assistance
  - heading "🤖 AI Diagram Generation" [level=2]
  - textbox "Describe your diagram (e.g., 'user login process', 'data flow architecture')"
  - button "Generate" [disabled]
  - navigation:
    - button "🎨 Visual Editor"
    - button "📝 Mermaid Code"
  - text: "Visual Diagram Editor Nodes: 0 • Connections: 0"
  - button "📝 To Mermaid"
  - button "💾 Save"
  - heading "Node Palette" [level=3]
  - text: ▶️ Start Start point of the process ⚙️ Process Process or action step ❓ Decision Decision or branching point ⏹️ End End point of the process
  - heading "Instructions" [level=4]
  - paragraph: • Click to add to center
  - paragraph: • Drag to position
  - paragraph: • Connect with handles
  - heading "Visual Editor" [level=2]
  - text: "Nodes: 5 Connections: 4"
  - button "Reset Demo"
  - button "Clear All"
  - button "Save Diagram"
  - img:
    - button "Edge from 1 to 2"
  - img:
    - button "Edge from 2 to 3"
  - img:
    - button "Edge from 3 to 4": "Yes"
  - img:
    - button "Edge from 3 to 5": "No"
  - button "▶️ Start"
  - button "⚙️ Process Data"
  - button "❓ Valid?"
  - button "✅ Success"
  - button "❌ Error"
  - img
  - button "zoom in":
    - img
  - button "zoom out":
    - img
  - button "fit view":
    - img
  - button "toggle interactivity":
    - img
  - img "React Flow mini map"
  - link "React Flow attribution":
    - /url: https://reactflow.dev
    - text: React Flow
  - text: "✅ Syntax Valid Last saved: Never Lines: 6 Characters: 121"
- contentinfo:
  - paragraph: © 2025 DiagramAI. AI-Powered Diagram Generation Platform.
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Diagram Editor', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto('/editor');
   6 |   });
   7 |
   8 |   test('should load the editor page successfully', async ({ page }) => {
   9 |     // Check that the editor page loads
   10 |     await expect(page).toHaveTitle(/DiagramAI/);
   11 |
   12 |     // Check for main heading
   13 |     await expect(page.locator('h1').filter({ hasText: 'Diagram Editor' })).toBeVisible();
   14 |
   15 |     // Check for AI generation panel
   16 |     await expect(page.locator('h2').filter({ hasText: 'AI Diagram Generation' })).toBeVisible();
   17 |   });
   18 |
   19 |   test('should have both Visual and Mermaid editor tabs', async ({ page }) => {
   20 |     // Check for tab navigation
   21 |     await expect(page.locator('button').filter({ hasText: 'Visual Editor' })).toBeVisible();
   22 |     await expect(page.locator('button').filter({ hasText: 'Mermaid Code' })).toBeVisible();
   23 |
   24 |     // Test tab switching
   25 |     await page.click('button:has-text("Mermaid Code")');
   26 |     await expect(page.locator('textarea')).toBeVisible();
   27 |
   28 |     await page.click('button:has-text("Visual Editor")');
   29 |     await expect(page.locator('.react-flow')).toBeVisible();
   30 |   });
   31 |
   32 |   test('should display React Flow visual editor', async ({ page }) => {
   33 |     // Ensure we're on the visual tab (default)
   34 |     await expect(page.locator('button').filter({ hasText: 'Visual Editor' })).toHaveClass(/border-blue-500/);
   35 |
   36 |     // Check for React Flow container
   37 |     await expect(page.locator('.react-flow')).toBeVisible();
   38 |
   39 |     // Check for node palette
>  40 |     await expect(page.locator('.node-palette')).toBeVisible();
      |                                                 ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   41 |
   42 |     // Check for different node types in palette
   43 |     await expect(page.locator('.palette-node').filter({ hasText: 'Start' })).toBeVisible();
   44 |     await expect(page.locator('.palette-node').filter({ hasText: 'Process' })).toBeVisible();
   45 |     await expect(page.locator('.palette-node').filter({ hasText: 'Decision' })).toBeVisible();
   46 |     await expect(page.locator('.palette-node').filter({ hasText: 'End' })).toBeVisible();
   47 |   });
   48 |
   49 |   test('should allow drag and drop of nodes', async ({ page }) => {
   50 |     // Ensure we're on the visual tab (default)
   51 |     await expect(page.locator('button').filter({ hasText: 'Visual Editor' })).toHaveClass(/border-blue-500/);
   52 |
   53 |     // Wait for React Flow to be ready
   54 |     await page.waitForSelector('.react-flow', { state: 'visible' });
   55 |
   56 |     // Get the start node from palette
   57 |     const startNode = page.locator('.palette-node').filter({ hasText: 'Start' }).first();
   58 |     const reactFlowPane = page.locator('.react-flow__pane');
   59 |
   60 |     // Drag start node to the canvas
   61 |     await startNode.dragTo(reactFlowPane, {
   62 |       targetPosition: { x: 200, y: 200 }
   63 |     });
   64 |
   65 |     // Check that a node was created
   66 |     await expect(page.locator('.react-flow__node')).toBeVisible();
   67 |   });
   68 |
   69 |   test('should display Mermaid text editor', async ({ page }) => {
   70 |     // Switch to Mermaid tab
   71 |     await page.click('button:has-text("Mermaid Code")');
   72 |
   73 |     // Check for Mermaid editor
   74 |     await expect(page.locator('textarea')).toBeVisible();
   75 |
   76 |     // Check that the tab is active
   77 |     await expect(page.locator('button').filter({ hasText: 'Mermaid Code' })).toHaveClass(/border-blue-500/);
   78 |   });
   79 |
   80 |   test('should allow text input in Mermaid editor', async ({ page }) => {
   81 |     // Switch to Mermaid tab
   82 |     await page.click('button:has-text("Mermaid Code")');
   83 |
   84 |     // Find the text input area
   85 |     const textArea = page.locator('textarea').first();
   86 |
   87 |     // Clear existing content and type some Mermaid syntax
   88 |     await textArea.clear();
   89 |     const mermaidCode = `graph TD
   90 |     A[Start] --> B[Process]
   91 |     B --> C[End]`;
   92 |
   93 |     await textArea.fill(mermaidCode);
   94 |
   95 |     // Verify the text was entered
   96 |     await expect(textArea).toHaveValue(mermaidCode);
   97 |   });
   98 |
   99 |   test('should have AI generation functionality', async ({ page }) => {
  100 |     // Look for AI input and button
  101 |     const aiInput = page.locator('input[placeholder*="Describe your diagram"]');
  102 |     const aiButton = page.locator('button:has-text("Generate")');
  103 |
  104 |     // Check if AI components are present
  105 |     await expect(aiInput).toBeVisible();
  106 |     await expect(aiButton).toBeVisible();
  107 |
  108 |     // Test AI input functionality
  109 |     await aiInput.fill('user login process');
  110 |     await expect(aiButton).toBeEnabled();
  111 |
  112 |     // Clear input and check button is disabled
  113 |     await aiInput.clear();
  114 |     await expect(aiButton).toBeDisabled();
  115 |   });
  116 |
  117 |   test('should be responsive on different screen sizes', async ({ page }) => {
  118 |     // Test tablet size
  119 |     await page.setViewportSize({ width: 768, height: 1024 });
  120 |     await expect(page.locator('h1').filter({ hasText: 'Diagram Editor' })).toBeVisible();
  121 |
  122 |     // Test mobile size
  123 |     await page.setViewportSize({ width: 375, height: 667 });
  124 |     await expect(page.locator('h1').filter({ hasText: 'Diagram Editor' })).toBeVisible();
  125 |
  126 |     // Test desktop size
  127 |     await page.setViewportSize({ width: 1920, height: 1080 });
  128 |     await expect(page.locator('h1').filter({ hasText: 'Diagram Editor' })).toBeVisible();
  129 |   });
  130 |
  131 |   test('should handle keyboard navigation', async ({ page }) => {
  132 |     // Test tab navigation
  133 |     await page.keyboard.press('Tab');
  134 |     
  135 |     // Check that focus moves through interactive elements
  136 |     const focusedElement = page.locator(':focus');
  137 |     await expect(focusedElement).toBeVisible();
  138 |   });
  139 |
  140 |   test('should load without JavaScript errors', async ({ page }) => {
```