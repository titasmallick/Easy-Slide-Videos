#!/usr/bin/env node
/**
 * render-all.mjs — Batch Render Script
 * Renders the MainVideo composition in every available theme and saves each to out/output_<theme>.mp4
 * Usage: npm run render:all
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const configPath = path.join(projectRoot, 'config.json');

const THEMES = [
  'royal-indigo',
  'radiant-gold',
  'neon-emerald',
  'electric-amethyst',
  'cyber-cyan',
  'midnight-magenta',
  'arctic-blue',
  'volcanic-orange',
  'slate-silver',
  'crimson-pulse',
];

if (!fs.existsSync(configPath)) {
  console.error('❌ config.json not found. Run npm run scan first.');
  process.exit(1);
}

const originalConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const outDir = path.join(projectRoot, 'out');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log(`\n🎬 Easy-Slide-Videos Batch Renderer`);
console.log(`   Rendering ${THEMES.length} theme variants...\n`);

let passed = 0;
let failed = 0;

for (const theme of THEMES) {
  const outFile = `out/output_${theme}.mp4`;
  console.log(`\n🎨 Rendering theme: ${theme}`);
  console.log(`   → ${outFile}`);

  // Patch config with this theme
  const patchedConfig = JSON.parse(JSON.stringify(originalConfig));
  patchedConfig.video.themeName = theme;
  fs.writeFileSync(configPath, JSON.stringify(patchedConfig, null, 2));

  try {
    execSync(
      `npx.cmd remotion render MainVideo ${outFile} --entry-point=src/index.ts --overwrite`,
      { cwd: projectRoot, stdio: 'inherit' }
    );
    console.log(`   ✅ Done → ${outFile}`);
    passed++;
  } catch (err) {
    console.error(`   ❌ Failed for theme: ${theme}`);
    failed++;
  }
}

// Restore original config
fs.writeFileSync(configPath, JSON.stringify(originalConfig, null, 2));

console.log(`\n─────────────────────────────────────────────`);
console.log(`✅ Batch render complete: ${passed} succeeded, ${failed} failed`);
console.log(`📁 Output files saved to: out/`);
console.log(`─────────────────────────────────────────────\n`);
