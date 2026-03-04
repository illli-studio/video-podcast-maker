import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import os from 'os';

/**
 * Video Podcast Maker - TTS Module
 * Handles text-to-speech generation with multiple providers
 */

/**
 * TTS Provider configuration
 */
const PROVIDERS = {
  azure: {
    name: 'Azure Speech',
    defaultVoice: 'zh-CN-XiaoxiaoNeural'
  },
  cosyvoice: {
    name: 'CosyVoice',
    defaultVoice: 'celebrity-speech'
  }
};

/**
 * Generate TTS audio files using Python script
 */
export async function generateTTS(script, provider = 'azure', options = {}) {
  const outputDir = path.resolve('./output/audio');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const audioFiles = [];
  const errors = [];
  const config = loadTTSConfig(provider);
  
  // Get the Python script path
  const pythonScript = getPythonScriptPath();
  
  console.log(`🎙️ Generating TTS with ${PROVIDERS[provider]?.name || provider}...`);
  
  // Process each section
  for (const section of script.sections) {
    const audioPath = path.join(outputDir, `${section.id}.wav`);
    const textLength = section.content?.length || 0;
    
    console.log(`  📄 ${section.title} (${textLength} chars)`);
    
    // Skip empty sections
    if (!section.content || section.content.trim().length === 0) {
      console.warn(`  ⚠️ Skipping empty section: ${section.id}`);
      continue;
    }
    
    try {
      // Call Python TTS script
      const cmd = buildTTSCommand(pythonScript, section.content, audioPath, provider, config);
      
      execSync(cmd, { 
        stdio: options.verbose ? 'inherit' : 'pipe',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      
      // Verify output file exists and has content
      if (fs.existsSync(audioPath) && fs.statSync(audioPath).size > 0) {
        audioFiles.push(audioPath);
        console.log(`  ✅ ${path.basename(audioPath)}`);
      } else {
        throw new Error('Output file empty or not created');
      }
    } catch (e) {
      const errorMsg = `Failed: ${section.title} - ${e.message}`;
      console.warn(`  ❌ ${errorMsg}`);
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
  
  // Generate summary
  const validCount = audioFiles.length - errors.length;
  console.log(`\n📊 TTS Generation Summary:`);
  console.log(`   Total: ${audioFiles.length}`);
  console.log(`   Success: ${validCount}`);
  console.log(`   Failed: ${errors.length}`);
  
  return {
    audioFiles,
    errors,
    timing,
    provider,
    success: errors.length === 0
  };
}

/**
 * Load TTS configuration
 */
function loadTTSConfig(provider) {
  const config = {};
  
  // Try environment variables first
  if (provider === 'azure') {
    config.key = process.env.AZURE_SPEECH_KEY;
    config.region = process.env.AZURE_SPEECH_REGION || 'eastus';
  } else if (provider === 'cosyvoice') {
    config.key = process.env.COSYVOICE_KEY;
  }
  
  // Try config file
  const configPath = path.join(os.homedir(), '.video-podcast-maker.json');
  if (fs.existsSync(configPath)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (provider === 'azure' && !config.key) {
        config.key = fileConfig.azureSpeechKey;
        config.region = fileConfig.azureSpeechRegion || 'eastus';
      } else if (provider === 'cosyvoice' && !config.key) {
        config.key = fileConfig.cosyVoiceKey;
      }
    } catch (e) {
      // Ignore
    }
  }
  
  return config;
}

/**
 * Build TTS command based on provider
 */
function buildTTSCommand(scriptPath, text, outputPath, provider, config) {
  // Escape text for shell
  const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');
  
  let cmd = `python3 "${scriptPath}" --text "${escapedText}" --output "${outputPath}" --provider ${provider}`;
  
  if (provider === 'azure' && config.key) {
    cmd += ` --key "${config.key}" --region ${config.region || 'eastus'}`;
  } else if (provider === 'cosyvoice' && config.key) {
    cmd += ` --key "${config.key}"`;
  }
  
  return cmd;
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
export async function mixAudio(audioFiles, bgmPath, outputPath, options = {}) {
  const { fadeIn = 2, fadeOut = 2, bgmVolume = 0.3 } = options;
  
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
    
    // Mix with BGM with fade effects
    const fadeFilter = `afade=t=in:st=0:d=${fadeIn},afade=t=out:st=-${fadeOut}:d=${fadeOut}`;
    const mixFilter = `[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2:weights=${1 - bgmVolume}|${bgmVolume}`;
    
    execSync(
      `ffmpeg -y -i "${concatPath}" -i "${bgmPath}" -filter_complex "${fadeFilter};${mixFilter}" -c:a pcm_s16le "${outputPath}"`,
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
  
  if (files.length === 0) {
    results.valid = false;
    results.errors.push('No audio files found');
    return results;
  }
  
  for (const file of files) {
    const filePath = path.join(audioDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.size === 0) {
      results.valid = false;
      results.errors.push(`Empty audio file: ${file}`);
      results.files.push({ name: file, size: 0, valid: false });
    } else {
      results.files.push({ name: file, size: stats.size, valid: true });
    }
  }
  
  return results;
}

/**
 * Get available TTS providers
 */
export function getProviders() {
  return PROVIDERS;
}

/**
 * Check TTS configuration
 */
export function checkTTSConfig(provider = 'azure') {
  const config = loadTTSConfig(provider);
  const configured = !!config.key;
  
  return {
    provider,
    configured,
    message: configured 
      ? `${PROVIDERS[provider]?.name} is configured` 
      : `${PROVIDERS[provider]?.name} is NOT configured. Run: video-podcast-maker config`
  };
}
