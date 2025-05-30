# Test info

- Name: Performance Tests >> should handle rapid user interactions
- Location: /mnt/network_repo/DiagramAI-1/DiagramAI/tests/e2e/performance.spec.ts:144:7

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 3000
Received:   3060
    at /mnt/network_repo/DiagramAI-1/DiagramAI/tests/e2e/performance.spec.ts:162:29
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
  - heading "Diagram Editor" [level=1]
  - paragraph: Create and edit diagrams with AI assistance
  - navigation:
    - button "🎨 Visual Editor"
    - button "📝 Mermaid Code"
  - text: "Visual Diagram Editor Nodes: 0 • Connections: 0"
  - button "📝 To Mermaid"
  - button "💾 Save"
  - button "Open Menu"
  - heading "Tools" [level=2]
  - button "✕"
  - button "🔷 Nodes"
  - button "📚 Layers"
  - button "🕒 History"
  - button "🔧Basic"
  - button "📊Flowchart"
  - button "🖥️System"
  - button "🔷Shapes"
  - text: ▶️ Start Start point of the process ⚙️ Process Process or action step ❓ Decision Decision or branching point ⏹️ End End point of the process
  - heading "Visual Editor" [level=2]
  - text: "Nodes: 5 Connections: 4"
  - button "📋 Copy" [disabled]
  - button "📄 Paste" [disabled]
  - button "🗑️ Delete" [disabled]
  - button "🤖 AI Chat"
  - button "🎨 Properties"
  - button "❓ Help"
  - button "Reset Demo"
  - button "Clear All"
  - button "💾 Save Diagram"
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
  - button "Selection Mode (Create selection boxes) - Press 'V'":
    - img
  - button "Pan Mode (Move the canvas) - Press 'H'":
    - img
  - img "React Flow mini map"
  - link "React Flow attribution":
    - /url: https://reactflow.dev
    - text: React Flow
  - button "🤖"
  - text: "Syntax Valid Last saved: Never Lines: 6 Characters: 121"
- contentinfo:
  - paragraph: © 2025 DiagramAI. AI-Powered Diagram Generation Platform.
