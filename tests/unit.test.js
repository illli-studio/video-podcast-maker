import { describe, it, expect } from 'vitest';
import { validateScript, getProjectRoot, ensureOutputDirs, loadConfig, saveConfig } from '../src/lib/workflow.js';
import { validateTTSOutput, getProviders, checkTTSConfig } from '../src/lib/tts.js';
import path from 'path';
import fs from 'fs';
import os from 'os';

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
    
    it('should reject invalid duration', () => {
      const script = {
        title: 'Test',
        sections: [
          { id: 'intro', title: 'Intro', content: 'Welcome', duration: -5 }
        ]
      };
      
      const result = validateScript(script);
      expect(result.valid).toBe(false);
    });
  });
  
  describe('getProjectRoot', () => {
    it('should return absolute path', () => {
      const root = getProjectRoot();
      expect(path.isAbsolute(root)).toBe(true);
    });
    
    it('should return current working directory', () => {
      const root = getProjectRoot();
      expect(root).toBe(process.cwd());
    });
  });
  
  describe('ensureOutputDirs', () => {
    it('should be a function', () => {
      expect(typeof ensureOutputDirs).toBe('function');
    });
  });
  
  describe('loadConfig', () => {
    it('should return an object', () => {
      const config = loadConfig();
      expect(typeof config).toBe('object');
    });
    
    it('should include azureSpeechRegion', () => {
      const config = loadConfig();
      expect(config).toHaveProperty('azureSpeechRegion');
    });
  });
  
  describe('saveConfig', () => {
    it('should save config to file', () => {
      const testConfig = { testKey: 'testValue' };
      const result = saveConfig(testConfig);
      expect(result).toBe(true);
      
      // Verify saved
      const configPath = path.join(os.homedir(), '.video-podcast-maker.json');
      if (fs.existsSync(configPath)) {
        const saved = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        expect(saved.testKey).toBe('testValue');
      }
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
  
  describe('getProviders', () => {
    it('should return providers object', () => {
      const providers = getProviders();
      expect(providers).toHaveProperty('azure');
      expect(providers).toHaveProperty('cosyvoice');
    });
    
    it('should have correct provider names', () => {
      const providers = getProviders();
      expect(providers.azure.name).toBe('Azure Speech');
      expect(providers.cosyvoice.name).toBe('CosyVoice');
    });
  });
  
  describe('checkTTSConfig', () => {
    it('should return config status', () => {
      const result = checkTTSConfig('azure');
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('configured');
      expect(result).toHaveProperty('message');
    });
  });
});
