# Easy-Slide-Videos 🎬

A self-contained, zero-dependency video generation engine built with **Remotion** and **React**. Drop in a `config.json`, add your assets, and render production-quality videos with animated backgrounds, glassmorphism cards, syntax-highlighted code, live charts, LaTeX equations, and 10 cinematic transitions — all from plain JSON.

<img src="docs/showcase.gif" width="100%" alt="Easy-Slide-Videos Full Engine Showcase" />

<details>
<summary><strong>View Classic Standard Template (5-Slide)</strong></summary>
<br>
<img src="docs/classic-showcase.gif" width="100%" alt="Easy-Slide-Videos Classic Showcase" />
</details>

---

## 💡 Use Cases & Applications
Because this engine is completely driven by a simple `config.json` payload, it can be easily deployed as an automated video generation API (via Node.js or AWS Lambda with `@remotion/lambda`).

*   **SaaS Video APIs**: Build a backend service that accepts user data (e.g., real estate listings, weekly analytics, e-commerce products) and instantly returns a fully produced promotional video.
*   **Educational Content**: Leverage the LaTeX math block renders and syntax-highlighted code terminals to automatically generate math tutorials, coding courses, or flashcard videos from markdown notes.
*   **News & Broadcast**: Utilize the scrolling marquee ticker, subtitle burn-in, and ambient background videos to generate daily news digests or financial market wrap-ups programmatically.
*   **Data Visualization**: Connect the dependency-free SVG charts to a live database or API to auto-generate daily/weekly metric reports for your team.
*   **Social Media Automation**: Dynamically adjust aspect ratios (16:9 to 9:16) and utilize collage layouts to build automated pipelines for TikTok, Instagram Reels, and YouTube Shorts.

---

## 🚀 Features

- **Automated Asset Scan**: Scans directories under `assets/` and auto-generates slide layouts based on media and text files.
- **Dynamic Text Splitting**: If a slide's text is too long, the scanner automatically splits it across consecutive slides with shared media and continuous video offset tracking.
- **Interactive Setup CLI**: Step-by-step CLI (`npm run setup`) that sets up folders, copies media, configures transitions, and renders — all without touching a config file.
- **Dynamic Configuration**: Everything is driven by `config.json`. Change themes, layouts, charts, transitions, counters, patterns, and borders without code changes.
- **Premium Aesthetics**: High-contrast layouts with glassmorphism containers, spring entrance animations, and radial gradient backgrounds.
- **Smart Aspect-Ratio Fill**: Portrait assets render over a blurred full-bleed background to fit landscape videos seamlessly.
- **Audio Fades & Dynamic Ducking**: Fade-in/out, per-slide voiceover tracks with automatic 85% background music ducking.
- **Per-Slide Background Music Override**: Set `bgMusic` on any slide to play a different audio track for just that slide.
- **Automated SRT/VTT Subtitle Parser**: Parses caption files for word-by-word highlights (karaoke mode) and auto-calibrates slide duration.
- **Collage Grid Layouts**: Render multiple images/videos in a responsive CSS Grid collage per slide.
- **Interactive Web Dashboard**: Local web app to configure slides and render compositions with real-time progress (`npm run dashboard`).
- **Runtime Config Validation**: Built-in Zod schema validation ensures dashboard and CLI edits cannot silently corrupt `config.json`.
- **10 Cinematic Transitions**: `fade`, `slide-left`, `slide-right`, `slide-up`, `slide-down`, `zoom-reveal`, `glitch-blur`, `wipe-right`, `morph-scale`, `cube-rotate`
- **10 Theme Presets**: royal-indigo, radiant-gold, neon-emerald, electric-amethyst, cyber-cyan, midnight-magenta, arctic-blue, volcanic-orange, slate-silver, crimson-pulse
- **8 Title/End Page Styles**: standard, minimalist, thumbnail, glassmorphic, bold-brutalism, cyberpunk-neon, editorial-serif, split-reveal
- **Batch Render All Themes**: `npm run render:all` renders the video in every theme variant automatically.
- **Cross-Platform**: Windows, macOS, and Linux.

---

## 🧩 Slide Layouts

