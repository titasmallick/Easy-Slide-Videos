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

const NUM_SLIDES = 13;
const slideDirs = Array.from({ length: NUM_SLIDES }, (_, i) => `slide_${i + 1}`);

slideDirs.forEach(dir => {
  ensureDir(path.join(projectRoot, 'public', 'assets', dir));
});
ensureDir(path.join(projectRoot, 'public', 'music'));

// ──────────────────────────────────────────────────────────────────────────────
// Silent WAV generator (no deps required)
// ──────────────────────────────────────────────────────────────────────────────
function createSilentWav(durationInSeconds = 5, sampleRate = 8000) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const numSamples = sampleRate * durationInSeconds;
  const dataSize = numSamples * blockAlign;
  const chunkSize = 36 + dataSize;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(chunkSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  return buffer;
}

const silentWavBuffer = createSilentWav(5, 8000);
fs.writeFileSync(path.join(projectRoot, 'public', 'music', 'background.wav'), silentWavBuffer);
fs.writeFileSync(path.join(projectRoot, 'public', 'assets', 'slide_1', 'voiceover.wav'), silentWavBuffer);

// ──────────────────────────────────────────────────────────────────────────────
// PNG placeholder generator — pure Node.js (no canvas / sharp deps)
// Creates a 1920×1080 BMP file wrapped in a trivial PNG-like Buffer.
// Uses BMP24 which Chromium/Remotion can decode natively.
// ──────────────────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function createBmp(width, height, bgHex, accentHex) {
  const { r: br, g: bg, b: bb } = hexToRgb(bgHex);
  const { r: ar, g: ag, b: ab } = hexToRgb(accentHex);

  const rowSize = Math.ceil(width * 3 / 4) * 4; // padded to 4-byte boundary
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;

  const buf = Buffer.alloc(fileSize, 0);

  // BMP file header
  buf.write('BM', 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(0, 6);         // reserved
  buf.writeUInt32LE(54, 10);       // pixel data offset

  // DIB header (BITMAPINFOHEADER)
  buf.writeUInt32LE(40, 14);       // header size
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(-height, 22);   // negative = top-down
  buf.writeUInt16LE(1, 26);        // color planes
  buf.writeUInt16LE(24, 28);       // bits per pixel
  buf.writeUInt32LE(0, 30);        // no compression
  buf.writeUInt32LE(pixelDataSize, 34);
  buf.writeInt32LE(2835, 38);      // H pixels/m
  buf.writeInt32LE(2835, 42);      // V pixels/m
  buf.writeUInt32LE(0, 46);
  buf.writeUInt32LE(0, 50);

  let off = 54;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Draw a subtle gradient + two accent stripes
      const isAccentX = x > width * 0.45 && x < width * 0.55;
      const isAccentY = y > height * 0.45 && y < height * 0.55;
      const isBorder = x < 60 || x > width - 60 || y < 60 || y > height - 60;
      const t = (x / width + y / height) / 2;

      let r, g, b;
      if (isBorder && (isAccentX || isAccentY)) {
        r = ar; g = ag; b = ab;
      } else if (isBorder) {
        r = Math.round(br + (ar - br) * 0.15);
        g = Math.round(bg + (ag - bg) * 0.15);
        b = Math.round(bb + (ab - bb) * 0.15);
      } else {
        // background gradient
        r = Math.round(br * (1 - t * 0.2));
        g = Math.round(bg * (1 - t * 0.2));
        b = Math.round(bb * (1 - t * 0.2));
      }
      // BMP is stored as BGR
      buf[off++] = Math.max(0, Math.min(255, b));
      buf[off++] = Math.max(0, Math.min(255, g));
      buf[off++] = Math.max(0, Math.min(255, r));
    }
    // row padding
    for (let p = width * 3; p < rowSize; p++) {
      buf[off++] = 0;
    }
  }

  return buf;
}

console.log('🎨 Generating placeholder BMP images (PNG-compatible)...');

// BMP images — Chromium can render .bmp natively, and Remotion serves them via staticFile()
const placeholders = [
  { file: path.join(projectRoot, 'public', 'assets', 'slide_1', 'media1.bmp'), bg: '#0b1120', accent: '#34D399' },
  { file: path.join(projectRoot, 'public', 'assets', 'slide_2', 'media2.bmp'), bg: '#0c1022', accent: '#60A5FA' },
  { file: path.join(projectRoot, 'public', 'assets', 'slide_6', 'collage1.bmp'), bg: '#18100a', accent: '#F59E0B' },
  { file: path.join(projectRoot, 'public', 'assets', 'slide_6', 'collage2.bmp'), bg: '#1a0c14', accent: '#EC4899' },
  { file: path.join(projectRoot, 'public', 'assets', 'slide_10', 'media10.bmp'), bg: '#100c1a', accent: '#F472B6' },
  { file: path.join(projectRoot, 'public', 'assets', 'slide_13', 'media13.bmp'), bg: '#0a1020', accent: '#38BDF8' },
];

