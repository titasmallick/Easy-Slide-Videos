import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper to perform natural sort
const naturalSort = (a, b) => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

// Check if file is image or video
const getMediaType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const imageExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.tiff', '.bmp', '.svg'];
  const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.avi'];
  
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  return null;
};

// Function to split text cleanly at sentence/paragraph/word boundaries
function splitText(text, maxChars = 450) {
  if (!text || text.trim().length <= maxChars) return [text || ""];
  
  const chunks = [];
  let remaining = text.trim();
  
  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }
    
    let splitIndex = -1;
    const searchString = remaining.substring(0, maxChars);
    
    // Look for paragraph or sentence end markers
    const markers = ['\n\n', '\n', '. ', '? ', '! '];
    for (const marker of markers) {
      const idx = searchString.lastIndexOf(marker);
      if (idx > splitIndex && idx > maxChars * 0.35) {
        splitIndex = idx + marker.length;
      }
    }
    
    // Fallback to space
    if (splitIndex === -1) {
      splitIndex = searchString.lastIndexOf(' ');
    }
    
    // Fallback to absolute split if no space
    if (splitIndex === -1 || splitIndex === 0) {
      splitIndex = maxChars;
    }
    
    chunks.push(remaining.substring(0, splitIndex).trim());
    remaining = remaining.substring(splitIndex).trim();
  }
  
  return chunks;
}

// Subtitle parser utility for VTT/SRT files
function parseSubtitleFile(content) {
  const normalized = content.replace(/\r\n/g, '\n');
  const blocks = normalized.split(/\n\s*\n/).filter(Boolean);
  const parsedLines = [];
  let maxEndTime = 0;

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const timeIndex = lines.findIndex(l => l.includes('-->'));
    if (timeIndex === -1) continue;

    const timeRange = lines[timeIndex];
    const textLines = lines.slice(timeIndex + 1);
    
    const [startStr, endStr] = timeRange.split('-->').map(t => t.trim());
    if (!startStr || !endStr) continue;

    const startTime = parseSubTime(startStr);
    const endTime = parseSubTime(endStr);
    if (isNaN(startTime) || isNaN(endTime)) continue;

    if (endTime > maxEndTime) {
      maxEndTime = endTime;
    }

    const lineText = textLines.join(' ').replace(/<[^>]+>/g, '').trim();
    if (!lineText) continue;

    const words = lineText.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    const duration = endTime - startTime;
    const wordDuration = duration / words.length;

    const lineWords = words.map((word, idx) => {
      return {
        text: word,
        relStart: startTime + (idx * wordDuration),
        relEnd: startTime + ((idx + 1) * wordDuration)
      };
    });

    parsedLines.push(lineWords);
  }

  return { lines: parsedLines, duration: maxEndTime };
}

function parseSubTime(timeStr) {
  const cleaned = timeStr.replace(/,/g, '.').trim();
  const parts = cleaned.split(':');
  
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  } else {
    return parseFloat(cleaned);
  }
}

