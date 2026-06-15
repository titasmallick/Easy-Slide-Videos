import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { validateConfig } from './schema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.wav': 'audio/wav',
};

// Start Server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API ENDPOINTS ---

  // 1. GET /api/config: Load config.json
  if (pathname === '/api/config' && req.method === 'GET') {
    const configPath = path.join(projectRoot, 'config.json');
    if (!fs.existsSync(configPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'config.json not found' }));
      return;
    }
    try {
      const config = fs.readFileSync(configPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(config);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read config.json', details: e.message }));
    }
  // 2. POST /api/config: Save config.json
  if (pathname === '/api/config' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const configPath = path.join(projectRoot, 'config.json');
        const parsed = JSON.parse(body);
        const validatedConfig = validateConfig(parsed);
        fs.writeFileSync(configPath, JSON.stringify(validatedConfig, null, 2), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Configuration saved successfully!' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid config format or write failed', details: e.message }));
      }
    });
    return;
  }

  // 3. POST /api/scan: Trigger scan-assets
  if (pathname === '/api/scan' && req.method === 'POST') {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked'
    });

    res.write('⚡ Starting Asset Scanner...\n');
    const child = spawn('node', ['scripts/scan-assets.mjs'], { cwd: projectRoot });

    child.stdout.on('data', (data) => {
      res.write(data);
    });

    child.stderr.on('data', (data) => {
      res.write(`⚠️ ERROR: ${data}`);
    });

    child.on('close', (code) => {
      res.write(`\n✅ Asset scan completed with code ${code}.\n`);
      res.end();
    });
    return;
  }

  // 4. POST /api/render: Render Remotion Video
  if (pathname === '/api/render' && req.method === 'POST') {
    const composition = url.searchParams.get('composition') || 'MainVideo';
    const isPortrait = composition === 'Reels' || composition === 'ReelsThumbnail' || composition === 'Shorts' || composition === 'Teaser';
    const outputFilename = isPortrait ? 'reels_output.mp4' : 'output.mp4';
    
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked'
    });

    res.write(`🎬 Starting Remotion render for composition: [${composition}] -> out/${outputFilename}\n`);
    res.write(`---------------------------------------------------------------------------------\n`);

    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const args = ['remotion', 'render', composition, `out/${outputFilename}`, '--entry-point=src/index.ts', '--overwrite', '--gl=swiftshader'];

    console.log(`Executing: ${cmd} ${args.join(' ')}`);
    const child = spawn(cmd, args, { cwd: projectRoot, shell: process.platform === 'win32' });

    child.stdout.on('data', (data) => {
      res.write(data);
    });

    child.stderr.on('data', (data) => {
      res.write(data);
    });

    child.on('close', (code) => {
      if (code === 0) {
        res.write(`\n🎉 SUCCESS! Render completed successfully. File written to out/${outputFilename}\n`);
      } else {
        res.write(`\n❌ Render failed with exit code ${code}.\n`);
      }
      res.end();
    });
    return;
  }

  // 5. POST /api/preview: Render Still Slide Preview
  if (pathname === '/api/preview' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { slideIndex, composition } = JSON.parse(body);
        
        // Read current config
        const configPath = path.join(projectRoot, 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        
        const slide = config.slides[slideIndex];
        if (!slide) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Slide not found' }));
          return;
        }

        const fps = config.video.fps || 30;
        // Calculate settled frame (2s in or half duration)
        const offset = Math.min(2, slide.durationInSeconds / 2);
        const previewTime = (slide.startTime || 0) + offset;
        const frame = Math.round(previewTime * fps);

        // Define temp preview path
        const tempDir = path.join(projectRoot, 'public', 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const previewFilename = `preview_slide_${slideIndex}.png`;
        const previewPath = path.join(tempDir, previewFilename);

        const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        const args = [
          'remotion', 
          'still', 
          composition || 'MainVideo', 
          previewPath, 
          `--frame=${frame}`, 
          '--entry-point=src/index.ts', 
          '--overwrite',
          '--gl=swiftshader'
        ];

        console.log(`Executing preview render: ${cmd} ${args.join(' ')}`);
        
        const child = spawn(cmd, args, { cwd: projectRoot, shell: process.platform === 'win32' });
        
        let stderrData = '';
        child.stderr.on('data', data => {
          stderrData += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true, 
              url: `/temp/${previewFilename}?t=${Date.now()}` 
            }));
          } else {
            console.error(`Preview render failed: ${stderrData}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to render still frame', details: stderrData }));
          }
        });

      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // --- STATIC FILES SERVING ---
  console.log(`[Request] ${req.method} ${pathname}`);

  // Default to dashboard.html for the root
  let targetPath = pathname === '/' ? '/dashboard.html' : pathname;
  
  // Clean up directory traversal attempts and strip leading slashes/backslashes
  targetPath = path.normalize(targetPath).replace(/^(\.\.[\/\\])+/, '');
  const cleanRelativePath = targetPath.replace(/^[\/\\]+/, '');
  
  let localPath = path.join(projectRoot, 'public', cleanRelativePath);
  console.log(`  -> Trying public path: ${localPath}`);

  // Fallback: If not found in public/, check project root (for config/assets convenience)
  if (!fs.existsSync(localPath)) {
    localPath = path.join(projectRoot, cleanRelativePath);
    console.log(`  -> Not found in public/, trying project root path: ${localPath}`);
  }

  const exists = fs.existsSync(localPath) && fs.statSync(localPath).isFile();
  console.log(`  -> Exists: ${exists}`);

  if (exists) {
    const ext = path.extname(localPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    console.log(`  -> Serving file as: ${contentType}`);
    
    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(localPath);
    stream.pipe(res);
  } else {
    console.log(`  -> Returning 404 Not Found`);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

let currentPort = PORT;

function startServer(port) {
  currentPort = port;
  server.listen(port, () => {
    console.log(`================================================================`);
    console.log(`🌐 EASY-SLIDE-VIDEOS DASHBOARD ACTIVE ON: http://localhost:${port}`);
    console.log(`================================================================`);
  });
}

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${currentPort} is occupied. Retrying on port ${currentPort + 1}...`);
    startServer(currentPort + 1);
  } else {
    console.error(e);
  }
});

startServer(PORT);