for (const { file, bg, accent } of placeholders) {
  fs.writeFileSync(file, createBmp(960, 540, bg, accent));
  console.log(`  ✅ ${path.basename(file)}`);
}

const dummySRT = `1
00:00:00,000 --> 00:00:02,500
Subtitle captions sync automatically in the layout.

2
00:00:02,500 --> 00:00:05,000
Try modifying this text directly inside captions.srt file!
`;
fs.writeFileSync(path.join(projectRoot, 'public', 'assets', 'slide_1', 'captions.srt'), dummySRT);

// ──────────────────────────────────────────────────────────────────────────────
// Text files for scanner
// ──────────────────────────────────────────────────────────────────────────────
const slidesTextData = [
  { folder: 'slide_1',  heading: 'Animated Caption Subtitles',     subheading: 'Real-time Word Highlights',         content: 'Subtitle captions sync automatically in the layout.' },
  { folder: 'slide_2',  heading: 'Markdown & GFM Tables',          subheading: 'Rich Formatting Support',           content: 'Full markdown support: **bold**, *italic*, ~~highlight~~, `code`.' },
  { folder: 'slide_3',  heading: 'Dynamic SVG Bar Charts',         subheading: 'Interactive Data Visualizations',   content: 'Animated bar charts render inline via the dependency-free SVG charting engine.' },
  { folder: 'slide_4',  heading: 'Donut & Pie Charts',             subheading: 'Segmented Data Distribution',       content: 'Visualize data splits and distributions using animated donut and pie charts.' },
  { folder: 'slide_5',  heading: 'Line Chart Trends',              subheading: 'Gradient Growth Curves',            content: 'Animated vector line charts display growth trends with labeled coordinates.' },
  { folder: 'slide_6',  heading: 'Responsive Media Collage',       subheading: 'Multi-Image Grid Layout',           content: 'Display multiple images in a smart aspect-ratio collage grid within one scene.' },
  { folder: 'slide_7',  heading: 'LaTeX Math Equations',           subheading: 'Inline & Block Equation Support',   content: 'Render mathematical equations natively using KaTeX.' },
  { folder: 'slide_8',  heading: 'Slide Counter Styles',           subheading: 'Pill · Dots · Fraction · Minimal',  content: 'A configurable overlay that tracks and displays the current slide position.' },
  { folder: 'slide_9',  heading: 'Background Pattern Engine',      subheading: 'Grid · Dots · Diagonal · Circuit',  content: 'Choose from five background tile patterns to reinforce your presentation aesthetic.' },
  { folder: 'slide_10', heading: 'Cinematic Full-Bleed Overlays',  subheading: 'Premium Card Typography',           content: 'Render premium typography cards over blurred full-bleed media backdrops.' },
  { folder: 'slide_11', heading: 'Animated Countdown Timer',       subheading: 'Countdown Layout',                  content: 'Fullscreen animated circular countdown with pulsing number and SVG ring progress.' },
  { folder: 'slide_12', heading: 'Syntax Highlighted Code Blocks', subheading: 'Code-Block Layout with Themes',     content: 'Display beautifully highlighted code inside a terminal-style glassmorphic panel.' },
  { folder: 'slide_13', heading: 'New Transitions Showcase',       subheading: 'Wipe · Morph · Cube Rotate',        content: 'Three brand-new transitions: wipe-right clip reveal, morph-scale zoom, and 3D cube rotation.' },
];

