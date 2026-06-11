import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const themes = [
  "arctic-blue",
  "neon-emerald",
  "electric-amethyst",
  "crimson-pulse",
  "cyber-cyan",
  "midnight-magenta",
  "volcanic-orange",
  "slate-silver",
  "royal-indigo",
  "radiant-gold"
];

const targetRepoOut = "D:\\GITHUB\\BalerKaj\\out";

function renderTheme(theme) {
  return new Promise((resolve, reject) => {
    console.log(`\n====================================================`);
    console.log(`🚀 STARTING RENDER FOR THEME: ${theme.toUpperCase()}`);
    console.log(`====================================================\n`);

    const renderProcess = spawn('node', ['scripts/render-theme.mjs', theme], {
      shell: true,
      cwd: projectRoot,
      stdio: 'inherit'
    });

    renderProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n🎉 Success rendering theme: ${theme}`);
        resolve();
      } else {
        console.error(`\n❌ Render failed for theme: ${theme} with code: ${code}`);
        reject(new Error(`Exit code ${code}`));
      }
    });
  });
}

function copyOutputToRepo(theme) {
  const localFile = path.join(projectRoot, 'out', `output_${theme}.mp4`);
  const targetFile = path.join(targetRepoOut, `output_${theme}.mp4`);
  
  if (!fs.existsSync(localFile)) {
    console.log(`Skipping copy, file does not exist: ${localFile}`);
    return;
  }

  if (!fs.existsSync(targetRepoOut)) {
    fs.mkdirSync(targetRepoOut, { recursive: true });
  }

  console.log(`📂 Syncing output_${theme}.mp4 to: ${targetFile}`);
  fs.copyFileSync(localFile, targetFile);
}

async function main() {
  console.log(`Starting bulk render of all ${themes.length} color themes...`);
  const startTime = Date.now();

  for (const theme of themes) {
    try {
      await renderTheme(theme);
      copyOutputToRepo(theme);
    } catch (err) {
      console.error(`Skipping copy for failed theme: ${theme}`);
    }
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n====================================================`);
  console.log(`🎯 BULK THEME RENDERING COMPLETE!`);
  console.log(`Total duration: ${Math.floor(durationSec / 60)}m ${durationSec % 60}s`);
  console.log(`====================================================\n`);
}

main().catch(console.error);
