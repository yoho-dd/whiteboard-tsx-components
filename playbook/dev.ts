import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const playbookDir = path.join(rootDir, 'playbook');
const distDir = path.join(playbookDir, 'dist');
const watchRoots = [path.join(rootDir, 'src'), path.join(playbookDir, 'stories')];
const port = Number(process.env.PLAYBOOK_PORT || 4321);

const clients = new Set<http.ServerResponse>();
let buildInFlight: Promise<void> | null = null;
let pendingRebuild = false;

function contentType(filePath: string): string {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return 'text/plain; charset=utf-8';
  if (filePath.endsWith('.ttf')) return 'font/ttf';
  if (filePath.endsWith('.woff')) return 'font/woff';
  if (filePath.endsWith('.woff2')) return 'font/woff2';
  if (filePath.endsWith('.map')) return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

function notifyReload(): void {
  for (const client of clients) {
    client.write('data: reload\n\n');
  }
}

async function runBuild(reason: string): Promise<void> {
  if (buildInFlight) {
    pendingRebuild = true;
    return;
  }

  buildInFlight = (async () => {
    try {
      const buildSummary = await runBuildCommand();
      console.log(`[playbook] ${buildSummary} (${reason})`);
      notifyReload();
    } catch (error) {
      console.error('[playbook] build failed');
      console.error(error);
    } finally {
      buildInFlight = null;
      if (pendingRebuild) {
        pendingRebuild = false;
        void runBuild('queued change');
      }
    }
  })();

  await buildInFlight;
}

async function runBuildCommand(): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const child = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'playbook/build.ts'], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('error', (err) => reject(err));
    child.on('exit', (code) => {
      if (code === 0) {
        const summary = stdout.trim().split('\n').filter(Boolean).pop() ?? 'build complete';
        resolve(summary);
        return;
      }
      reject(new Error(`playbook build exited with code ${code}\n${stderr || stdout}`.trim()));
    });
  });
}

function createServer(): http.Server {
  return http.createServer((req, res) => {
    const reqUrl = new URL(req.url || '/', `http://${req.headers.host || `localhost:${port}`}`);
    if (reqUrl.pathname === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      });
      res.write('\n');
      clients.add(res);
      req.on('close', () => {
        clients.delete(res);
      });
      return;
    }

    const filePath = reqUrl.pathname === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, reqUrl.pathname.replace(/^\/+/, ''));

    if (!filePath.startsWith(distDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType(filePath) });
      res.end(data);
    });
  });
}

let debounceTimer: NodeJS.Timeout | undefined;
function queueBuild(reason: string): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void runBuild(reason);
  }, 120);
}

for (const watchRoot of watchRoots) {
  fs.watch(watchRoot, { recursive: true }, (_eventType, filename) => {
    if (!filename) return;
    if (filename.includes('/dist/') || filename.includes('\\dist\\')) return;
    queueBuild(`${path.basename(watchRoot)} changed: ${filename}`);
  });
}

await runBuild('initial');

const server = createServer();
server.listen(port, () => {
  console.log(`[playbook] http://localhost:${port}`);
});
