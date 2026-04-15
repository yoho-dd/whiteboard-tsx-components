import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { PlaybookStory } from '../types.js';

export type LoadedStory = Required<Pick<PlaybookStory, 'id' | 'title' | 'render'>> &
  Pick<PlaybookStory, 'description' | 'category'> & {
    filePath: string;
  };

function normalizeStory(input: unknown, filePath: string): LoadedStory {
  if (typeof input !== 'object' || input == null) {
    throw new Error(`Invalid story export (not an object): ${filePath}`);
  }
  const story = input as any;
  const baseId = path.basename(filePath).replace(/\.[^.]+$/, '');
  const id = typeof story.id === 'string' && story.id.trim() ? story.id : baseId;
  if (typeof story.title !== 'string' || !story.title.trim()) {
    throw new Error(`Story is missing "title": ${filePath}`);
  }
  if (typeof story.render !== 'function') {
    throw new Error(`Story is missing "render()": ${filePath}`);
  }
  const description = typeof story.description === 'string' ? story.description : undefined;
  const category = typeof story.category === 'string' && story.category.trim()
    ? story.category
    : 'Ungrouped';
  return { id, title: story.title, description, category, render: story.render, filePath };
}

export async function findStoryFiles(storiesDir: string): Promise<string[]> {
  async function walk(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await walk(fullPath));
      } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  const files = await walk(storiesDir);
  return files.sort((a, b) => a.localeCompare(b));
}

export async function loadStories(storiesDir: string): Promise<LoadedStory[]> {
  const files = await findStoryFiles(storiesDir);
  const loaded: LoadedStory[] = [];

  for (const filePath of files) {
    // Cache-bust so that repeated rebuilds in the same process pick up edits.
    const url = pathToFileURL(filePath).href + `?t=${Date.now()}`;
    const mod = await import(url);
    const candidate = mod.default ?? mod.story;
    loaded.push(normalizeStory(candidate, filePath));
  }

  return loaded;
}
