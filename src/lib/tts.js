import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

/**
 * Generate TTS audio files using Python script
 */
export async function generateTTS(script, provider = 'azure') {
  const outputDir = path.resolve('./output/audio');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const audioFiles = [];
  
  // Process each section
  for (const section of script.sections) {
    const audioPath = path.join(outputDir, `${section.id}.wav`);
    
    console.log(`Generating audio for: ${section.title}`);
    
    // Call Python TTS script
    try {
      const pythonScript = path.join(
        path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url)))), 
        'generate_tts.py'
      );
      
      const cmd = `python3 "${pythonScript}" --text "${section.content}" --output "${audioPath}" --provider ${provider}`;
      execSync(cmd, { stdio: 'inherit' });
      
      audioFiles.push(audioPath);
    } catch (e) {
      console.warn(`⚠️ TTS generation failed for ${section.title}, using placeholder`);
      // Create empty placeholder
      fs.writeFileSync(audioPath, Buffer.alloc(0));
      audioFiles.push(audioPath);
    }
  }
  
  // Generate timing.json
  const timing = {};
  let currentTime = 0;
  for (const section of script.sections) {
    timing[section.id] = {
      start: currentTime,
      duration: section.duration
    };
    currentTime += section.duration;
  }
  
  fs.writeFileSync(
    path.resolve('./output/timing.json'), 
    JSON.stringify(timing, null, 2)
  );
  
  return audioFiles;
}

function fileURLToPath(url) {
  return url.replace('file://', '');
}

/**
 * Mix audio with background music
 */
export async function mixAudio(audioFiles, bgmPath, outputPath) {
  const inputList = audioFiles.map(f => `file '${f}'`).join('\n');
  const listPath = path.join(os.tmpdir(), 'concat_list.txt');
  
  fs.writeFileSync(listPath, inputList);
  
  // Concatenate audio files
  const concatPath = path.join(os.tmpdir(), 'concatenated.wav');
  execSync(`ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${concatPath}"`, {
    stdio: 'inherit'
  });
  
  // Mix with BGM
  execSync(
    `ffmpeg -i "${concatPath}" -i "${bgmPath}" -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2" -c:a pcm_s16le "${outputPath}"`,
    { stdio: 'inherit' }
  );
  
  // Cleanup
  fs.unlinkSync(listPath);
  fs.unlinkSync(concatPath);
  
  return outputPath;
}
