import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function run() {
  const args = process.argv.slice(2);
  const stillArg = args.find(arg => arg.startsWith('--still='));
  
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const entryPoint = path.join(projectRoot, 'src', 'index.ts');
  const outDir = path.join(projectRoot, 'out');
  
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  if (stillArg) {
    const compositionId = stillArg.split('=')[1];
    const outputPath = path.join(outDir, `${compositionId.toLowerCase()}.png`);
    console.log(`\n--- STARTING STILL IMAGE RENDER: ${compositionId} ---`);
    
    const cmdArgs = [
      'remotion', 'still',
      compositionId,
      `"${outputPath}"`,
      `--entry-point="${entryPoint}"`,
      '--overwrite'
    ];
    
    console.log(`Running: ${npxCmd} ${cmdArgs.join(' ')}`);
    const stillProcess = spawn(npxCmd, cmdArgs, { shell: true, cwd: projectRoot });
    
    stillProcess.stdout.on('data', data => process.stdout.write(data.toString()));
    stillProcess.stderr.on('data', data => process.stderr.write(data.toString()));
    
    return new Promise((resolve, reject) => {
      stillProcess.on('close', code => {
        if (code === 0) {
          console.log(`\n🎉 Success! Rendered still saved to: ${outputPath}`);
          resolve();
        } else {
          console.error(`\n❌ Still render failed with code: ${code}`);
          reject(new Error(`Exit code ${code}`));
        }
      });
    });
  } else {
    // Normal video rendering
    const outputPath = path.join(outDir, 'output.mp4');
    console.log('\n--- STARTING VIDEO RENDER ---');
    
    const cmdArgs = [
      'remotion', 'render', 
      'MainVideo', 
      `"${outputPath}"`, 
      `--entry-point="${entryPoint}"`, 
      '--overwrite'
    ];
    
    console.log(`Running: ${npxCmd} ${cmdArgs.join(' ')}`);
    const renderProcess = spawn(npxCmd, cmdArgs, { shell: true, cwd: projectRoot });
    
    renderProcess.stdout.on('data', data => process.stdout.write(data.toString()));
    renderProcess.stderr.on('data', data => process.stderr.write(data.toString()));
    
    return new Promise((resolve, reject) => {
      renderProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`\n🎉 Success! Rendered video saved to: ${outputPath}`);
          resolve();
        } else {
          console.error(`\n❌ Render failed with exit code: ${code}`);
          reject(new Error(`Exit code ${code}`));
        }
      });
    });
  }
}

run().catch(console.error);
