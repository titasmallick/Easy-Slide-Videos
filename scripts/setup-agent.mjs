import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper to perform natural sort
const naturalSort = (a, b) => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

// Colors for terminal styling
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fgBlack: '\x1b[30m',
  fgRed: '\x1b[31m',
  fgGreen: '\x1b[32m',
  fgYellow: '\x1b[33m',
  fgBlue: '\x1b[34m',
  fgMagenta: '\x1b[35m',
  fgCyan: '\x1b[36m',
  fgWhite: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Helper: confirm y/n question
async function confirm(rl, questionText, defaultYes = true) {
  const suffix = defaultYes ? ' (Y/n)' : ' (y/N)';
  const ans = await rl.question(`${colors.bright}${questionText}${suffix}:${colors.reset} `);
  if (!ans.trim()) return defaultYes;
  return ans.trim().toLowerCase().startsWith('y');
}

// Helper: clean slide folders starting with 'slide' or 'folder'
function cleanOldSlides(assetsDir) {
  if (!fs.existsSync(assetsDir)) return;
  const items = fs.readdirSync(assetsDir);
  let cleanedAny = false;
  for (const item of items) {
    const fullPath = path.join(assetsDir, item);
    if (fs.statSync(fullPath).isDirectory() && (item.toLowerCase().startsWith('slide') || item.toLowerCase().startsWith('folder'))) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`${colors.dim}Wiped directory: assets/${item}${colors.reset}`);
      cleanedAny = true;
    }
  }
  return cleanedAny;
}

