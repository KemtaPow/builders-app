// API dev runner: builds with tsc -w and restarts server on dist changes
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(__dirname, '..');
const distDir = path.join(apiDir, 'dist');
const rootDir = path.resolve(apiDir, '..', '..');

function parseEnvFile(p) {
  const out = {};
  try {
    const txt = fs.readFileSync(p, 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    }
  } catch {}
  return out;
}

const envFromDotenv = parseEnvFile(path.join(rootDir, '.env'));

let server = null;
function startServer() {
  if (server) {
    try { server.kill('SIGINT'); } catch {}
    server = null;
  }
  server = spawn(process.execPath, ['dist/main.js'], {
    cwd: apiDir,
    env: { ...process.env, ...envFromDotenv },
    stdio: 'inherit',
    windowsHide: true,
  });
}

function waitFor(filePath) {
  return new Promise(resolve => {
    if (fs.existsSync(filePath)) return resolve();
    const iv = setInterval(() => {
      if (fs.existsSync(filePath)) { clearInterval(iv); resolve(); }
    }, 250);
  });
}

// Start TypeScript in watch mode using local binary (cross-platform)
const isWin = process.platform === 'win32';
const ext = isWin ? '.CMD' : '';
const tscBin = path.join(apiDir, 'node_modules', '.bin', `tsc${ext}`);
const tscCmd = isWin ? 'cmd.exe' : tscBin;
const tscArgs = isWin ? ['/c', tscBin, '-p', 'tsconfig.json', '-w', '--preserveWatchOutput'] : ['-p', 'tsconfig.json', '-w', '--preserveWatchOutput'];
const tsc = spawn(tscCmd, tscArgs, {
  cwd: apiDir,
  stdio: 'inherit',
  windowsHide: true,
});

// Start server when first build is ready
await waitFor(path.join(distDir, 'main.js'));
startServer();

// Watch dist to restart the server on changes
let restartTimer = null;
try {
  fs.watch(distDir, { recursive: false }, () => {
    clearTimeout(restartTimer);
    restartTimer = setTimeout(() => startServer(), 200);
  });
} catch {
  // If fs.watch fails (e.g., folder missing), poll as fallback
  setInterval(() => {
    if (fs.existsSync(path.join(distDir, 'main.js'))) {
      startServer();
    }
  }, 1000);
}

function clean() {
  try { tsc.kill('SIGINT'); } catch {}
  try { server && server.kill('SIGINT'); } catch {}
  process.exit(0);
}

process.on('SIGINT', clean);
process.on('SIGTERM', clean);