async function scan() {
  console.log('Scanning assets directory...');
  const legacyAssetsDir = path.join(projectRoot, 'assets');
  const assetsDir = path.join(projectRoot, 'public', 'assets');
  
  if (fs.existsSync(legacyAssetsDir) && !fs.existsSync(assetsDir)) {
    console.log('Migrating legacy assets folder to public/assets for rendering efficiency...');
    fs.mkdirSync(path.join(projectRoot, 'public'), { recursive: true });
    fs.renameSync(legacyAssetsDir, assetsDir);
  }

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Load existing config if it exists
  const configPath = path.join(projectRoot, 'config.json');
  let existingConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log('Pre-loaded existing config.json to preserve manual overrides.');
    } catch (e) {
      console.warn('Error reading config.json, will use defaults.', e.message);
    }
  }

  // Determine character threshold from config or default to 450
  const maxChars = existingConfig?.video?.maxCharactersPerSlide || 450;
  console.log(`Text split character threshold: ${maxChars}`);

  // Find music files in assets/music or assets
  let musicPath = '';
  const musicDir = path.join(assetsDir, 'music');
  if (fs.existsSync(musicDir)) {
    const musicFiles = fs.readdirSync(musicDir).filter(f => f.toLowerCase().endsWith('.mp3') || f.toLowerCase().endsWith('.wav'));
    if (musicFiles.length > 0) {
      musicPath = `assets/music/${musicFiles[0]}`;
    }
  } else {
    // Look in assets root for any mp3
    const files = fs.readdirSync(assetsDir).filter(f => f.toLowerCase().endsWith('.mp3'));
    if (files.length > 0) {
      musicPath = `assets/${files[0]}`;
    }
  }

  // Scan for slide folders
  const folders = fs.readdirSync(assetsDir)
    .filter(f => {
      const fullPath = path.join(assetsDir, f);
      return fs.statSync(fullPath).isDirectory() && f !== 'music' && f !== 'branding' && f !== 'logo';
    })
    .sort(naturalSort);

  console.log(`Found ${folders.length} slide folders:`, folders);

  const scannedSlides = [];

  for (const folder of folders) {
    const folderPath = path.join(assetsDir, folder);
    const files = fs.readdirSync(folderPath);

    let heading = '';
    let subheading = '';
    let content = '';

    // 1. Detect and parse subtitle file (SRT/VTT)
    let subtitleData = null;
    const srtFile = files.find(f => f.toLowerCase().endsWith('.srt') || f.toLowerCase().endsWith('.vtt'));
    if (srtFile) {
      try {
        const srtContent = fs.readFileSync(path.join(folderPath, srtFile), 'utf-8');
        subtitleData = parseSubtitleFile(srtContent);
        console.log(`  [Subtitles] Found ${srtFile} in ${folder}. Duration: ${subtitleData.duration}s`);
      } catch (e) {
        console.warn(`  [Subtitles] Error parsing subtitles in ${folder}:`, e.message);
      }
    }

    // 2. Detect slide voiceovers
    let voiceover = null;
    const audioFiles = files.filter(f => ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac'].includes(path.extname(f).toLowerCase()));
    if (audioFiles.length > 0) {
      const voFile = audioFiles.find(f => f.toLowerCase().includes('voiceover')) || audioFiles[0];
      voiceover = `assets/${folder}/${voFile}`;
      console.log(`  [Voiceover] Found voiceover track: ${voiceover}`);
    }

    // 3. Gather all media files
    const mediaFiles = [];
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      if (fs.statSync(filePath).isDirectory()) continue;
      const type = getMediaType(file);
      if (type) {
        mediaFiles.push({ path: `assets/${folder}/${file}`, type });
      }
    }

    let media = null;
    let mediaType = null;
    let mediaList = [];
    if (mediaFiles.length > 0) {
      media = mediaFiles[0].path;
      mediaType = mediaFiles[0].type;
      mediaList = mediaFiles.map(m => m.path);
    }

    // 4. Check text files
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      if (fs.statSync(filePath).isDirectory()) continue;

      const lowerFile = file.toLowerCase();
      if (lowerFile.endsWith('.txt')) {
        const textContent = fs.readFileSync(filePath, 'utf-8').trim();
        
        if (lowerFile === 'nametext.txt' || lowerFile === 'heading.txt' || lowerFile === 'title.txt') {
          const lines = textContent.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 0) {
            heading = lines[0];
            if (lines.length > 1) {
              content = lines.slice(1).join('\n');
            }
          }
        } else if (lowerFile === 'subheading.txt' || lowerFile === 'subtitle.txt') {
          subheading = textContent;
        } else if (lowerFile === 'descriptive_text.txt' || lowerFile === 'content.txt') {
          content = textContent;
        } else {
          if (!content) {
            content = textContent;
          }
        }
      }
    }

    // If subtitle exists but content doesn't, reconstruct content from subtitle cues
    if (subtitleData && !content) {
      content = subtitleData.lines.map(line => line.map(w => w.text).join(' ')).join(' ');
    }

    // Set heading fallback to folder name if nothing is set
    if (!heading && !content) {
      heading = folder.toUpperCase();
    }

    // Split text into chunks if it exceeds the limit (only if subtitles are NOT present)
    const textChunks = subtitleData ? [content] : splitText(content, maxChars);
    let accumulatedOffset = 0;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const isFirst = i === 0;
      
      const slideId = isFirst 
        ? folder.replace(/\s+/g, '_').toLowerCase()
        : `${folder.replace(/\s+/g, '_').toLowerCase()}_part${i + 1}`;

      const slideHeading = isFirst 
        ? heading 
        : (heading ? `${heading} (Contd.)` : '');

      // Slide duration calibration
      let durationInSeconds = mediaType === 'video' ? 8 : 5;
      if (subtitleData) {
        durationInSeconds = subtitleData.duration;
      }

      // Layout configuration
      let layout = 'split-media-right';
      if (mediaList.length > 1) {
        layout = 'grid-collage';
      } else if (!media) {
        layout = 'text-only';
      }

      const slideObject = {
        id: slideId,
        folder,
        media,
        mediaType,
        heading: slideHeading,
        subheading,
        content: chunk,
        durationInSeconds,
        mediaStartFromInSeconds: mediaType === 'video' ? accumulatedOffset : 0,
        layout,
        transition: 'fade'
      };

      if (voiceover) {
        slideObject.voiceover = voiceover;
      }
      if (mediaList.length > 0) {
        slideObject.mediaList = mediaList;
      }
      if (subtitleData) {
        slideObject.lines = subtitleData.lines;
      }

      scannedSlides.push(slideObject);
      accumulatedOffset += durationInSeconds;
    }
  }

  // Define defaultConfig template
  const defaultConfig = {
    video: {
      width: 1920,
      height: 1080,
      fps: 30,
      maxCharactersPerSlide: 450,
      themeName: 'royal-indigo',
      theme: {},
      fontFamily: 'outfit',
      fontWeight: '600',
      disableAnimations: false,
      iconName: 'Music',
      progressBar: {
        show: true,
        position: 'bottom',
        color: '',
        height: 8
      }
    },
    audio: {
      musicPath: musicPath || 'assets/music/background.mp3',
      volume: 0.1,
      loop: true,
      fadeInInSeconds: 2,
      fadeOutInSeconds: 2
    },
    branding: {
      showLogo: true,
      logoPath: '',
      logoText: 'SLIDESHOW ENGINE',
      position: 'top-left',
      size: 50,
      opacity: 0.9,
      persistent: true,
      authorName: 'Easy-Slide-Videos',
      badgeText: 'DEMO'
    },
    titlePage: {
      show: true,
      title: 'Dynamic Presentation Generator',
      subtitle: 'Create high-fidelity videos from slide structures',
      durationInSeconds: 3,
      theme: {
        background: 'linear-gradient(135deg, #0a0d14 0%, #1a103c 100%)',
        textColor: '#f8fafc',
        subtitleColor: '#94a3b8'
      }
    },
    slides: [],
    endPage: {
      show: true,
      title: 'Easy-Slide-Videos',
      subtitle: 'Automate slideshow rendering with React and Remotion',
      contact: 'https://github.com/titasmallick/Easy-Slide-Videos',
      website: 'github.com',
      durationInSeconds: 4,
      theme: {
        background: 'linear-gradient(135deg, #1a103c 0%, #0a0d14 100%)',
        textColor: '#f8fafc',
        subtitleColor: '#94a3b8'
      }
    }
  };

  const config = { ...defaultConfig, ...existingConfig };
  
  // Clean merge of config fields
  config.video = { ...defaultConfig.video, ...config.video };
  config.audio = { ...defaultConfig.audio, ...config.audio };
  if (musicPath && !config.audio.musicPath) {
    config.audio.musicPath = musicPath;
  }
  config.branding = { ...defaultConfig.branding, ...config.branding };
  config.titlePage = { ...defaultConfig.titlePage, ...config.titlePage };
  config.endPage = { ...defaultConfig.endPage, ...config.endPage };

  // Merge slides based on unique slide ID and compute startTime dynamically
  const existingSlides = config.slides || [];
  const existingMap = new Map(existingSlides.map(s => [s.id, s]));

  let currentStartTime = config.titlePage.show ? (config.titlePage.durationInSeconds || 4) : 0;

  config.slides = scannedSlides.map(scanned => {
    const existing = existingMap.get(scanned.id);
    const mergedSlide = existing ? {
      ...scanned,
      subheading: existing.subheading ?? scanned.subheading,
      durationInSeconds: existing.durationInSeconds ?? scanned.durationInSeconds,
      layout: existing.layout || scanned.layout,
      transition: existing.transition || scanned.transition,
      mediaStartFromInSeconds: existing.mediaStartFromInSeconds ?? scanned.mediaStartFromInSeconds,
      voiceover: existing.voiceover ?? scanned.voiceover,
      mediaList: existing.mediaList ?? scanned.mediaList,
      lines: existing.lines ?? scanned.lines,
      chart: existing.chart ?? scanned.chart,
      fontWeight: existing.fontWeight ?? scanned.fontWeight,
      headingFontWeight: existing.headingFontWeight ?? scanned.headingFontWeight,
      subheadingFontWeight: existing.subheadingFontWeight ?? scanned.subheadingFontWeight,
      textAlign: existing.textAlign ?? scanned.textAlign,
      fontSize: existing.fontSize ?? scanned.fontSize,
      headingFontSize: existing.headingFontSize ?? scanned.headingFontSize,
      subheadingFontSize: existing.subheadingFontSize ?? scanned.subheadingFontSize,
      textShadow: existing.textShadow ?? scanned.textShadow,
      textStroke: existing.textStroke ?? scanned.textStroke,
      transitionDurationInSeconds: existing.transitionDurationInSeconds ?? scanned.transitionDurationInSeconds,
      overlayOpacity: existing.overlayOpacity ?? scanned.overlayOpacity
    } : scanned;

    mergedSlide.startTime = currentStartTime;
    currentStartTime += mergedSlide.durationInSeconds;
    return mergedSlide;
  });

  config.endPage.startTime = currentStartTime;

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  console.log(`Saved configuration to: ${configPath}`);

  // Also synchronize config-reels.json with updated slides
  const configReelsPath = path.join(projectRoot, 'config-reels.json');
  if (fs.existsSync(configReelsPath)) {
    try {
      const reelsConfig = JSON.parse(fs.readFileSync(configReelsPath, 'utf-8'));
      reelsConfig.slides = config.slides;
      reelsConfig.audio = config.audio;
      reelsConfig.branding = config.branding;
      reelsConfig.endPage = config.endPage;
      reelsConfig.video = {
        ...config.video,
        width: 1080,
        height: 1920,
        themeName: reelsConfig.video?.themeName || config.video.themeName
      };
      fs.writeFileSync(configReelsPath, JSON.stringify(reelsConfig, null, 2), 'utf-8');
      console.log(`Synchronized config-reels.json with updated slides!`);
    } catch (e) {
      console.warn('Failed to sync config-reels.json:', e.message);
    }
  }
}

scan().catch(console.error);
