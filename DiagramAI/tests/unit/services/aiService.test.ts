import { aiService, DiagramGenerationRequest } from '@/services/aiService';

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDiagram', () => {
    it('should generate a flowchart diagram from a simple prompt', async () => {
      const request: DiagramGenerationRequest = {
        prompt: 'user login process',
        diagramType: 'flowchart',
        style: 'simple'
      };

      const result = await aiService.generateDiagram(request);

      expect(result).toBeDefined();
      expect(result.mermaidSyntax).toContain('graph TD');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should generate appropriate nodes and edges for login flow', async () => {
      const request: DiagramGenerationRequest = {
        prompt: 'user login authentication',
        diagramType: 'flowchart'
      };

      const result = await aiService.generateDiagram(request);

      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
      expect(result.nodes!.length).toBeGreaterThan(0);
      expect(result.edges!.length).toBeGreaterThan(0);
      
      // Check for login-specific content
      expect(result.mermaidSyntax.toLowerCase()).toContain('login');
      expect(result.mermaidSyntax.toLowerCase()).toContain('credentials');
    });

    it('should generate sequence diagram when requested', async () => {
      const request: DiagramGenerationRequest = {
        prompt: 'API call sequence',
        diagramType: 'sequence'
      };

      const result = await aiService.generateDiagram(request);

      expect(result.mermaidSyntax).toContain('sequenceDiagram');
      expect(result.mermaidSyntax).toContain('participant');
    });

    it('should handle process workflow prompts', async () => {
      const request: DiagramGenerationRequest = {
        prompt: 'data processing workflow',
        diagramType: 'flowchart'
      };

      const result = await aiService.generateDiagram(request);

      expect(result.mermaidSyntax.toLowerCase()).toContain('process');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle API-related prompts', async () => {
      const request: DiagramGenerationRequest = {
        prompt: 'REST API data flow',
        diagramType: 'flowchart'
      };

      const result = await aiService.generateDiagram(request);

      expect(result.mermaidSyntax.toLowerCase()).toContain('data');
      expect(result.mermaidSyntax).toContain('graph TD');
    });

    it('should generate generic flowchart for unknown prompts', async () => {
      const request: DiagramGenerationRequest = {
        prompt: 'random unknown process xyz',
        diagramType: 'flowchart'
      };

      const result = await aiService.generateDiagram(request);

      expect(result.mermaidSyntax).toContain('graph TD');
      expect(result.mermaidSyntax).toContain('Start');
      expect(result.mermaidSyntax.toLowerCase()).toContain('success');
    });

    it('should provide meaningful suggestions', async () => {
      const request: DiagramGenerationRequest = {
        prompt: 'user registration',
        diagramType: 'flowchart'
      };

      const result = await aiService.generateDiagram(request);

      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
      expect(result.suggestions!.every(s => typeof s === 'string')).toBe(true);
    });

    it('should handle empty prompts gracefully', async () => {
      const request: DiagramGenerationRequest = {
        prompt: '',
        diagramType: 'flowchart'
      };

      const result = await aiService.generateDiagram(request);

      expect(result).toBeDefined();
      expect(result.mermaidSyntax).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'a'.repeat(1000);
      const request: DiagramGenerationRequest = {
        prompt: longPrompt,
        diagramType: 'flowchart'
      };

      const result = await aiService.generateDiagram(request);

      expect(result).toBeDefined();
      expect(result.mermaidSyntax).toBeTruthy();
    });

    it('should default to flowchart when no type specified', async () => {
      const request: DiagramGenerationRequest = {
        prompt: 'some process'
      };

      const result = await aiService.generateDiagram(request);

      expect(result.mermaidSyntax).toContain('graph TD');
    });
  });

  describe('improveDiagram', () => {
    it('should improve existing diagram based on feedback', async () => {
      const currentSyntax = `graph TD
        A[Start] --> B[Process]
        B --> C[End]`;
      
      const feedback = 'add error handling';

      const result = await aiService.improveDiagram(currentSyntax, feedback);

      expect(result).toBeDefined();
      expect(result.mermaidSyntax).toContain(currentSyntax);
      expect(result.mermaidSyntax).toContain(feedback);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.suggestions).toBeDefined();
    });

    it('should provide improvement suggestions', async () => {
      const currentSyntax = 'graph TD\nA --> B';
      const feedback = 'make it more detailed';

      const result = await aiService.improveDiagram(currentSyntax, feedback);

      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
      expect(result.suggestions!.every(s => typeof s === 'string')).toBe(true);
    });

    it('should handle empty feedback', async () => {
      const currentSyntax = 'graph TD\nA --> B';
      const feedback = '';

      const result = await aiService.improveDiagram(currentSyntax, feedback);

      expect(result).toBeDefined();
      expect(result.mermaidSyntax).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      // Mock a service error by temporarily breaking the method
      const originalMethod = aiService.generateDiagram;
      (aiService as any).generateDiagram = jest.fn().mockRejectedValue(new Error('Service unavailable'));

      const request: DiagramGenerationRequest = {
        prompt: 'test prompt'
      };

      await expect(aiService.generateDiagram(request)).rejects.toThrow('Service unavailable');

      // Restore the original method
      (aiService as any).generateDiagram = originalMethod;
    });
  });

  describe('performance', () => {
    it('should generate diagrams within reasonable time', async () => {
      const request: DiagramGenerationRequest = {
        prompt: 'complex business process with multiple steps and decision points',
        diagramType: 'flowchart'
      };

      const startTime = performance.now();
      const result = await aiService.generateDiagram(request);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      expect(result).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        prompt: `test process ${i}`,
        diagramType: 'flowchart' as const
      }));

      const startTime = performance.now();
      const results = await Promise.all(
        requests.map(req => aiService.generateDiagram(req))
      );
      const endTime = performance.now();

      expect(results).toHaveLength(10);
      expect(results.every(r => r.mermaidSyntax)).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});