- alert
```

# Test source

```ts
   62 |     
   63 |     console.log('Performance metrics:', metrics);
   64 |   });
   65 |
   66 |   test('should load editor page within performance budget', async ({ page }) => {
   67 |     const startTime = Date.now();
   68 |     
   69 |     await page.goto('/editor');
   70 |     await page.waitForLoadState('networkidle');
   71 |     
   72 |     // Wait for React Flow to be ready
   73 |     await page.waitForSelector('.react-flow', { state: 'visible' });
   74 |     
   75 |     const endTime = Date.now();
   76 |     const loadTime = endTime - startTime;
   77 |     
   78 |     // Editor page should load within 4 seconds (more complex)
   79 |     expect(loadTime).toBeLessThan(4000);
   80 |   });
   81 |
   82 |   test('should handle large diagrams efficiently', async ({ page }) => {
   83 |     await page.goto('/editor');
   84 |     await page.waitForSelector('.react-flow', { state: 'visible' });
   85 |     
   86 |     // Switch to Mermaid editor
   87 |     await page.click('button:has-text("Mermaid Code")');
   88 |     
   89 |     // Create a large diagram
   90 |     const largeDiagram = `graph TD
   91 | ${Array.from({ length: 50 }, (_, i) => `    A${i}[Node ${i}] --> A${i + 1}[Node ${i + 1}]`).join('\n')}`;
   92 |     
   93 |     const startTime = Date.now();
   94 |     
   95 |     // Input the large diagram
   96 |     const textarea = page.locator('textarea');
   97 |     await textarea.clear();
   98 |     await textarea.fill(largeDiagram);
   99 |     
  100 |     // Switch back to visual editor to render
  101 |     await page.click('button:has-text("Visual Editor")');
  102 |     
  103 |     // Wait for rendering to complete
  104 |     await page.waitForTimeout(1000);
  105 |     
  106 |     const endTime = Date.now();
  107 |     const renderTime = endTime - startTime;
  108 |     
  109 |     // Should render large diagram within 5 seconds
  110 |     expect(renderTime).toBeLessThan(5000);
  111 |   });
  112 |
  113 |   test('should maintain responsiveness during AI generation', async ({ page }) => {
  114 |     await page.goto('/editor');
  115 |
  116 |     // Open AI chatbox first
  117 |     await page.click('button[title*="Open AI Assistant"]');
  118 |     await page.waitForTimeout(500);
  119 |
  120 |     // Find AI input (textarea in chatbox)
  121 |     const aiInput = page.locator('textarea[placeholder*="Ask me about your diagram"]');
  122 |
  123 |     await aiInput.fill('complex business process with multiple decision points');
  124 |
  125 |     const startTime = Date.now();
  126 |
  127 |     // Send message (using arrow button or Enter key)
  128 |     await page.keyboard.press('Enter');
  129 |     
  130 |     // Check that UI remains responsive
  131 |     await page.click('button:has-text("Mermaid Code")');
  132 |     await page.click('button:has-text("Visual Editor")');
  133 |     
  134 |     // Wait for generation to complete (look for changes in the editor)
  135 |     await page.waitForTimeout(2000);
  136 |     
  137 |     const endTime = Date.now();
  138 |     const generationTime = endTime - startTime;
  139 |     
  140 |     // AI generation should complete within 10 seconds
  141 |     expect(generationTime).toBeLessThan(10000);
  142 |   });
  143 |
  144 |   test('should handle rapid user interactions', async ({ page }) => {
  145 |     await page.goto('/editor');
  146 |     await page.waitForSelector('.react-flow', { state: 'visible' });
  147 |     
  148 |     const startTime = Date.now();
  149 |     
  150 |     // Perform rapid tab switching
  151 |     for (let i = 0; i < 10; i++) {
  152 |       await page.click('button:has-text("Mermaid Code")');
  153 |       await page.waitForTimeout(50);
  154 |       await page.click('button:has-text("Visual Editor")');
  155 |       await page.waitForTimeout(50);
  156 |     }
  157 |     
  158 |     const endTime = Date.now();
  159 |     const interactionTime = endTime - startTime;
  160 |     
  161 |     // Rapid interactions should complete within 3 seconds
> 162 |     expect(interactionTime).toBeLessThan(3000);
      |                             ^ Error: expect(received).toBeLessThan(expected)
  163 |     
  164 |     // UI should still be functional
  165 |     await expect(page.locator('.react-flow')).toBeVisible();
  166 |   });
  167 |
  168 |   test('should maintain performance on mobile devices', async ({ page }) => {
  169 |     // Set mobile viewport
  170 |     await page.setViewportSize({ width: 375, height: 667 });
  171 |     
  172 |     const startTime = Date.now();
  173 |     
  174 |     await page.goto('/editor');
  175 |     await page.waitForLoadState('networkidle');
  176 |     
  177 |     const endTime = Date.now();
  178 |     const loadTime = endTime - startTime;
  179 |     
  180 |     // Mobile should load within 5 seconds (allowing for slower devices)
  181 |     expect(loadTime).toBeLessThan(5000);
  182 |     
  183 |     // Check that interactions are responsive on mobile
  184 |     await page.click('button:has-text("Mermaid Code")');
  185 |     await expect(page.locator('textarea')).toBeVisible();
  186 |     
  187 |     await page.click('button:has-text("Visual Editor")');
  188 |     await expect(page.locator('.react-flow')).toBeVisible();
  189 |   });
  190 |
  191 |   test('should handle memory efficiently', async ({ page }) => {
  192 |     await page.goto('/editor');
  193 |     
  194 |     // Monitor memory usage
  195 |     const initialMemory = await page.evaluate(() => {
  196 |       return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
  197 |     });
  198 |     
  199 |     // Perform memory-intensive operations
  200 |     for (let i = 0; i < 5; i++) {
  201 |       // Switch between editors
  202 |       await page.click('button:has-text("Mermaid Code")');
  203 |       await page.waitForTimeout(100);
  204 |       await page.click('button:has-text("Visual Editor")');
  205 |       await page.waitForTimeout(100);
  206 |       
  207 |       // Add some content to Mermaid editor instead (since AI input requires opening chatbox)
  208 |       await page.click('button:has-text("Mermaid Code")');
  209 |       await page.waitForTimeout(200); // Wait for tab switch
  210 |
  211 |       const mermaidInput = page.locator('textarea').first();
  212 |       await mermaidInput.fill(`graph TD\n  A${i}[Test ${i}] --> B${i}[End ${i}]`);
  213 |       await page.waitForTimeout(100);
  214 |       await mermaidInput.clear();
  215 |     }
  216 |     
  217 |     const finalMemory = await page.evaluate(() => {
  218 |       return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
  219 |     });
  220 |     
  221 |     // Memory usage should not increase dramatically
  222 |     if (initialMemory > 0 && finalMemory > 0) {
  223 |       const memoryIncrease = finalMemory - initialMemory;
  224 |       const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
  225 |       
  226 |       // Memory should not increase by more than 50%
  227 |       expect(memoryIncreasePercent).toBeLessThan(50);
  228 |     }
  229 |   });
  230 |
  231 |   test('should handle concurrent users simulation', async ({ browser }) => {
  232 |     // Simulate multiple concurrent users
  233 |     const contexts = await Promise.all([
  234 |       browser.newContext(),
  235 |       browser.newContext(),
  236 |       browser.newContext(),
  237 |     ]);
  238 |     
  239 |     const pages = await Promise.all(
  240 |       contexts.map(context => context.newPage())
  241 |     );
  242 |     
  243 |     const startTime = Date.now();
  244 |     
  245 |     // All users navigate to editor simultaneously
  246 |     await Promise.all(
  247 |       pages.map(page => page.goto('/editor'))
  248 |     );
  249 |     
  250 |     // All users wait for page to load
  251 |     await Promise.all(
  252 |       pages.map(page => page.waitForSelector('.react-flow', { state: 'visible' }))
  253 |     );
  254 |     
  255 |     const endTime = Date.now();
  256 |     const loadTime = endTime - startTime;
  257 |     
  258 |     // Concurrent loading should complete within 6 seconds
  259 |     expect(loadTime).toBeLessThan(6000);
  260 |     
  261 |     // Clean up
  262 |     await Promise.all(contexts.map(context => context.close()));
```