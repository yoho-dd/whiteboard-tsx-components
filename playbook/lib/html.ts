function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export type PlaybookManifest = {
  buildNonce: string;
  stories: Array<{
    id: string;
    category?: string;
    title: string;
    description?: string;
    image: string;
    dsl: string;
    source: string;
  }>;
};

export function renderIndexHtml(manifest: PlaybookManifest): string {
  const buildNonce = manifest.buildNonce;
  const storiesJsonLiteral = JSON.stringify(manifest.stories).replaceAll('<', '\\u003c');
  const nonceJsonLiteral = JSON.stringify(buildNonce).replaceAll('<', '\\u003c');

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>whiteboard-tsx-components Playbook</title>
    <link rel="stylesheet" href="/assets/styles.css" />
  </head>
  <body>
    <header class="app-header">
      <div class="app-header__brand">
        <button class="header-toggle" id="sidebarToggle" type="button" aria-label="切换故事列表">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div>
          <h1>Playbook</h1>
          <div class="app-header__sub">
            <span>watch: on</span>
            <span>output: PNG</span>
            <span>build: <code id="nonce">${escapeHtml(buildNonce)}</code></span>
          </div>
        </div>
      </div>
      <div class="app-header__actions">
        <a href="/manifest.json" target="_blank" rel="noreferrer">manifest.json</a>
      </div>
    </header>
    <div class="app-shell" id="appShell">
      <aside class="story-sidebar pane" id="storySidebar">
        <div class="pane-header">
          <div>
            <div class="eyebrow">Stories</div>
            <h2>示例导航</h2>
          </div>
          <div class="pane-caption" id="storyCount">0 stories</div>
        </div>
        <div class="story-sidebar__content" id="sidebar"></div>
      </aside>
      <div class="resize-handle resize-handle--vertical" id="sidebarResizer" aria-hidden="true"></div>
      <main class="workspace" id="workspace">
        <section class="preview-panel pane" id="previewPanel">
          <div class="pane-header pane-header--preview">
            <div>
              <div class="eyebrow">Preview</div>
              <h2 id="storyTitle">选择一个 story</h2>
              <div class="pane-caption" id="storyMeta">-</div>
            </div>
            <div class="preview-toolbar">
              <div class="zoom-controls" aria-label="图片缩放控制">
                <button class="zoom-btn" id="zoomOutBtn" type="button" aria-label="缩小">-</button>
                <button class="zoom-btn" id="zoomFitBtn" type="button">Fit</button>
                <button class="zoom-btn" id="zoomResetBtn" type="button">100%</button>
                <button class="zoom-btn" id="zoomInBtn" type="button" aria-label="放大">+</button>
                <span class="zoom-label" id="zoomLabel">Fit</span>
              </div>
              <div class="toolbar-links">
              <a id="openPng" href="#" target="_blank" rel="noreferrer">open png</a>
              <a id="openDsl" href="#" target="_blank" rel="noreferrer">open json</a>
              <a id="openTsx" href="#" target="_blank" rel="noreferrer">open tsx</a>
              </div>
            </div>
          </div>
          <div class="preview-stage" id="previewStage">
            <div class="preview-viewport" id="previewViewport">
              <div class="preview-canvas" id="previewCanvas">
                <img id="previewImg" alt="preview" />
              </div>
            </div>
            <div class="preview-empty" id="previewEmpty">Loading preview…</div>
          </div>
        </section>
        <div class="resize-handle resize-handle--horizontal" id="workspaceResizer" aria-hidden="true"></div>
        <section class="inspect-panel pane" id="inspectPanel">
          <div class="pane-header pane-header--inspect">
            <div>
              <div class="eyebrow">Inspect</div>
              <h2>源码与 DSL</h2>
            </div>
            <div class="tabs" id="inspectTabs" role="tablist" aria-label="切换源码面板">
              <button class="tab is-active" type="button" data-tab="tsx" role="tab" aria-selected="true">TSX</button>
              <button class="tab" type="button" data-tab="json" role="tab" aria-selected="false">JSON DSL</button>
            </div>
          </div>
          <div class="inspect-body">
            <div class="editor-pane is-active" id="tsxPane" data-pane="tsx">
              <div class="editor-host" id="tsxHost"></div>
            </div>
            <div class="editor-pane" id="jsonPane" data-pane="json">
              <div class="editor-host" id="jsonHost"></div>
            </div>
            <div class="boot-status" id="bootStatus">Loading Monaco…</div>
          </div>
        </section>
      </main>
    </div>

    <script>
      window.__PLAYBOOK_STORIES__ = ${storiesJsonLiteral};
      window.__PLAYBOOK_NONCE__ = ${nonceJsonLiteral};
    </script>
    <script src="/vendor/monaco/vs/loader.js"></script>
    <script type="module" src="/assets/app.js"></script>
  </body>
</html>`;
}