// Main setup function
async function runSetup() {
  const rl = readline.createInterface({ input, output });
  
  console.clear();
  console.log(`${colors.fgCyan}${colors.bright}================================================================`);
  console.log(`🤖   BALERKAJ BOT: INTERACTIVE VIDEO ENGINE ASSISTANT   🤖`);
  console.log(`================================================================${colors.reset}\n`);
  
  console.log(`Hello sir, I am Balerkaj Bot! Let me guide you through setting up`);
  console.log(`and rendering your customized video presentation today.\n`);

  const legacyAssetsDir = path.join(projectRoot, 'assets');
  const assetsDir = path.join(projectRoot, 'public', 'assets');
  
  if (fs.existsSync(legacyAssetsDir) && !fs.existsSync(assetsDir)) {
    console.log('Migrating legacy assets folder to public/assets for rendering efficiency...');
    fs.mkdirSync(path.join(projectRoot, 'public'), { recursive: true });
    fs.renameSync(legacyAssetsDir, assetsDir);
  }

  const configPath = path.join(projectRoot, 'config.json');

  // STEP 1: DETECT OLD RESIDUES
  if (fs.existsSync(assetsDir)) {
    const oldFolders = fs.readdirSync(assetsDir).filter(item => {
      const fullPath = path.join(assetsDir, item);
      return fs.statSync(fullPath).isDirectory() && (item.toLowerCase().startsWith('slide') || item.toLowerCase().startsWith('folder'));
    }).sort(naturalSort);

    if (oldFolders.length > 0) {
      console.log(`${colors.fgYellow}${colors.bright}🔍 Old Residues Detected!${colors.reset}`);
      console.log(`The following existing slide directories were found in the assets folder:`);
      console.log(` 👉 [ ${oldFolders.join(', ')} ]\n`);
      
      const shouldWipe = await confirm(rl, "Would you like to start a brand new project and wipe out these old slides?", true);
      if (shouldWipe) {
        cleanOldSlides(assetsDir);
        if (fs.existsSync(configPath)) {
          fs.rmSync(configPath, { force: true });
          console.log(`${colors.dim}Removed old config.json${colors.reset}`);
        }
        console.log(`${colors.fgGreen}🧹 Clean slate ready! Old directories deleted successfully.${colors.reset}\n`);
      } else {
        console.log(`${colors.fgBlue}ℹ️ Keeping old slides. New entries will be merged non-destructively.${colors.reset}\n`);
      }
    }
  }

  // Load configuration template or existing settings
  let currentConfig = {
    video: { width: 1920, height: 1080, fps: 30, maxCharactersPerSlide: 450, themeName: 'royal-indigo', theme: {} },
    audio: { musicPath: '', volume: 0.1, loop: true, fadeInInSeconds: 2, fadeOutInSeconds: 2 },
    branding: { showLogo: true, logoPath: '', logoText: 'TITAS SIR BIOLOGY', position: 'top-left', size: 50, opacity: 0.9, persistent: true },
    titlePage: { show: true, style: 'standard', title: 'Dynamic Scientific Presentation', subtitle: 'Visualizing Knowledge with Precision', durationInSeconds: 3, theme: { background: 'linear-gradient(135deg, #0a0d14 0%, #1a103c 100%)', textColor: '#f8fafc', subtitleColor: '#d5d4ff' } },
    slides: [],
    endPage: { show: true, style: 'standard', title: 'Biology Tuition Classes', subtitle: 'Stop Memorizing. Start Scoring.', contact: 'Call: +91 9123774239', website: 'titassir.eugenicserudite.xyz', durationInSeconds: 4, theme: { background: 'linear-gradient(135deg, #1a103c 0%, #0a0d14 100%)', textColor: '#f8fafc', subtitleColor: '#ffbbfe' } }
  };

  if (fs.existsSync(configPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      currentConfig = { ...currentConfig, ...parsed };
      console.log(`${colors.dim}Loaded existing video parameters from config.json.${colors.reset}\n`);
    } catch (e) {
      console.warn('Error reading config.json, using defaults.', e.message);
    }
  }

  // STEP 2: GENERAL PROJECT SETTINGS
  console.log(`${colors.fgMagenta}${colors.bright}--- [Step 1: General Video Details] ---${colors.reset}`);
  
  // Aspect ratio select
  console.log(`Select Video Aspect Ratio / Format:`);
  console.log(`  [1] Landscape (16:9 - 1920x1080)`);
  console.log(`  [2] Portrait (9:16 - 1080x1920) - Shorts/Reels`);
  console.log(`  [3] Square (1:1 - 1080x1080)`);
  console.log(`  [4] Custom`);
  const aspectChoice = await rl.question(`Choose an option (1-4) [Default: 1]: `) || "1";
  
  if (aspectChoice === '2') {
    currentConfig.video.width = 1080;
    currentConfig.video.height = 1920;
  } else if (aspectChoice === '3') {
    currentConfig.video.width = 1080;
    currentConfig.video.height = 1080;
  } else if (aspectChoice === '4') {
    currentConfig.video.width = parseInt(await rl.question(`Enter Width in px [Current: ${currentConfig.video.width}]: `) || `${currentConfig.video.width}`, 10);
    currentConfig.video.height = parseInt(await rl.question(`Enter Height in px [Current: ${currentConfig.video.height}]: `) || `${currentConfig.video.height}`, 10);
  } else {
    currentConfig.video.width = 1920;
    currentConfig.video.height = 1080;
  }
  
  currentConfig.titlePage.title = await rl.question(`🎥 Video Main Title [Current: "${currentConfig.titlePage.title}"]: `) || currentConfig.titlePage.title;
  currentConfig.titlePage.subtitle = await rl.question(`📝 Title Subtitle [Current: "${currentConfig.titlePage.subtitle}"]: `) || currentConfig.titlePage.subtitle;
  
  console.log(`\nTitle Styles: standard, minimalist, thumbnail, glassmorphic, bold-brutalism, cyberpunk-neon, editorial-serif, split-reveal`);
  currentConfig.titlePage.style = await rl.question(`🎭 Select Title Style [Current: "${currentConfig.titlePage.style || 'standard'}"]: `) || currentConfig.titlePage.style || 'standard';
  
  console.log(`\nEnd Page Styles: standard, minimalist, thumbnail, glassmorphic, bold-brutalism, cyberpunk-neon, editorial-serif, split-reveal`);
  currentConfig.endPage.style = await rl.question(`🎭 Select End Page Style [Current: "${currentConfig.endPage.style || 'standard'}"]: `) || currentConfig.endPage.style || 'standard';

  console.log(`\nAvailable Themes: radiant-gold, neon-emerald, electric-amethyst, crimson-pulse, cyber-cyan, midnight-magenta, arctic-blue, volcanic-orange, slate-silver, royal-indigo`);
  currentConfig.video.themeName = await rl.question(`🎨 Theme Name [Current: "${currentConfig.video.themeName}"]: `) || currentConfig.video.themeName;
  currentConfig.video.maxCharactersPerSlide = parseInt(await rl.question(`✂️ Max Characters per slide before splitting [Current: ${currentConfig.video.maxCharactersPerSlide}]: `) || `${currentConfig.video.maxCharactersPerSlide}`, 10);

  // STEP 3: AUDIO SETTINGS
  console.log(`\n${colors.fgMagenta}${colors.bright}--- [Step 2: Audio & Fades] ---${colors.reset}`);
  const inputMusic = await rl.question(`🎵 Local path to background music (.mp3/.wav) [Current: "${currentConfig.audio.musicPath}"]: `);
  if (inputMusic.trim()) {
    currentConfig.audio.musicPath = inputMusic.trim();
  }
  
  currentConfig.audio.volume = parseFloat(await rl.question(`🔊 Volume level (0.0 to 1.0) [Current: ${currentConfig.audio.volume}]: `) || `${currentConfig.audio.volume}`);
  currentConfig.audio.fadeInInSeconds = parseFloat(await rl.question(`⏳ Audio Fade-In duration (seconds) [Current: ${currentConfig.audio.fadeInInSeconds}]: `) || `${currentConfig.audio.fadeInInSeconds}`);
  currentConfig.audio.fadeOutInSeconds = parseFloat(await rl.question(`⏳ Audio Fade-Out duration (seconds) [Current: ${currentConfig.audio.fadeOutInSeconds}]: `) || `${currentConfig.audio.fadeOutInSeconds}`);

  // STEP 4: BRANDING
  console.log(`\n${colors.fgMagenta}${colors.bright}--- [Step 3: Watermark / Branding] ---${colors.reset}`);
  currentConfig.branding.showLogo = await confirm(rl, `🏷️ Display branding overlay?`, currentConfig.branding.showLogo);
  if (currentConfig.branding.showLogo) {
    currentConfig.branding.logoText = await rl.question(`✍️ Branding Text [Current: "${currentConfig.branding.logoText}"]: `) || currentConfig.branding.logoText;
    const inputLogo = await rl.question(`🖼️ Path to logo image asset [Current: "${currentConfig.branding.logoPath}"]: `);
    if (inputLogo.trim()) {
      currentConfig.branding.logoPath = inputLogo.trim();
    }
    console.log(`Positions: top-left, top-right, bottom-left, bottom-right`);
    currentConfig.branding.position = await rl.question(`📍 Logo alignment [Current: "${currentConfig.branding.position}"]: `) || currentConfig.branding.position;
  }

  // STEP 5: SLIDES SETUP
  console.log(`\n${colors.fgMagenta}${colors.bright}--- [Step 4: Slides & Assets Setup] ---${colors.reset}`);
  
  let slideCount = currentConfig.slides.length || 3;
  if (currentConfig.slides.length > 0) {
    console.log(`I found ${currentConfig.slides.length} slides already defined in settings.`);
    const redef = await confirm(rl, "Would you like to reconfigure all slides from scratch?", false);
    if (redef) {
      slideCount = parseInt(await rl.question(`📊 How many slides would you like to create?: `) || "3", 10);
      currentConfig.slides = [];
    }
  } else {
    slideCount = parseInt(await rl.question(`📊 How many slides/scenes would you like to define?: `) || "3", 10);
  }

  // Capture slide setup details
  if (currentConfig.slides.length === 0) {
    for (let i = 1; i <= slideCount; i++) {
      let retrySlide = true;
      while (retrySlide) {
        console.log(`\n${colors.fgCyan}${colors.bright}• Configure Slide ${i} of ${slideCount}:${colors.reset}`);
        const heading = await rl.question(`  Heading [e.g. Topic ${i}]: `) || `Topic ${i}`;
        const content = await rl.question(`  Text content body: `);
        
        let mediaPath = '';
        const attachMedia = await confirm(rl, `  Attach an image or video to Slide ${i}?`, false);
        if (attachMedia) {
          let validFile = false;
          while (!validFile) {
            mediaPath = await rl.question(`  Enter path to image/video file: `);
            if (fs.existsSync(mediaPath)) {
              validFile = true;
            } else {
              console.log(`${colors.fgRed}  ❌ File does not exist! Please check path and try again.${colors.reset}`);
              const abortMedia = !(await confirm(rl, `  Try entering media path again?`, true));
              if (abortMedia) break;
            }
          }
        }

        console.log(`  Layouts: split-media-right (Default), split-media-left, full-background-media, text-only, media-only`);
        const layout = await rl.question(`  Select Layout [Default: split-media-right]: `) || "split-media-right";

        console.log(`\n${colors.bright}Slide Summary Preview:${colors.reset}`);
        console.log(` 👉 Title: ${heading}`);
        console.log(` 👉 Content: ${content}`);
        console.log(` 👉 Media: ${mediaPath || 'None'}`);
        console.log(` 👉 Layout: ${layout}`);

        const slideOk = await confirm(rl, `Confirm: Is Slide ${i} correct? (Select No to retry this slide)`, true);
        if (slideOk) {
          retrySlide = false;
          currentConfig.slides.push({
            id: `slide_${i}`,
            folder: `slide ${i}`,
            heading,
            content,
            mediaSourcePath: mediaPath,
            layout
          });
        }
      }
    }
  }

  // Write files and folders
  console.log(`\n${colors.fgYellow}${colors.bright}🔧 Provisioning directories and copying assets...${colors.reset}`);
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  // Copy logo
  if (currentConfig.branding.logoPath && fs.existsSync(currentConfig.branding.logoPath)) {
    const brandDir = path.join(assetsDir, 'branding');
    if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
    const filename = path.basename(currentConfig.branding.logoPath);
    const dest = path.join(brandDir, filename);
    fs.copyFileSync(currentConfig.branding.logoPath, dest);
    currentConfig.branding.logoPath = `assets/branding/${filename}`;
  }

  // Copy background music
  if (currentConfig.audio.musicPath && fs.existsSync(currentConfig.audio.musicPath)) {
    const musicDir = path.join(assetsDir, 'music');
    if (!fs.existsSync(musicDir)) fs.mkdirSync(musicDir, { recursive: true });
    const filename = path.basename(currentConfig.audio.musicPath);
    const dest = path.join(musicDir, filename);
    fs.copyFileSync(currentConfig.audio.musicPath, dest);
    currentConfig.audio.musicPath = `assets/music/${filename}`;
  }

  // Slide asset mapping and copying
  for (let i = 0; i < currentConfig.slides.length; i++) {
    const slide = currentConfig.slides[i];
    const slideFolder = `slide ${i + 1}`;
    const slideDir = path.join(assetsDir, slideFolder);
    
    if (!fs.existsSync(slideDir)) fs.mkdirSync(slideDir, { recursive: true });
    
    // Write nametext.txt
    const textData = `${slide.heading || ''}\n${slide.content || ''}`;
    fs.writeFileSync(path.join(slideDir, 'nametext.txt'), textData.trim(), 'utf-8');

    // Copy slide media
    if (slide.mediaSourcePath && fs.existsSync(slide.mediaSourcePath)) {
      const filename = path.basename(slide.mediaSourcePath);
      const dest = path.join(slideDir, filename);
      fs.copyFileSync(slide.mediaSourcePath, dest);
      console.log(`Copied slide ${i + 1} media asset: assets/${slideFolder}/${filename}`);
    }
  }

  // Write base configuration parameters
  fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf-8');
  console.log(`Initial parameters saved to config.json.`);

  // STEP 6: DYNAMIC RUN LOOP WITH REVIEWS AND EDITS
  let setupActive = true;
  while (setupActive) {
    console.log(`\n${colors.fgYellow}${colors.bright}🤖 Compiling layout assets & auto-splitting text...${colors.reset}`);
    execSync('node scripts/scan-assets.mjs', { cwd: projectRoot, stdio: 'inherit' });

    console.log(`\n${colors.fgGreen}${colors.bright}✅ Video configuration and asset structures compiled successfully!${colors.reset}`);
    
    const shouldRender = await confirm(rl, "Would you like to build and render the video now?", true);
    if (shouldRender) {
      console.log(`\n${colors.fgYellow}${colors.bright}Rendering video to out/output.mp4...${colors.reset}`);
      try {
        execSync('node scripts/render.mjs', { cwd: projectRoot, stdio: 'inherit' });
      } catch (err) {
        console.error(`${colors.fgRed}❌ Rendering error: ${err.message}${colors.reset}`);
      }
    }

    // Still image rendering options
    console.log(`\nSelect Still Asset(s) to render:`);
    console.log(`  [1] YouTube/Landscape Thumbnail (1920x1080)`);
    console.log(`  [2] Instagram Post Still (1080x1080)`);
    console.log(`  [3] Shorts Cover Still (1080x1920)`);
    console.log(`  [4] Render All Stills`);
    console.log(`  [5] Skip still rendering`);
    const stillChoice = await rl.question(`Choose an option (1-5) [Default: 5 (Skip)]: `) || "5";
    
    if (stillChoice !== '5') {
      const compsToRender = [];
      if (stillChoice === '1') compsToRender.push('Thumbnail');
      else if (stillChoice === '2') compsToRender.push('InstagramPost');
      else if (stillChoice === '3') compsToRender.push('Shorts');
      else if (stillChoice === '4') compsToRender.push('Thumbnail', 'InstagramPost', 'Shorts');
      
      for (const comp of compsToRender) {
        console.log(`\n${colors.fgYellow}${colors.bright}Rendering still image from composition ${comp}...${colors.reset}`);
        try {
          execSync(`node scripts/render.mjs --still=${comp}`, { cwd: projectRoot, stdio: 'inherit' });
        } catch (err) {
          console.error(`${colors.fgRed}❌ Still image render error for ${comp}: ${err.message}${colors.reset}`);
        }
      }
    }

    console.log(`\n${colors.fgCyan}${colors.bright}===================================================`);
    console.log(`🔄   REVIEW & CHANGE LOOP   👉   BALERKAJ BOT`);
    console.log(`====================================================${colors.reset}`);
    const makeChanges = await confirm(rl, "Would you like to make adjustments or edit your slide contents?", false);
    
    if (makeChanges) {
      console.log(`\nWhat adjustments would you like to perform?`);
      console.log(` [1] Modify Global Settings (Title, Theme, Styles, Watermark, Audio Fades)`);
      console.log(` [2] Edit details of a specific Slide`);
      console.log(` [3] Append a new slide`);
      console.log(` [4] Delete a slide`);
      console.log(` [5] Exit loop`);
      
      const choice = await rl.question(`Choose an option (1-5): `);
      const parsedConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      if (choice === '1') {
        // Edit globals
        console.log(`Select Video Aspect Ratio / Format:`);
        console.log(`  [1] Landscape (16:9 - 1920x1080)`);
        console.log(`  [2] Portrait (9:16 - 1080x1920)`);
        console.log(`  [3] Square (1:1 - 1080x1080)`);
        console.log(`  [4] Custom`);
        const aChoice = await rl.question(`Choose an option (1-4) [Current width: ${parsedConfig.video.width}, height: ${parsedConfig.video.height}]: `);
        if (aChoice === '2') { parsedConfig.video.width = 1080; parsedConfig.video.height = 1920; }
        else if (aChoice === '3') { parsedConfig.video.width = 1080; parsedConfig.video.height = 1080; }
        else if (aChoice === '4') {
          parsedConfig.video.width = parseInt(await rl.question(`Width px: `) || `${parsedConfig.video.width}`, 10);
          parsedConfig.video.height = parseInt(await rl.question(`Height px: `) || `${parsedConfig.video.height}`, 10);
        } else if (aChoice === '1') { parsedConfig.video.width = 1920; parsedConfig.video.height = 1080; }

        parsedConfig.titlePage.title = await rl.question(`🎥 Video Title [Current: "${parsedConfig.titlePage.title}"]: `) || parsedConfig.titlePage.title;
        parsedConfig.titlePage.subtitle = await rl.question(`📝 Title Subtitle [Current: "${parsedConfig.titlePage.subtitle}"]: `) || parsedConfig.titlePage.subtitle;
        
        console.log(`Title Styles: standard, minimalist, thumbnail, glassmorphic, bold-brutalism, cyberpunk-neon, editorial-serif, split-reveal`);
        parsedConfig.titlePage.style = await rl.question(`🎭 Title Style [Current: "${parsedConfig.titlePage.style || 'standard'}"]: `) || parsedConfig.titlePage.style || 'standard';
        
        console.log(`End Page Styles: standard, minimalist, thumbnail, glassmorphic, bold-brutalism, cyberpunk-neon, editorial-serif, split-reveal`);
        parsedConfig.endPage.style = await rl.question(`🎭 End Style [Current: "${parsedConfig.endPage.style || 'standard'}"]: `) || parsedConfig.endPage.style || 'standard';
        
        parsedConfig.video.themeName = await rl.question(`🎨 Theme Preset [Current: "${parsedConfig.video.themeName}"]: `) || parsedConfig.video.themeName;
        parsedConfig.audio.volume = parseFloat(await rl.question(`🔊 Music Volume [Current: ${parsedConfig.audio.volume}]: `) || `${parsedConfig.audio.volume}`);
        parsedConfig.audio.fadeInInSeconds = parseFloat(await rl.question(`⏳ Fade-In Duration [Current: ${parsedConfig.audio.fadeInInSeconds}]: `) || `${parsedConfig.audio.fadeInInSeconds}`);
        parsedConfig.audio.fadeOutInSeconds = parseFloat(await rl.question(`⏳ Fade-Out Duration [Current: ${parsedConfig.audio.fadeOutInSeconds}]: `) || `${parsedConfig.audio.fadeOutInSeconds}`);
        
        fs.writeFileSync(configPath, JSON.stringify(parsedConfig, null, 2), 'utf-8');
        console.log(`${colors.fgGreen}Globals updated!${colors.reset}`);

      } else if (choice === '2') {
        // Edit specific slide
        const uniqueSlides = [];
        const seenFolders = new Set();
        
        for (const s of parsedConfig.slides) {
          if (!seenFolders.has(s.folder)) {
            seenFolders.add(s.folder);
            uniqueSlides.push(s);
          }
        }

        console.log(`\nSlides catalog:`);
        uniqueSlides.forEach((s, idx) => {
          console.log(`  [${idx + 1}] Heading: "${s.heading}" | Content: "${s.content.substring(0, 40)}..."`);
        });
        
        const slideNum = parseInt(await rl.question(`Select slide number to modify (1-${uniqueSlides.length}): `) || "1", 10);
        if (slideNum >= 1 && slideNum <= uniqueSlides.length) {
          const targetSlide = uniqueSlides[slideNum - 1];
          console.log(`\nEditing Slide ${slideNum}:`);
          const newHeading = await rl.question(`  Heading [Current: "${targetSlide.heading}"]: `) || targetSlide.heading;
          const newContent = await rl.question(`  Content body: `);
          
          const changeMedia = await confirm(rl, "Do you want to change the image/video for this slide?", false);
          let newMediaSource = targetSlide.mediaSourcePath || '';
          if (changeMedia) {
            newMediaSource = await rl.question("  Enter path to new media file: ");
          }

          console.log(`  Layouts: split-media-right, split-media-left, full-background-media, text-only, media-only`);
          const newLayout = await rl.question(`  Layout [Current: "${targetSlide.layout}"]: `) || targetSlide.layout;

          // Update folder text file
          const slideDir = path.join(assetsDir, targetSlide.folder);
          if (!fs.existsSync(slideDir)) fs.mkdirSync(slideDir, { recursive: true });
          fs.writeFileSync(path.join(slideDir, 'nametext.txt'), `${newHeading}\n${newContent}`, 'utf-8');
          
          if (changeMedia && fs.existsSync(newMediaSource)) {
            const files = fs.readdirSync(slideDir);
            for (const file of files) {
              if (file !== 'nametext.txt') fs.rmSync(path.join(slideDir, file), { force: true });
            }
            const filename = path.basename(newMediaSource);
            fs.copyFileSync(newMediaSource, path.join(slideDir, filename));
            console.log(`Copied new media asset: assets/${targetSlide.folder}/${filename}`);
          }

          // Write updates back into config.json
          parsedConfig.slides.forEach(s => {
            if (s.folder === targetSlide.folder) {
              s.heading = newHeading;
              s.content = newContent;
              s.layout = newLayout;
              if (changeMedia) s.mediaSourcePath = newMediaSource;
            }
          });
          
          fs.writeFileSync(configPath, JSON.stringify(parsedConfig, null, 2), 'utf-8');
          console.log(`${colors.fgGreen}Slide ${slideNum} updated successfully!${colors.reset}`);
        } else {
          console.log(`${colors.fgRed}Invalid slide number selection.${colors.reset}`);
        }

      } else if (choice === '3') {
        // Append new slide
        const nextIndex = parsedConfig.slides.length + 1;
        const heading = await rl.question(`Heading for new slide: `) || `Topic ${nextIndex}`;
        const content = await rl.question(`Text content body: `);
        const mediaSourcePath = await rl.question(`Path to image/video file (optional): `);
        
        console.log(`Layouts: split-media-right, split-media-left, full-background-media, text-only, media-only`);
        const layout = await rl.question(`Select Layout [Default: split-media-right]: `) || "split-media-right";

        const folderName = `slide ${nextIndex}`;
        const slideDir = path.join(assetsDir, folderName);
        if (!fs.existsSync(slideDir)) fs.mkdirSync(slideDir, { recursive: true });

        fs.writeFileSync(path.join(slideDir, 'nametext.txt'), `${heading}\n${content}`, 'utf-8');
        if (mediaSourcePath && fs.existsSync(mediaSourcePath)) {
          const filename = path.basename(mediaSourcePath);
          fs.copyFileSync(mediaSourcePath, path.join(slideDir, filename));
        }

        parsedConfig.slides.push({
          id: `slide_${nextIndex}`,
          folder: folderName,
          heading,
          content,
          mediaSourcePath,
          layout
        });
        
        fs.writeFileSync(configPath, JSON.stringify(parsedConfig, null, 2), 'utf-8');
        console.log(`${colors.fgGreen}Added slide ${nextIndex} under folder: assets/${folderName}${colors.reset}`);

      } else if (choice === '4') {
        // Delete slide
        const uniqueSlides = [];
        const seenFolders = new Set();
        for (const s of parsedConfig.slides) {
          if (!seenFolders.has(s.folder)) {
            seenFolders.add(s.folder);
            uniqueSlides.push(s);
          }
        }
        
        console.log(`\nSlides Catalog:`);
        uniqueSlides.forEach((s, idx) => {
          console.log(`  [${idx + 1}] Heading: "${s.heading}"`);
        });

        const num = parseInt(await rl.question(`Select slide number to delete (1-${uniqueSlides.length}): `), 10);
        if (num >= 1 && num <= uniqueSlides.length) {
          const target = uniqueSlides[num - 1];
          
          const slidePath = path.join(assetsDir, target.folder);
          if (fs.existsSync(slidePath)) {
            fs.rmSync(slidePath, { recursive: true, force: true });
            console.log(`Wiped assets folder: assets/${target.folder}`);
          }

          parsedConfig.slides = parsedConfig.slides.filter(s => s.folder !== target.folder);
          
          const remainingFolders = fs.readdirSync(assetsDir)
            .filter(f => fs.statSync(path.join(assetsDir, f)).isDirectory() && f.startsWith('slide'))
            .sort(naturalSort);

          const tempSlides = [];
          remainingFolders.forEach((oldFolder, idx) => {
            const newIndex = idx + 1;
            const newFolderName = `slide ${newIndex}`;
            
            const oldPath = path.join(assetsDir, oldFolder);
            const newPath = path.join(assetsDir, newFolderName);
            
            if (oldPath !== newPath) {
              fs.renameSync(oldPath, newPath);
              console.log(`Renamed assets/${oldFolder} to assets/${newFolderName}`);
            }

            const matchedSlides = parsedConfig.slides.filter(s => s.folder === oldFolder);
            matchedSlides.forEach(s => {
              s.folder = newFolderName;
              s.id = s.id.replace(oldFolder.replace(/\s+/g, '_').toLowerCase(), newFolderName.replace(/\s+/g, '_').toLowerCase());
            });
            tempSlides.push(...matchedSlides);
          });

          parsedConfig.slides = tempSlides;
          fs.writeFileSync(configPath, JSON.stringify(parsedConfig, null, 2), 'utf-8');
          console.log(`${colors.fgGreen}Slide deleted and folders re-indexed!${colors.reset}`);
        } else {
          console.log(`${colors.fgRed}Invalid selection.${colors.reset}`);
        }
      } else {
        setupActive = false;
        console.log(`\nExiting review loop.`);
      }
    } else {
      setupActive = false;
      console.log(`\nConfiguration finalized. Exiting Balerkaj Bot guide.`);
    }
  }

  rl.close();
  console.log(`\n${colors.fgGreen}${colors.bright}🎬 Thank you for using Balerkaj Bot! Happy rendering! 🎬${colors.reset}\n`);
}

runSetup().catch(console.error);
