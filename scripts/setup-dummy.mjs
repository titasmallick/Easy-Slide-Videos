import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

console.log('🧼 Cleaning up real assets...');
removeDir(path.join(projectRoot, 'public', 'assets'));
removeDir(path.join(projectRoot, 'public', 'music'));
removeDir(path.join(projectRoot, 'public', 'temp'));

ensureDir(path.join(projectRoot, 'public', 'assets', 'slide_1'));
ensureDir(path.join(projectRoot, 'public', 'assets', 'slide_2'));
ensureDir(path.join(projectRoot, 'public', 'assets', 'slide_3'));
ensureDir(path.join(projectRoot, 'public', 'assets', 'slide_4'));
ensureDir(path.join(projectRoot, 'public', 'assets', 'slide_5'));
ensureDir(path.join(projectRoot, 'public', 'assets', 'slide_6'));
ensureDir(path.join(projectRoot, 'public', 'music'));

// Function to generate a 5-second PCM WAV file with silence
function createSilentWav(durationInSeconds = 5, sampleRate = 8000) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const numSamples = sampleRate * durationInSeconds;
  const dataSize = numSamples * blockAlign;
  const chunkSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(chunkSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

const silentWavBuffer = createSilentWav(5, 8000);

fs.writeFileSync(path.join(projectRoot, 'public', 'music', 'background.wav'), silentWavBuffer);
fs.writeFileSync(path.join(projectRoot, 'public', 'assets', 'slide_1', 'voiceover.wav'), silentWavBuffer);

const svgTemplate = (title, color) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0b0f19;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#020617;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#grad)"/>
  <rect x="50" y="50" width="1820" height="980" rx="30" fill="none" stroke="${color}" stroke-width="4" opacity="0.3"/>
  <circle cx="960" cy="540" r="350" fill="${color}" opacity="0.05"/>
  <text x="960" y="540" font-family="system-ui, -apple-system, sans-serif" font-size="75" font-weight="bold" fill="${color}" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">${title}</text>
  <text x="960" y="640" font-family="system-ui, -apple-system, sans-serif" font-size="30" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">Easy-Slide-Videos Engine Media</text>
</svg>
`;

fs.writeFileSync(path.join(projectRoot, 'public', 'assets', 'slide_1', 'media1.svg'), svgTemplate('TRANSITION DEMO', '#34D399'));
fs.writeFileSync(path.join(projectRoot, 'public', 'assets', 'slide_2', 'media2.svg'), svgTemplate('VOICEOVER DEMO', '#60A5FA'));
fs.writeFileSync(path.join(projectRoot, 'public', 'assets', 'slide_3', 'collage1.svg'), svgTemplate('COLLAGE GRID ITEM A', '#F59E0B'));
fs.writeFileSync(path.join(projectRoot, 'public', 'assets', 'slide_3', 'collage2.svg'), svgTemplate('COLLAGE GRID ITEM B', '#EC4899'));
fs.writeFileSync(path.join(projectRoot, 'public', 'assets', 'slide_5', 'media5.svg'), svgTemplate('FULL MEDIA DISPLAY', '#A78BFA'));
fs.writeFileSync(path.join(projectRoot, 'public', 'assets', 'slide_6', 'media6.svg'), svgTemplate('CARD OVERLAY STYLE', '#F472B6'));

const dummySRT = `1
00:00:00,000 --> 00:00:02,500
Subtitle captions sync automatically in the layout.

2
00:00:02,500 --> 00:00:05,000
Try modifying this text directly inside captions.srt file!
`;
fs.writeFileSync(path.join(projectRoot, 'public', 'assets', 'slide_1', 'captions.srt'), dummySRT);

console.log('📝 Creating clean dummy configurations...');

const dummyConfig = {
  "video": {
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "maxCharactersPerSlide": 750,
    "themeName": "neon-emerald",
    "theme": {},
    "fontFamily": "outfit",
    "fontWeight": "600",
    "disableAnimations": false,
    "iconName": "Video",
    "progressBar": {
      "show": true,
      "position": "bottom",
      "color": "",
      "height": 8
    }
  },
  "audio": {
    "musicPath": "music/background.wav",
    "volume": 0.5,
    "loop": true,
    "fadeInInSeconds": 0.5,
    "fadeOutInSeconds": 1
  },
  "branding": {
    "showLogo": true,
    "logoPath": "",
    "logoText": "EASY-SLIDE-VIDEOS",
    "position": "top-left",
    "size": 50,
    "opacity": 0.9,
    "persistent": true,
    "authorName": "Open Source Slideshow Video Maker",
    "badgeText": "ENGINE"
  },
  "titlePage": {
    "show": true,
    "title": "Easy-Slide-Videos",
    "subtitle": "Automated slides to high-fidelity video generator using React and Remotion",
    "durationInSeconds": 4,
    "theme": {
      "background": "linear-gradient(135deg, #0b1528 0%, #020617 100%)",
      "textColor": "#f8fafc",
      "subtitleColor": "#94a3b8"
    },
    "style": "glassmorphic-media",
    "media": "assets/slide_1/media1.svg",
    "mediaType": "image"
  },
  "slides": [
    {
      "id": "slide_1",
      "folder": "slide_1",
      "media": "assets/slide_1/media1.svg",
      "mediaType": "image",
      "heading": "Premium Slide Transitions",
      "subheading": "Option 4: Slide Transitions Packer",
      "content": "Mix and match animations per slide. Try **slide-left**, **slide-right**, **slide-up**, **slide-down**, **zoom-reveal**, **glitch-blur**, or simple **fade**.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "split-media-right",
      "transition": "zoom-reveal",
      "voiceover": "assets/slide_1/voiceover.wav"
    },
    {
      "id": "slide_2",
      "folder": "slide_2",
      "media": "assets/slide_2/media2.svg",
      "mediaType": "image",
      "heading": "Voiceovers & Audio Ducking",
      "subheading": "Automated voiceover timeline synchronization",
      "content": "Narration audio track plays on each slide with **automatic ducking of background music** volume down to 15% to maintain speech clarity.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "split-media-left",
      "transition": "slide-left"
    },
    {
      "id": "slide_3",
      "folder": "slide_3",
      "media": "assets/slide_3/collage1.svg",
      "mediaType": "image",
      "heading": "Multi-Media Collage Grid",
      "subheading": "Responsive layouts",
      "content": "Render multiple images/videos inside a single slide using **collaged responsive grid layouts**. Fully customizer-friendly.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "grid-collage",
      "transition": "glitch-blur",
      "mediaList": [
        "assets/slide_3/collage1.svg",
        "assets/slide_3/collage2.svg"
      ]
    },
    {
      "id": "slide_4",
      "folder": "slide_4",
      "media": null,
      "mediaType": null,
      "heading": "Minimalist Text Layouts",
      "subheading": "Text-Only slides",
      "content": "Perfect for quotes, code snippets, key statistics, or pure text announcements without needing graphics assets. Uses centered clean typography.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "text-only",
      "transition": "slide-up"
    },
    {
      "id": "slide_5",
      "folder": "slide_5",
      "media": "assets/slide_5/media5.svg",
      "mediaType": "image",
      "heading": "Immersive Media Showcases",
      "subheading": "Media-Only layouts",
      "content": "Gives 100% viewport space to your high-resolution images or background video loop without text overlays.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "media-only",
      "transition": "slide-right"
    },
    {
      "id": "slide_6",
      "folder": "slide_6",
      "media": "assets/slide_6/media6.svg",
      "mediaType": "image",
      "heading": "Cinematic Layouts",
      "subheading": "Full Background Media",
      "content": "Layers card typography over the full background media, utilizing beautiful glassmorphic overlays for professional visual contrast.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "full-background-media",
      "transition": "slide-down"
    }
  ],
  "endPage": {
    "show": true,
    "title": "Easy-Slide-Videos",
    "subtitle": "Clone and build on GitHub. Support open-source creators!",
    "contact": "https://github.com/titasmallick/Easy-Slide-Videos",
    "website": "github.com",
    "durationInSeconds": 4,
    "theme": {
      "background": "linear-gradient(135deg, #0b1528 0%, #020617 100%)",
      "textColor": "#f8fafc",
      "subtitleColor": "#94a3b8"
    },
    "style": "glassmorphic",
    "startTime": 34
  }
};

fs.writeFileSync(path.join(projectRoot, 'config.json'), JSON.stringify(dummyConfig, null, 2));

const dummyReelsConfig = {
  ...dummyConfig,
  "video": {
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "themeName": "radiant-gold"
  }
};
fs.writeFileSync(path.join(projectRoot, 'config-reels.json'), JSON.stringify(dummyReelsConfig, null, 2));

console.log('🔄 Triggering Asset Scanner...');
execSync('node scripts/scan-assets.mjs', { cwd: projectRoot, stdio: 'inherit' });

console.log('🎉 Clean dummy setup complete!');