| Layout | Description |
|---|---|
| `split-media-right` | Text left, media/chart right |
| `split-media-left` | Media/chart left, text right |
| `text-only` | Full-width centered text block |
| `media-only` | Full-screen media |
| `full-background-media` | Media as background with text card overlay |
| `grid-collage` | Multi-image collage grid |
| `chart-only` | Full-screen animated SVG chart |
| `countdown` | Animated circular countdown timer |
| `code-block` | Syntax-highlighted code panel with terminal UI |

---

## 🎨 Slide-Level Content Features

### Markdown Formatting
| Syntax | Output |
|---|---|
| `**bold**` | Theme-primary colored bold text |
| `*italic*` | Accent-colored italic |
| `~~highlight~~` | Glow highlight pen background |
| `` `code` `` | Monospace dark badge |
| `[text](highlight)` | Same as `~~highlight~~` |
| GFM pipe tables | Full themed table rendering |
| `$...$` | Inline LaTeX via KaTeX |
| `$$...$$` | Block LaTeX equation display |

### Charts (dependency-free SVG)
Add a `chart` block to any slide. Works on any layout — use `"layout": "chart-only"` for fullscreen.
```json
"chart": {
  "type": "bar",
  "data": [{ "label": "Q1", "value": 150 }, { "label": "Q2", "value": 240 }],
  "color": "#34D399"
}
```
**Types**: `bar` | `line` | `pie` | `donut`

### LaTeX Math Equations
```
Inline: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

Block:  $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
```
Rendered via `remark-math` + `rehype-katex`. KaTeX CSS is injected automatically.

### Code Block with Syntax Highlighting
```json
{
  "layout": "code-block",
  "codeBlock": {
    "code": "const x = greet('world');\nconsole.log(x);",
    "language": "javascript",
    "showLineNumbers": true
  }
}
```
Renders in a macOS-style terminal panel with Dracula-palette syntax highlighting.

### Animated Countdown Timer
```json
{
  "layout": "countdown",
  "countdownFrom": 5,
  "durationInSeconds": 5
}
```
Displays an SVG ring progress clock with pulsing large number.

### Ambient & Visual Overrides
Add any of these zero-architecture modifiers to a slide object in `config.json`:
- **`themeName`** / **`theme`**: Override the global color theme for just this slide.
- **`bgVideo`**: Path to a video to loop as a blurred, ambient backdrop behind the content card.
- **`accentIcon`**: Emoji or text (e.g. `✨`) rendered as a massive, semi-transparent watermark.
- **`ticker`**: A scrolling news-style marquee strip pinned to the bottom of the slide.
- **`subtitleBurnIn`**: `true` to render the active `captions.srt` sentence as a solid black bar.
- **`textAnimation`**: `'stagger' | 'pop-in' | 'reveal'` to animate heading/subheading entrances.

---

## 📁 Project Structure

```text
easy-slide-videos/
├── public/assets/        # Slide media (images, video, audio, captions)
├── public/music/         # Background music tracks
├── out/                  # Rendered video files
├── scripts/
│   ├── setup-agent.mjs   # Interactive CLI assistant
│   ├── scan-assets.mjs   # Scans assets/ and updates config.json
│   ├── render.mjs        # Renders config.json → out/output.mp4
│   ├── render-all.mjs    # Batch renders all 10 theme variants
│   └── setup-dummy.mjs   # 13-slide full-feature showcase generator
├── src/
│   ├── index.ts          # Remotion bundler entrypoint
│   ├── Root.tsx          # Dynamic timeline calculator & compositions
│   └── Video.tsx         # Video layout, theme & animation assembler
├── config.json           # Master settings file (generated on scan)
├── config-reels.json     # Portrait (9:16) settings override
└── AGENTS.md             # AI agent instructions (read this first)
```

---

## 🛠️ Getting Started

### 1. Installation
```bash
npm install
```

### 2. Interactive Setup CLI
```bash
npm run setup
```

### 3. Scan Assets Manually
```bash
npm run scan
```

### 4. Preview in Remotion Studio
```bash
npm run studio
```

### 5. Render Final Video
```bash
npm run render          # Landscape MP4
npm run render:reels    # Portrait/Reels MP4
npm run render:all      # All 10 theme variants
```

### 6. Run Full Feature Showcase (13 slides)
```bash
node scripts/setup-dummy.mjs
npm run render
```

