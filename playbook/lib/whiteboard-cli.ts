import path from 'node:path';
import { spawn } from 'node:child_process';

type RenderOpts = {
  inputJson: string;
  outputPath: string;
  scale?: number;
  verbose?: boolean;
};

function getCliBinPath(): string {
  // `@larksuite/whiteboard-cli` is a dependency of this repo, so `.bin` should exist after install.
  // On Windows it would be `whiteboard-cli.cmd`, but this repo targets Node>=18 and primarily mac/linux.
  const binName = process.platform === 'win32' ? 'whiteboard-cli.cmd' : 'whiteboard-cli';
  return path.join(process.cwd(), 'node_modules', '.bin', binName);
}

export async function renderWithWhiteboardCli(opts: RenderOpts): Promise<void> {
  const bin = getCliBinPath();
  const args = ['-o', opts.outputPath];
  if (opts.scale != null) args.push('-s', String(opts.scale));
  if (opts.verbose) args.push('-V');

  await new Promise<void>((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stderr = '';

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('error', (err) => reject(err));
    child.on('exit', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`whiteboard-cli exited with code ${code}\n${stderr}`.trim()));
    });

    child.stdin.write(opts.inputJson);
    child.stdin.end();
  });
}

