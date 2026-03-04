import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

/**
 * Video Podcast Maker - TTS Module
 * Handles text-to-speech generation
 */

/**
 * Generate TTS audio files using Python script
 */
export async function generateTTS(script, provider = 'azure') {
  const outputDir = path.resolve('./output/audio');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const audioFiles = [];
  const errors = [];
  
  // Get the Python script path
  const pythonScript = getPythonScriptPath();
  
  // Process each section
  for (const section of script.sections) {
    const audioPath = path.join(outputDir, `${section.id}.wav`);
    const textLength = section.content.length;
    
    console.log(`🎙️ Generating: ${section.title} (${textLength} chars)`);
    
    // Skip empty sections
    if (!section.content || section.content.trim().length === 0) {
      console.warn(`⚠️ Skipping empty section: ${section.id}`);
      continue;
    }
    
    try {
      // Call Python TTS script
      const cmd = buildTTSCommand(pythonScript, section.content, audioPath, provider);
      execSync(cmd, { stdio: 'inherit' });
      
      audioFiles.push(audioPath);
      console.log(`✅ Generated: ${path.basename(audioPath)}`);
    } catch (e) {
      const errorMsg = `Failed to generate audio for ${section.title}: ${e.message}`;
      console.warn(`⚠️ ${errorMsg}`);
      errors.push(errorMsg);
      
      // Create placeholder file
      fs.writeFileSync(audioPath, Buffer.alloc(0));
      audioFiles.push(audioPath);
    }
  }
  
  // Generate timing.json
  const timing = generateTiming(script);
  fs.writeFileSync(
    path.resolve('./output/timing.json'), 
    JSON.stringify(timing, null, 2)
  );
  
  console.log(`\n📊 Generated ${audioFiles.length} audio files, ${errors.length} errors`);
  
  return {
    audioFiles,
    errors,
    timing
  };
}

/**
 * Build TTS command based on provider
 */
function buildTTSCommand(scriptPath, text, outputPath, provider) {
  // Escape text for shell
  const escapedText = text.replace(/"/g, '\\"');
  
  switch (provider) {
    case 'cosyvoice':
      return `python3 "${scriptPath}" --text "${escapedText}" --output "${outputPath}" --provider cosyvoice`;
    case 'azure':
    default:
      return `python3 "${scriptPath}" --text "${escapedText}" --output "${outputPath}" --provider azure`;
  }
}

/**
 * Get Python script path
 */
function getPythonScriptPath() {
  const possiblePaths = [
    path.join(process.cwd(), 'generate_tts.py'),
    path.join(__dirname, '../../generate_tts.py'),
    path.join(os.homedir(), '.openclaw/workspace/video-podcast-maker/generate_tts.py')
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  
  return possiblePaths[0];
}

/**
 * Generate timing JSON from script
 */
function generateTiming(script) {
  const timing = {};
  let currentTime = 0;
  
  for (const section of script.sections) {
    timing[section.id] = {
      start: currentTime,
      duration: section.duration || 20,
      title: section.title
    };
    currentTime += section.duration || 20;
  }
  
  return timing;
}

/**
 * Mix audio with background music
 */
export async function mixAudio(audioFiles, bgmPath, outputPath) {
  if (!audioFiles || audioFiles.length === 0) {
    throw new Error('No audio files to mix');
  }
  
  if (!fs.existsSync(bgmPath)) {
    throw new Error(`BGM file not found: ${bgmPath}`);
  }
  
  console.log(`🎵 Mixing ${audioFiles.length} audio files with BGM...`);
  
  const inputList = audioFiles.map(f => `file '${f}'`).join('\n');
  const listPath = path.join(os.tmpdir(), 'concat_list.txt');
  
  fs.writeFileSync(listPath, inputList);
  
  // Concatenate audio files
  const concatPath = path.join(os.tmpdir(), 'concatenated.wav');
  try {
    execSync(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${concatPath}"`, {
      stdio: 'inherit'
    });
    
    // Mix with BGM
    execSync(
      `ffmpeg -y -i "${concatPath}" -i "${bgmPath}" -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2" -c:a pcm_s16le "${outputPath}"`,
      { stdio: 'inherit' }
    );
  } finally {
    // Cleanup
    try {
      fs.unlinkSync(listPath);
      fs.unlinkSync(concatPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
  
  return outputPath;
}

/**
 * Validate TTS output
 */
export function validateTTSOutput(audioDir) {
  const results = {
    valid: true,
    files: [],
    errors: []
  };
  
  if (!fs.existsSync(audioDir)) {
    results.valid = false;
    results.errors.push(`Audio directory not found: ${audioDir}`);
    return results;
  }
  
  const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.wav'));
  
  for (const file of files) {
    const filePath = path.join(audioDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.size === 0) {
      results.valid = false;
      results.errors.push(`Empty audio file: ${file}`);
    }
    
    results.files.push({
      name: file,
      size: stats.size,
      valid: stats.size > 0
    });
  }
  
  return results;
}
