import fs from 'fs';
import path from 'path';
import https from 'https';

/**
 * Video Podcast Maker - Workflow Module
 * Handles topic research and script generation with MiniMax LLM
 */

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'sk-cp-d5pjw60trdBAP0_6f8u-bCvOW7zN_1F4lDjEv8N3BjAeBMEyJPaK-2sJaEfd1rFgaOPnwQ3HM2cDrUFwH3C7AB2Cvofq-AGpTGVCaZdZ_psHwqkHBaf59RQ';
const MINIMAX_BASE_URL = 'api.minimax.chat';

/**
 * Call MiniMax API for LLM generation
 */
async function callMiniMax(prompt, systemPrompt = 'You are a helpful assistant.') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'MiniMax-M2.1',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const options = {
      hostname: MINIMAX_BASE_URL,
      path: '/v1/text/chatcompletion_v2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.choices && json.choices[0]) {
            resolve(json.choices[0].message.content);
          } else {
            reject(new Error('Invalid API response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Research a topic using web search (placeholder - integrate with actual search)
 */
export async function researchTopic(topic) {
  console.log(`🔍 Researching: ${topic}`);
  
  try {
    // Try to use MiniMax for research
    const prompt = `Research the topic "${topic}" and provide:
1. A brief summary (1-2 sentences)
2. 3-5 key points to cover
3. Any important sources or references

Format as JSON with keys: summary, keyPoints (array), sources (array)`;

    const response = await callMiniMax(prompt, 'You are a research assistant that provides structured information.');
    
    // Try to parse JSON from response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fall back to structured response
    }
    
    // Fallback if parsing fails
    return {
      topic,
      summary: response.substring(0, 200),
      keyPoints: ['Key point about ' + topic],
      sources: []
    };
  } catch (error) {
    console.warn(`⚠️ Research API failed, using fallback: ${error.message}`);
    // Fallback to basic structure
    return {
      topic,
      summary: `Research on: ${topic}`,
      keyPoints: [
        `Introduction to ${topic}`,
        `Main concepts and fundamentals`,
        `Practical applications and use cases`,
        `Best practices and tips`,
        `Conclusion and next steps`
      ],
      sources: []
    };
  }
}

/**
 * Generate a video script from research using MiniMax
 */
export async function generateScript(topic, research) {
  console.log(`✍️ Generating script for: ${topic}`);
  
  try {
    const prompt = `Create a video script for the topic "${topic}".

Research context:
- Summary: ${research.summary}
- Key points: ${research.keyPoints.join(', ')}

Create a video script with these sections:
1. Introduction (5 seconds) - Welcome viewers and introduce topic
2. Main content (3-5 sections, ~20 seconds each)
3. Conclusion (5 seconds) - Summarize and call to action

For each section provide:
- id: unique identifier (kebab-case)
- title: section title
- content: narration text ( conversational, suitable for TTS)
- duration: estimated seconds

Return as JSON array with objects containing: id, title, content, duration
Total duration should be around 60-90 seconds.`;

    const response = await callMiniMax(prompt, 'You are a professional video script writer. Create engaging, conversational scripts suitable for text-to-speech.');
    
    // Try to parse JSON
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const sections = JSON.parse(jsonMatch[0]);
        const totalDuration = sections.reduce((sum, s) => sum + (s.duration || 20), 0);
        
        return {
          title: topic,
          sections,
          totalDuration,
          createdAt: new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('⚠️ Script parsing failed, using fallback');
    }
  } catch (error) {
    console.warn(`⚠️ Script generation API failed: ${error.message}`);
  }
  
  // Fallback to basic script
  return generateFallbackScript(topic, research);
}

/**
 * Generate a basic fallback script
 */
function generateFallbackScript(topic, research) {
  const keyPoints = research.keyPoints || [];
  const sections = [
    {
      id: 'intro',
      title: 'Introduction',
      content: `Welcome! Today we're going to talk about ${topic}. ${research.summary || ''}`,
      duration: 5
    }
  ];
  
  // Add key points as sections
  keyPoints.slice(0, 4).forEach((point, i) => {
    sections.push({
      id: `main-${i + 1}`,
      title: point,
      content: `Now let's discuss ${point.toLowerCase()}. This is an important aspect of ${topic}.`,
      duration: 20
    });
  });
  
  sections.push({
    id: 'outro',
    title: 'Conclusion',
    content: `Thanks for watching! If you enjoyed this video about ${topic}, please like, share, and subscribe for more content like this!`,
    duration: 5
  });
  
  const totalDuration = sections.reduce((sum, s) => sum + s.duration, 0);
  
  return {
    title: topic,
    sections,
    totalDuration,
    createdAt: new Date().toISOString()
  };
}

/**
 * Get project root path
 */
export function getProjectRoot() {
  return path.resolve(process.cwd());
}

/**
 * Ensure output directories exist
 */
export function ensureOutputDirs() {
  const dirs = ['output', 'output/audio', 'output/video'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Validate script structure
 */
export function validateScript(script) {
  const errors = [];
  
  if (!script.title) {
    errors.push('Missing title');
  }
  
  if (!script.sections || !Array.isArray(script.sections)) {
    errors.push('Missing or invalid sections array');
  } else {
    script.sections.forEach((section, i) => {
      if (!section.id) errors.push(`Section ${i}: missing id`);
      if (!section.title) errors.push(`Section ${i}: missing title`);
      if (!section.content) errors.push(`Section ${i}: missing content`);
      if (!section.duration || section.duration <= 0) {
        errors.push(`Section ${i}: invalid duration`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
