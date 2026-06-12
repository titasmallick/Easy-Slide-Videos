# Agent Instructions - Easy-Slide-Videos Generator

This project is a custom slideshow video generator built with Remotion and React. Future AI assistants working on this codebase must adhere to the instructions and guidelines outlined below.

---

## 🛠️ Tech Stack & Key Files
* **Framework**: Remotion (v4+) & React (v18+)
* **Main Entry Point**: [src/index.ts](file:///D:/GITHUB/BalerKaj/src/index.ts)
* **Composition Manager**: [src/Root.tsx](file:///D:/GITHUB/BalerKaj/src/Root.tsx) (Handles dynamic layout sizes, FPS, durations, and composition registrations)
* **Video Component**: [src/Video.tsx](file:///D:/GITHUB/BalerKaj/src/Video.tsx) (Manages transitions, slide mappings, typography, themes, LaTeX, charts, slide counter)
* **Configuration Files**:
  * [config.json](file:///D:/GITHUB/BalerKaj/config.json) (Landscape version metadata and defaults)
  * [config-reels.json](file:///D:/GITHUB/BalerKaj/config-reels.json) (Portrait version metadata and overrides)
* **Asset Scanner**: [scripts/scan-assets.mjs](file:///D:/GITHUB/BalerKaj/scripts/scan-assets.mjs) (Auto-detects and compiles slides)
* **Showcase Generator**: [scripts/setup-dummy.mjs](file:///D:/GITHUB/BalerKaj/scripts/setup-dummy.mjs) (10-slide feature showcase with BMP placeholders)
* **Setup Agent**: [scripts/setup-agent.mjs](file:///D:/GITHUB/BalerKaj/scripts/setup-agent.mjs) (Interactive CLI setup)

---

## 🚀 Common Workflow Operations

### 1. Scanning Assets
If assets under the `assets/` directory are added, deleted, or restructured, run:
```bash
npm run scan
```
This executes `scripts/scan-assets.mjs` which auto-detects content, splits long texts, maps media start times, and compiles the slide array in `config.json`.

### 2. Running the Full Feature Showcase (10 slides)
```bash
node scripts/setup-dummy.mjs
```
This generates BMP placeholder images (Chromium-compatible, no SVG), a silent WAV, and a 10-slide `config.json` covering every engine feature.

### 3. Rendering Videos
* **Landscape Video (1920x1080)**:
  ```bash
  npx.cmd remotion render MainVideo out/output.mp4 --entry-point=src/index.ts --overwrite
  ```
* **Portrait Reels Video (1080x1920)**:
  ```bash
  npx.cmd remotion render Reels out/reels_output.mp4 --entry-point=src/index.ts --overwrite
  ```

### 4. Rendering Thumbnails (Thumbnail Maker)
* **Landscape Thumbnail Card (16:9)**:
  ```bash
  npx.cmd remotion still Thumbnail out/landscape_thumbnail.png --entry-point=src/index.ts --overwrite
  ```
* **Portrait Reels Thumbnail Card (9:16)**:
  ```bash
  npx.cmd remotion still ReelsThumbnail out/reels_thumbnail.png --entry-point=src/index.ts --overwrite
  ```

---

## ⚙️ Key Configuration Flags

### Optional Transition/Animation Toggle
```json
"video": {
  "disableAnimations": true
}
```
When `true`, this flag hardcodes spring entrance scales to `1`, entrance translations to `0`, and exit fades to `1` across all slide layouts.

---

### Slide Counter Overlay
Displays the current slide number during content slides. Hides automatically on title/end pages.
```json
"video": {
  "slideCounter": {
    "show": true,
    "position": "bottom-right",
    "style": "pill",
    "color": ""
  }
}
```
**Positions**: `top-left` | `top-right` | `bottom-left` | `bottom-right` | `top-center` | `bottom-center`

**Styles**:
| Style | Appearance |
|---|---|
| `pill` | Glassmorphic capsule with animated dot (default) |
| `dots` | One expanding dot per slide |
| `fraction` | Glassmorphic `current / total` display |
| `minimal` | Monospace `01 / 08` counter |

---

### Background Pattern Engine
Controls the subtle tile pattern layered over the background gradient:
```json
"video": {
  "theme": {
    "backgroundPattern": "grid",
    "cornerDecorations": true
  }
}
```
**Patterns**: `grid` (default) | `dots` | `diagonal` | `circuit` | `none`

Set `cornerDecorations: false` to hide the bracket corners in slide layouts.

---

### Progress Bar Overlay
```json
"video": {
  "progressBar": {
    "show": true,
    "type": "border",
    "position": "bottom",
    "color": "",
    "height": 8,
    "thickness": 6,
    "glow": true
  }
}
```
**Types**: `line` | `border` | `radial`

---

### Screen Border / Frame
```json
"video": {
  "border": {
    "show": true,
    "color": "",
    "width": 12,
    "radius": 24,
    "glow": true
  }
}
```

---

## 📊 Slide-Level Features

### Charts (SVG, dependency-free)
Add a `chart` object to any slide:
```json
"chart": {
  "type": "bar",
  "data": [
    { "label": "Q1", "value": 150 },
    { "label": "Q2", "value": 240 }
  ],
  "color": "#34D399"
}
```
**Types**: `bar` | `line` | `pie` | `donut`

Use `"layout": "chart-only"` to render chart full-screen, or any other layout to render it in the media panel.

---

### LaTeX Math Equations (KaTeX)
In any `content` or `heading` field, use standard LaTeX syntax:

**Inline**: `$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$`

**Block display**:
```
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
```

Rendered via `remark-math` + `rehype-katex` in the `MarkdownText` component. KaTeX CSS is injected automatically at render time.

---

### Markdown Formatting
| Syntax | Result |
|---|---|
| `**bold**` | Accent-colored bold text |
| `*italic*` | Italic with theme color |
| `~~highlight~~` | Glow highlight marker |
| `` `code` `` | Monospace code badge |
| `[link](highlight)` | Highlight style |
| GFM tables | Full pipe-table support |
| `$...$` / `$$...$$` | LaTeX math via KaTeX |

---

### Slide Layouts
| Layout | Description |
|---|---|
| `split-media-right` | Text left, media/chart right |
| `split-media-left` | Media/chart left, text right |
| `text-only` | Full-width centered text block |
| `media-only` | Full-screen media |
| `full-background-media` | Media as background, text overlay |
| `grid-collage` | Multi-image collage grid |
| `chart-only` | Full-screen chart with heading |

---

## ⚠️ Hard Constraints for Agents

1. **Win32 Execution**: Always use `npx.cmd` instead of `npx` on Windows systems to bypass PowerShell script execution restrictions.
2. **Terminal Operations**: Never propose `cd` commands. Always specify the directory explicitly in the working directory parameter (`Cwd`).
3. **No SVG Placeholders**: Remotion's Chromium renderer cannot decode SVG files loaded via `staticFile()`. Use BMP or PNG images for placeholders. The `setup-dummy.mjs` script generates BMP images via pure Node.js (no canvas/sharp required).
4. **Media File Formats**: Supported image formats: `.bmp`, `.png`, `.jpg`, `.jpeg`, `.webp`. Supported video: `.mp4`, `.webm`. Supported audio: `.wav`, `.mp3`, `.aac`.
5. **KaTeX CSS**: The `Video.tsx` module injects KaTeX CSS into `document.head` automatically at startup. Do not add external CDN links.
