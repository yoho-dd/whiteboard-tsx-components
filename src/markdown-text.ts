/**
 * Markdown Enhanced Text Parser
 *
 * Converts markdown-like syntax to WBTextRun[].
 *
 * Supported syntax:
 *   **bold**              → { bold: true }
 *   *italic*              → { italic: true }
 *   ~~strikethrough~~     → { strikeThrough: true }
 *   <color=#HEX>text</color>  → { color: '#HEX' }
 *   <bg=#HEX>text</bg>        → { backgroundColor: '#HEX' }
 *   <size=N>text</size>        → { fontSize: N }
 *   \n                         → line break (new run)
 */

import type { WBTextRun } from './auto-layout-dsl/types.js';

// ─── Detection ──────────────────────────────────────────────────────────────

const MD_PATTERN = /\*\*|(?<!\*)\*(?!\*)|\~\~|<(?:color|bg|size)=/;

/** Returns true if the input contains any markdown-like markup. */
function hasMarkdown(input: string): boolean {
  return MD_PATTERN.test(input);
}

// ─── Tokenizer ──────────────────────────────────────────────────────────────

interface StyleState {
  bold?: boolean;
  italic?: boolean;
  strikeThrough?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
}

/**
 * Parse a markdown-enhanced string into WBTextRun[].
 * If no markup is found, returns the original string for simplicity.
 */
export function parseMarkdownText(input: string): string | WBTextRun[] {
  if (!hasMarkdown(input)) return input;

  const runs: WBTextRun[] = [];
  const styleStack: StyleState[] = [{}];
  let pos = 0;
  let currentText = '';

  function flushText() {
    if (currentText.length > 0) {
      const style = styleStack[styleStack.length - 1];
      const run: WBTextRun = { content: currentText };
      if (style.bold) run.bold = true;
      if (style.italic) run.italic = true;
      if (style.strikeThrough) run.strikeThrough = true;
      if (style.color) run.color = style.color;
      if (style.backgroundColor) run.backgroundColor = style.backgroundColor;
      if (style.fontSize) run.fontSize = style.fontSize;
      runs.push(run);
      currentText = '';
    }
  }

  function currentStyle(): StyleState {
    return { ...styleStack[styleStack.length - 1] };
  }

  while (pos < input.length) {
    // Bold: **text**
    if (input[pos] === '*' && input[pos + 1] === '*') {
      flushText();
      pos += 2;
      const end = input.indexOf('**', pos);
      if (end === -1) {
        currentText += '**';
        continue;
      }
      const innerText = input.slice(pos, end);
      const style = currentStyle();
      style.bold = true;
      styleStack.push(style);
      // Recursively parse inner content
      const innerRuns = parseInnerRuns(innerText, style);
      runs.push(...innerRuns);
      styleStack.pop();
      pos = end + 2;
      continue;
    }

    // Italic: *text* (not **)
    if (input[pos] === '*' && input[pos + 1] !== '*' && (pos === 0 || input[pos - 1] !== '*')) {
      flushText();
      pos += 1;
      const end = findClosingMark(input, pos, '*');
      if (end === -1) {
        currentText += '*';
        continue;
      }
      const innerText = input.slice(pos, end);
      const style = currentStyle();
      style.italic = true;
      styleStack.push(style);
      const innerRuns = parseInnerRuns(innerText, style);
      runs.push(...innerRuns);
      styleStack.pop();
      pos = end + 1;
      continue;
    }

    // Strikethrough: ~~text~~
    if (input[pos] === '~' && input[pos + 1] === '~') {
      flushText();
      pos += 2;
      const end = input.indexOf('~~', pos);
      if (end === -1) {
        currentText += '~~';
        continue;
      }
      const innerText = input.slice(pos, end);
      const style = currentStyle();
      style.strikeThrough = true;
      styleStack.push(style);
      const innerRuns = parseInnerRuns(innerText, style);
      runs.push(...innerRuns);
      styleStack.pop();
      pos = end + 2;
      continue;
    }

    // HTML-like tags: <color=#HEX>text</color>, <bg=#HEX>text</bg>, <size=N>text</size>
    if (input[pos] === '<') {
      const tagMatch = input.slice(pos).match(/^<(color|bg|size)=([^>]+)>/);
      if (tagMatch) {
        flushText();
        const [fullMatch, tagName, value] = tagMatch;
        pos += fullMatch.length;
        const closeTag = `</${tagName}>`;
        const end = input.indexOf(closeTag, pos);
        if (end === -1) {
          currentText += fullMatch;
          continue;
        }
        const innerText = input.slice(pos, end);
        const style = currentStyle();
        if (tagName === 'color') style.color = value;
        else if (tagName === 'bg') style.backgroundColor = value;
        else if (tagName === 'size') style.fontSize = parseInt(value, 10);
        styleStack.push(style);
        const innerRuns = parseInnerRuns(innerText, style);
        runs.push(...innerRuns);
        styleStack.pop();
        pos = end + closeTag.length;
        continue;
      }
    }

    // Regular character
    currentText += input[pos];
    pos++;
  }

  flushText();

  // If we only got a single plain run, return as string
  if (runs.length === 1 && isPlainRun(runs[0])) {
    return runs[0].content;
  }

  return runs;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseInnerRuns(text: string, baseStyle: StyleState): WBTextRun[] {
  // For simplicity, inner content is treated as a single run with the current style.
  // Nested markdown within already-parsed tags is not recursively processed to keep things simple.
  const run: WBTextRun = { content: text };
  if (baseStyle.bold) run.bold = true;
  if (baseStyle.italic) run.italic = true;
  if (baseStyle.strikeThrough) run.strikeThrough = true;
  if (baseStyle.color) run.color = baseStyle.color;
  if (baseStyle.backgroundColor) run.backgroundColor = baseStyle.backgroundColor;
  if (baseStyle.fontSize) run.fontSize = baseStyle.fontSize;
  return [run];
}

function findClosingMark(input: string, start: number, mark: string): number {
  for (let i = start; i < input.length; i++) {
    if (input[i] === mark && (mark !== '*' || input[i + 1] !== '*')) {
      return i;
    }
  }
  return -1;
}

function isPlainRun(run: WBTextRun): boolean {
  return !run.bold && !run.italic && !run.strikeThrough && !run.color && !run.backgroundColor && !run.fontSize;
}
