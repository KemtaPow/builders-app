// Cross-platform dev runner for API + Web without extra deps
import { spawn } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();

function run(name, cmd, args, opts = {}) {
  const child = spawn(cmd, args, {
    cwd: root,
    shell: false,
    env: process.env,
    windowsHide: true,
    ...opts,
  });
  const color = name === 'api' ? '\x1b[36m' : '\x1b[35m'; // cyan / magenta
  const reset = '\x1b[0m';
  const prefix = `[${name}]`;

  const pipe = (stream, isErr = false) => {
    const rl = readline.createInterface({ input: stream });
    rl.on('line', line => {
      process[isErr ? 'stderr' : 'stdout'].write(`${color}${prefix}${reset} ${line}\n`);
    });
    rl.on('close', () => {/* noop */});
  };

  pipe(child.stdout);
  pipe(child.stderr, true);

  child.on('exit', code => {
    process.stdout.write(`${color}${prefix}${reset} exited with code ${code}\n`);
  });
  return child;
}

const procs = [
  run('api', 'pnpm', ['--filter', '@app/api', 'run', 'dev']),
  run('web', 'pnpm', ['--filter', '@app/web', 'dev'])
];

function cleanExit() {
  for (const p of procs) {
    try { p.kill('SIGINT'); } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
