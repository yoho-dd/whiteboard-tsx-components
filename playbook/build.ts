import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureDir } from './lib/fs.js';
import { renderIndexHtml } from './lib/html.js';
import { loadStories } from './lib/stories.js';
import { renderWithWhiteboardCli } from './lib/whiteboard-cli.js';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const playbookDir = path.join(rootDir, 'playbook');
const storiesDir = path.join(playbookDir, 'stories');
const clientDir = path.join(playbookDir, 'client');
const distDir = path.join(playbookDir, 'dist');
const outDir = path.join(distDir, 'out');
const vendorDir = path.join(distDir, 'vendor');
const assetsDir = path.join(distDir, 'assets');
const monacoSourceDir = path.join(rootDir, 'node_modules', 'monaco-editor', 'min', 'vs');
const monacoDistDir = path.join(vendorDir, 'monaco', 'vs');

export type BuildResult = {
  storyCount: number;
  buildNonce: string;
};

export async function buildPlaybook(): Promise<BuildResult> {
  await ensureDir(distDir);
  await ensureDir(outDir);
  await ensureDir(vendorDir);
  await ensureDir(assetsDir);
  await fs.cp(monacoSourceDir, monacoDistDir, { recursive: true });
  await fs.cp(clientDir, assetsDir, { recursive: true });

  const stories = await loadStories(storiesDir);
  const buildNonce = new Date().toISOString();
  const manifestStories = [];

  for (const story of stories) {
    const doc = await story.render();
    const json = JSON.stringify(doc, null, 2);
    const storySource = await fs.readFile(story.filePath, 'utf8');

    await renderWithWhiteboardCli({
      inputJson: json,
      outputPath: path.join(outDir, `${story.id}.png`),
      scale: 2,
    });

    await fs.writeFile(path.join(outDir, `${story.id}.json`), json, 'utf8');
    await fs.writeFile(path.join(outDir, `${story.id}.tsx`), storySource, 'utf8');

    manifestStories.push({
      id: story.id,
      category: story.category,
      title: story.title,
      description: story.description,
      filePath: story.filePath,
      image: `out/${story.id}.png`,
      dsl: `out/${story.id}.json`,
      source: `out/${story.id}.tsx`,
    });
  }

  const manifest = {
    buildNonce,
    stories: manifestStories,
  };

  await fs.writeFile(path.join(distDir, 'index.html'), renderIndexHtml(manifest), 'utf8');
  await fs.writeFile(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  return {
    storyCount: stories.length,
    buildNonce,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await buildPlaybook();
  console.log(`Built ${result.storyCount} playbook stories`);
}