slidesTextData.forEach(slide => {
  const slideDir = path.join(projectRoot, 'public', 'assets', slide.folder);
  fs.writeFileSync(path.join(slideDir, 'nametext.txt'), `${slide.heading}\n${slide.content}`, 'utf-8');
  if (slide.subheading) {
    fs.writeFileSync(path.join(slideDir, 'subheading.txt'), slide.subheading, 'utf-8');
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// Full dummy config — 13 slides, all engine features on display
// ──────────────────────────────────────────────────────────────────────────────
console.log('📝 Creating clean dummy configurations...');

const dummyConfig = {
  "video": {
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "maxCharactersPerSlide": 750,
    "themeName": "neon-emerald",
    "theme": {
      "backgroundPattern": "grid",
      "cornerDecorations": true
    },
    "fontFamily": "outfit",
    "fontWeight": "600",
    "disableAnimations": false,
    "iconName": "Video",
    "progressBar": {
      "show": true,
      "type": "border",
      "position": "bottom",
      "color": "",
      "height": 8,
      "thickness": 6,
      "glow": true
    },
    "border": {
      "show": true,
      "color": "",
      "width": 12,
      "radius": 24,
      "glow": true
    },
    "slideCounter": {
      "show": true,
      "position": "bottom-right",
      "style": "pill",
      "color": ""
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
    "subtitle": "The complete slideshow video engine — markdown, LaTeX, charts, collages, and more",
    "durationInSeconds": 4,
    "theme": {
      "background": "linear-gradient(135deg, #0b1528 0%, #020617 100%)",
      "textColor": "#f8fafc",
      "subtitleColor": "#94a3b8"
    },
    "style": "glassmorphic"
  },
  "slides": [
    {
      "id": "slide_1",
      "folder": "slide_1",
      "media": "assets/slide_1/media1.bmp",
      "mediaType": "image",
      "heading": "Animated Caption Subtitles",
      "subheading": "Real-time Word Highlights",
      "content": "Subtitle captions sync automatically in the layout. Try modifying this text directly inside captions.srt file!",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "split-media-right",
      "transition": "zoom-reveal",
      "voiceover": "assets/slide_1/voiceover.wav",
      "subtitleBurnIn": true
    },
    {
      "id": "slide_2",
      "folder": "slide_2",
      "media": "assets/slide_2/media2.bmp",
      "mediaType": "image",
      "heading": "Markdown & GFM Tables",
      "subheading": "Rich Formatting Support",
      "content": "This engine supports **bold text**, *accent colors*, ~~highlight pen glows~~, and code badges like `npm run dev`.\n\nHere is a live GFM table:\n\n| Feature | Supported | Status |\n|---|---|---|\n| GFM Tables | ✅ Yes | Live |\n| SVG Charts | ✅ Yes | Live |\n| LaTeX Math | ✅ Yes | Live |\n| Slide Counter | ✅ Yes | New |",
      "durationInSeconds": 6,
      "mediaStartFromInSeconds": 0,
      "layout": "split-media-left",
      "transition": "slide-left"
    },
    {
      "id": "slide_3",
      "folder": "slide_3",
      "media": null,
      "mediaType": null,
      "heading": "Dynamic SVG Bar Charts",
      "subheading": "Interactive Data Visualizations",
      "content": "Our dependency-free charting engine renders responsive vector graphics inline. It adapts to the current theme colors and resolution dynamically.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "chart-only",
      "transition": "slide-up",
      "chart": {
        "type": "bar",
        "data": [
          { "label": "Q1", "value": 150 },
          { "label": "Q2", "value": 240 },
          { "label": "Q3", "value": 180 },
          { "label": "Q4", "value": 310 }
        ]
      }
    },
    {
      "id": "slide_4",
      "folder": "slide_4",
      "media": null,
      "mediaType": null,
      "heading": "Donut & Pie Charts",
      "subheading": "Segmented Data Distribution",
      "content": "Use donut and pie charts to present breakdown of traffic, sales categories, or resource allocations in clean layouts.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "split-media-right",
      "transition": "glitch-blur",
      "chart": {
        "type": "donut",
        "data": [
          { "label": "Direct", "value": 45 },
          { "label": "Social", "value": 25 },
          { "label": "Referral", "value": 30 }
        ]
      }
    },
    {
      "id": "slide_5",
      "folder": "slide_5",
      "media": null,
      "mediaType": null,
      "heading": "Line Chart Trends",
      "subheading": "Gradient Growth Curves",
      "content": "Visualize trends over time with animated vector lines, grid markers, and labeled coordinate points.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "split-media-left",
      "transition": "slide-right",
      "chart": {
        "type": "line",
        "data": [
          { "label": "Jan", "value": 40 },
          { "label": "Feb", "value": 85 },
          { "label": "Mar", "value": 110 },
          { "label": "Apr", "value": 95 },
          { "label": "May", "value": 160 }
        ]
      }
    },
    {
      "id": "slide_6",
      "folder": "slide_6",
      "media": "assets/slide_6/collage1.bmp",
      "mediaType": "image",
      "heading": "Responsive Media Collage",
      "subheading": "Multi-Image Grid Layout",
      "content": "Display multiple images or video loops inside a single scene using smart aspect-ratio collage matrices.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "grid-collage",
      "transition": "fade",
      "mediaList": [
        "assets/slide_6/collage1.bmp",
        "assets/slide_6/collage2.bmp"
      ]
    },
    {
      "id": "slide_7",
      "folder": "slide_7",
      "media": null,
      "mediaType": null,
      "heading": "LaTeX Math Equations",
      "subheading": "Inline & Block Equation Support",
      "content": "Write mathematical equations using standard LaTeX syntax:\n\nInline: The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$\n\nBlock display:\n\n$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$\n\n$$E = mc^2 \\quad \\text{(Einstein's mass-energy equivalence)}$$",
      "durationInSeconds": 6,
      "mediaStartFromInSeconds": 0,
      "layout": "text-only",
      "transition": "slide-up"
    },
    {
      "id": "slide_8",
      "folder": "slide_8",
      "media": null,
      "mediaType": null,
      "heading": "Slide Counter Styles",
      "subheading": "Pill · Dots · Fraction · Minimal",
      "content": "The slide counter overlay tracks your position through the video. Configure it in **config-classic.json** under `video.slideCounter`:\n\n| Style | Appearance |\n|---|---|\n| `pill` | Glassmorphic capsule with dot indicator |\n| `dots` | Expanding dot per slide |\n| `fraction` | Current / Total fraction display |\n| `minimal` | Monospace 01 / 08 counter |",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "text-only",
      "transition": "slide-left"
    },
    {
      "id": "slide_9",
      "folder": "slide_9",
      "media": null,
      "mediaType": null,
      "heading": "Background Pattern Engine",
      "subheading": "Grid · Dots · Diagonal · Circuit",
      "content": "Set `video.theme.backgroundPattern` in config to change the texture:\n\n| Pattern | Description |\n|---|---|\n| `grid` | Default fine grid overlay |\n| `dots` | Uniform radial dot grid |\n| `diagonal` | 45° repeating stripe lines |\n| `circuit` | Layered grid + accent nodes |\n| `none` | Clean flat background |\n\nCombine with `cornerDecorations: false` to disable bracket corners.",
      "durationInSeconds": 6,
      "mediaStartFromInSeconds": 0,
      "layout": "text-only",
      "transition": "glitch-blur"
    },
    {
      "id": "slide_10",
      "folder": "slide_10",
      "media": "assets/slide_10/media10.bmp",
      "mediaType": "image",
      "heading": "Cinematic Full-Bleed Overlays",
      "subheading": "Premium Card Typography",
      "content": "Render premium typography cards over blurred full-bleed media backdrops for a sleek, high-end commercial feel.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "full-background-media",
      "transition": "slide-down"
    },
    {
      "id": "slide_11",
      "folder": "slide_11",
      "media": null,
      "mediaType": null,
      "heading": "Session Starting In",
      "subheading": "",
      "content": "",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "countdown",
      "transition": "zoom-reveal",
      "countdownFrom": 5
    },
    {
      "id": "slide_12",
      "folder": "slide_12",
      "media": null,
      "mediaType": null,
      "heading": "Easy-Slide-Videos Engine",
      "subheading": "Zero dependencies · Pure React · Remotion",
      "content": "",
      "durationInSeconds": 6,
      "mediaStartFromInSeconds": 0,
      "layout": "code-block",
      "transition": "wipe-right",
      "codeBlock": {
        "language": "javascript",
        "showLineNumbers": true,
        "code": "// config-classic.json — your entire video as data\nconst slide = {\n  heading: 'Hello World',\n  layout: 'split-media-right',\n  transition: 'cube-rotate',\n  chart: {\n    type: 'bar',\n    data: [\n      { label: 'Q1', value: 150 },\n      { label: 'Q2', value: 240 }\n    ]\n  }\n};\n\n// Then just run:\nnpm run render"
      }
    },
    {
      "id": "slide_13",
      "folder": "slide_13",
      "media": "assets/slide_13/media13.bmp",
      "mediaType": "image",
      "heading": "New Transitions Showcase",
      "subheading": "Wipe · Morph-Scale · Cube Rotate",
      "content": "Three brand-new transitions added to the engine:\n\n- **`wipe-right`** — clip-path curtain reveal from left\n- **`morph-scale`** — overshooting zoom in/out\n- **`cube-rotate`** — 3D Y-axis cube flip\n\nSet `\"transition\": \"cube-rotate\"` on any slide to activate.",
      "durationInSeconds": 5,
      "mediaStartFromInSeconds": 0,
      "layout": "split-media-left",
      "transition": "cube-rotate",
      "themeName": "cyber-punk",
      "bgVideo": "assets/slide_13/media13.bmp",
      "accentIcon": "✨",
      "ticker": "BREAKING NEWS • NEW ENGINE UPDATE V2 • ",
      "textAnimation": "stagger"
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
    "startTime": 75
  }
};

fs.writeFileSync(path.join(projectRoot, 'config-classic.json'), JSON.stringify(dummyConfig, null, 2));

const dummyReelsConfig = {
  ...dummyConfig,
  "video": {
    ...dummyConfig.video,
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "themeName": "radiant-gold"
  }
};
fs.writeFileSync(path.join(projectRoot, 'config-reels.json'), JSON.stringify(dummyReelsConfig, null, 2));

console.log('🔄 Triggering Asset Scanner...');
execSync('node scripts/scan-assets.mjs', { cwd: projectRoot, stdio: 'inherit' });

console.log('🎉 Clean dummy setup complete! 13 slides covering all engine features.');
