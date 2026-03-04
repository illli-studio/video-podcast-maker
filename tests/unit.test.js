import { describe, it, expect } from 'vitest';
import { validateScript, getProjectRoot } from '../src/lib/workflow.js';
import { validateTTSOutput } from '../src/lib/tts.js';
import path from 'path';

describe('Workflow Module', () => {
  describe('validateScript', () => {
    it('should validate a correct script', () => {
      const script = {
        title: 'Test Video',
        sections: [
          { id: 'intro', title: 'Intro', content: 'Welcome', duration: 5 },
          { id: 'main', title: 'Main', content: 'Content here', duration: 20 },
          { id: 'outro', title: 'Outro', content: 'Bye', duration: 5 }
        ]
      };
      
      const result = validateScript(script);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject script without title', () => {
      const script = {
        sections: [
          { id: 'intro', title: 'Intro', content: 'Welcome', duration: 5 }
        ]
      };
      
      const result = validateScript(script);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing title');
    });
    
    it('should reject script without sections', () => {
      const script = {
        title: 'Test'
      };
      
      const result = validateScript(script);
      expect(result.valid).toBe(false);
    });
    
    it('should reject sections without required fields', () => {
      const script = {
        title: 'Test',
        sections: [
          { id: 'intro' } // missing title, content, duration
        ]
      };
      
      const result = validateScript(script);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('getProjectRoot', () => {
    it('should return absolute path', () => {
      const root = getProjectRoot();
      expect(path.isAbsolute(root)).toBe(true);
    });
  });
});

describe('TTS Module', () => {
  describe('validateTTSOutput', () => {
    it('should fail for non-existent directory', () => {
      const result = validateTTSOutput('/non/existent/path');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
