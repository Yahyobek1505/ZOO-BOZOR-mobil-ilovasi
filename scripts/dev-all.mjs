// Starts the API server (port 5000) and the Expo web app (port 8082) together: `pnpm dev`.
// The app reads listings and the signed-in account from the API, so running only Expo shows
// "Server bilan bogʻlanib boʻlmadi" and Google sign-in cannot finish.
import { spawn } from 'node:child_process';

const jobs = [
  { name: 'api', color: '\x1b[36m', cmd: 'pnpm --filter @workspace/api-server run dev' },
  { name: 'web', color: '\x1b[35m', cmd: 'pnpm --filter @workspace/zoo-bozor exec expo start --web --port 8082' },
];

const children = jobs.map(({ name, color, cmd }) => {
  const child = spawn(cmd, { shell: true, stdio: ['inherit', 'pipe', 'pipe'], env: process.env });
  const prefix = `${color}[${name}]\x1b[0m `;
  const pipe = (stream, out) => stream.on('data', (chunk) => {
    out.write(chunk.toString().split(/\r?\n/).filter(Boolean).map((line) => prefix + line).join('\n') + '\n');
  });
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on('exit', (code) => {
    console.log(`${prefix}toʻxtadi (kod ${code}). Qolganlari ham toʻxtatiladi.`);
    stopAll(code ?? 0);
  });
  return child;
});

let stopping = false;
function stopAll(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null) {
      // shell:true wraps the command, so kill the whole tree on Windows.
      if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F']);
      else child.kill('SIGINT');
    }
  }
  setTimeout(() => process.exit(code), 500);
}
process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