---

## ⚙️ Configuration Reference (`config.json`)

### Video Settings
```json
"video": {
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "maxCharactersPerSlide": 450,
  "themeName": "neon-emerald",
  "theme": {
    "backgroundPattern": "grid",
    "cornerDecorations": true
  },
  "fontFamily": "outfit",
  "fontWeight": "600",
  "disableAnimations": false,
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
}
```

### Background Pattern Engine
`video.theme.backgroundPattern`: `grid` | `dots` | `diagonal` | `circuit` | `none`

### Slide Counter Styles
`video.slideCounter.style`: `pill` | `dots` | `fraction` | `minimal`

### Progress Bar Types
`video.progressBar.type`: `line` | `border` | `radial`

### Theme Presets
| Name | Description |
|---|---|
| `royal-indigo` | Deep indigo backdrop, purple-blue neon glow |
| `radiant-gold` | Warm charcoal and amber, glowing gold accents |
| `neon-emerald` | Dark forest setting, emerald neon card outlines |
| `electric-amethyst` | Mystical purple background, light amethyst cards |
| `cyber-cyan` | Deep dark tech-cyan, neon cyan and pink highlights |
| `midnight-magenta` | Dark burgundy-violet, glowing magenta borders |
| `arctic-blue` | Deep ocean night, crisp cyan-blue lines |
| `volcanic-orange` | Volcanic ash, hot orange accents |
| `slate-silver` | Minimalist slate-grey, clean gold highlights |
| `crimson-pulse` | High-contrast red alert, coral neon cards |

### Title/End Page Styles
`standard` · `minimalist` · `thumbnail` · `glassmorphic` · `glassmorphic-media` · `bold-brutalism` · `cyberpunk-neon` · `editorial-serif` · `split-reveal`

### Transitions
`fade` · `slide-left` · `slide-right` · `slide-up` · `slide-down` · `zoom-reveal` · `glitch-blur` · `wipe-right` · `morph-scale` · `cube-rotate`

### Slide Settings
```json
{
  "id": "slide_1",
  "folder": "slide_1",
  "media": "assets/slide_1/media.png",
  "mediaType": "image",
  "heading": "Slide Heading",
  "subheading": "Slide Subheading",
  "content": "Supports **bold**, *accent*, ~~highlight~~, `code`, $LaTeX$, GFM tables.",
  "durationInSeconds": 5,
  "layout": "split-media-right",
  "transition": "zoom-reveal",
  "voiceover": "assets/slide_1/voiceover.wav",
  "bgMusic": "music/slide_theme.mp3",
  "chart": { "type": "bar", "data": [{ "label": "Q1", "value": 150 }] },
  "codeBlock": { "code": "const x = 1;", "language": "javascript", "showLineNumbers": true },
  "countdownFrom": 5,
  "textAlign": "left",
  "fontWeight": "700",
  "overlayOpacity": 0.4
}
```

### Branding + Watermark
```json
"branding": {
  "showLogo": true,
  "logoText": "MY BRAND",
  "position": "top-left",
  "opacity": 0.9,
  "watermarkImage": "branding/watermark.png",
  "watermarkOpacity": 0.12,
  "watermarkSize": 200,
  "watermarkPosition": "bottom-right"
}
```

---

## 🤖 Interactive Agent Setup CLI

Pair-program with an AI assistant and use this prompt to kick off the full agentic workflow:

> **Initial Command to the Agent:**
> `"Hello bot, I want to configure and render a video in this folder. Please run the interactive setup agent by executing npm.cmd run setup, and walk me through the prompts, ask questions, copy slide media assets, scan them, and then render the video and still thumbnails for me."`

---

## 📽️ Preview and Render

```bash
npm run studio          # Open Remotion live preview studio
npm run dashboard       # Open visual web configuration dashboard
npm run render          # Render landscape MP4 → out/output.mp4
npm run render:reels    # Render portrait MP4 → out/reels_output.mp4
npm run render:all      # Batch render all 10 theme variants
```

Still images:
```bash
npx.cmd remotion still Thumbnail out/thumbnail.png --entry-point=src/index.ts
npx.cmd remotion still ReelsThumbnail out/reels_thumbnail.png --entry-point=src/index.ts
```

---

## 📄 License
MIT
