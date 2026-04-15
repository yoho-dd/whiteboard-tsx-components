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

  // Minimal SSE-driven live reload + Monaco editors (VS Code-like).
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>whiteboard-tsx-components Playbook</title>
    <style>
      :root { color-scheme: light; }
      body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background: #0b1220; color: #e5e7eb; }
      header.top { padding: 12px 16px; border-bottom: 1px solid #1f2937; position: sticky; top: 0; background: rgba(11, 18, 32, 0.9); backdrop-filter: blur(8px); z-index: 10; }
      header.top h1 { margin: 0; font-size: 14px; font-weight: 650; letter-spacing: 0.2px; }
      header.top .sub { margin-top: 6px; font-size: 12px; color: #94a3b8; display: flex; gap: 10px; flex-wrap: wrap; }
      header.top .sub a { color: #93c5fd; text-decoration: none; }
      header.top .sub a:hover { text-decoration: underline; }
      .app { height: calc(100vh - 55px); display: grid; grid-template-columns: 280px 1fr; }
      .sidebar { border-right: 1px solid #1f2937; background: #0b1220; overflow: auto; }
      .sidebar .group { padding: 10px 0 6px; }
      .sidebar .groupTitle { padding: 0 12px 6px; font-size: 11px; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.08em; }
      .sidebar .item { padding: 10px 12px; border-bottom: 1px solid #0f172a; cursor: pointer; }
      .sidebar .item:hover { background: #0f172a; }
      .sidebar .item.active { background: #111c33; border-left: 3px solid #60a5fa; padding-left: 9px; }
      .sidebar .title { font-size: 12px; font-weight: 600; }
      .sidebar .meta { margin-top: 4px; font-size: 11px; color: #94a3b8; display: flex; gap: 8px; }
      .sidebar .desc { margin-top: 6px; font-size: 11px; color: #cbd5e1; line-height: 1.4; }

      .main { display: grid; grid-template-rows: 46% 54%; min-width: 0; }
      .panel { border-bottom: 1px solid #1f2937; overflow: hidden; min-width: 0; }
      .panel:last-child { border-bottom: 0; }

      .preview { padding: 10px 12px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; }
      .preview .bar { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #94a3b8; }
      .preview .bar .spacer { flex: 1; }
      .preview .bar .id { color: #e5e7eb; }
      .preview .imgWrap { flex: 1; border: 1px solid #1f2937; border-radius: 10px; overflow: auto; background: #0b1220; }
      .preview img { width: 100%; height: auto; display: block; }

      .editors { display: grid; grid-template-columns: 1fr 1fr; height: 100%; min-width: 0; }
      .editor { border-right: 1px solid #1f2937; min-width: 0; display: flex; flex-direction: column; }
      .editor:last-child { border-right: 0; }
      .editor .label { padding: 8px 10px; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #1f2937; }
      .editor .host { flex: 1; min-height: 0; }

      .placeholder { padding: 10px 12px; font-size: 12px; color: #94a3b8; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    </style>
  </head>
  <body>
    <header class="top">
      <h1>Playbook</h1>
      <div class="sub">
        <span>watch: on</span>
        <span>output: PNG</span>
        <span>build: <code id="nonce">${escapeHtml(buildNonce)}</code></span>
        <span class="spacer"></span>
        <a href="/manifest.json" target="_blank" rel="noreferrer">manifest.json</a>
      </div>
    </header>
    <div class="app">
      <aside class="sidebar" id="sidebar"></aside>
      <main class="main">
        <section class="panel preview">
          <div class="bar">
            <span>story: <code class="id" id="storyId">-</code></span>
            <span class="spacer"></span>
            <a id="openPng" href="#" target="_blank" rel="noreferrer">open png</a>
            <a id="openDsl" href="#" target="_blank" rel="noreferrer">open json</a>
            <a id="openTsx" href="#" target="_blank" rel="noreferrer">open tsx</a>
          </div>
          <div class="imgWrap">
            <img id="previewImg" alt="preview" />
          </div>
        </section>
        <section class="panel editors">
          <div class="editor">
            <div class="label">TSX</div>
            <div class="host" id="tsxHost"></div>
          </div>
          <div class="editor">
            <div class="label">JSON DSL</div>
            <div class="host" id="jsonHost"></div>
          </div>
        </section>
      </main>
    </div>
    <div class="placeholder" id="bootStatus">Loading Monaco…</div>

    <script>
      window.__PLAYBOOK_STORIES__ = ${storiesJsonLiteral};
      window.__PLAYBOOK_NONCE__ = ${nonceJsonLiteral};
    </script>

    <script src="/vendor/monaco/vs/loader.js"></script>
    <script>
      (function () {
        var stories = window.__PLAYBOOK_STORIES__ || [];
        var nonce = window.__PLAYBOOK_NONCE__ || '';
        var sidebar = document.getElementById('sidebar');
        var previewImg = document.getElementById('previewImg');
        var storyIdEl = document.getElementById('storyId');
        var openPng = document.getElementById('openPng');
        var openDsl = document.getElementById('openDsl');
        var openTsx = document.getElementById('openTsx');
        var bootStatus = document.getElementById('bootStatus');
        var tsxHost = document.getElementById('tsxHost');
        var jsonHost = document.getElementById('jsonHost');

        var editorTsx = null;
        var editorJson = null;

        function storyUrl(p) { return '/' + p.replace(/^\\/+/, '') + '?v=' + encodeURIComponent(nonce); }

        function setActive(id) {
          var s = stories.find(function (x) { return x.id === id; }) || stories[0];
          if (!s) return;
          location.hash = '#' + encodeURIComponent(s.id);

          storyIdEl.textContent = s.id;
          previewImg.src = storyUrl(s.image);
          previewImg.alt = s.title || s.id;
          openPng.href = storyUrl(s.image);
          openDsl.href = storyUrl(s.dsl);
          openTsx.href = storyUrl(s.source);

          // Pull file contents for editors.
          fetch(storyUrl(s.source), { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (txt) {
            if (editorTsx) editorTsx.setValue(txt);
          }).catch(function (e) {
            if (editorTsx) editorTsx.setValue(String(e));
          });

          fetch(storyUrl(s.dsl), { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (txt) {
            if (editorJson) editorJson.setValue(txt);
          }).catch(function (e) {
            if (editorJson) editorJson.setValue(String(e));
          });

          // Sidebar active styles.
          var items = sidebar.querySelectorAll('[data-id]');
          for (var i = 0; i < items.length; i++) {
            var el = items[i];
            if (el.getAttribute('data-id') === s.id) el.classList.add('active');
            else el.classList.remove('active');
          }
        }

        function renderSidebar() {
          sidebar.innerHTML = '';
          var groups = [];
          stories.forEach(function (s) {
            var category = s.category || 'Ungrouped';
            var group = groups.find(function (g) { return g.name === category; });
            if (!group) {
              group = { name: category, items: [] };
              groups.push(group);
            }
            group.items.push(s);
          });

          groups.forEach(function (group) {
            var section = document.createElement('section');
            section.className = 'group';

            var title = document.createElement('div');
            title.className = 'groupTitle';
            title.textContent = group.name;
            section.appendChild(title);

            group.items.forEach(function (s) {
              var div = document.createElement('div');
              div.className = 'item';
              div.setAttribute('data-id', s.id);
              div.innerHTML =
                '<div class="title">' + (s.title ? s.title.replace(/</g, '&lt;') : s.id) + '</div>' +
                '<div class="meta"><code>' + s.id.replace(/</g, '&lt;') + '</code></div>' +
                (s.description ? '<div class="desc">' + s.description.replace(/</g, '&lt;') + '</div>' : '');
              div.onclick = function () { setActive(s.id); };
              section.appendChild(div);
            });

            sidebar.appendChild(section);
          });
        }

        function pickInitialId() {
          var h = (location.hash || '').replace(/^#/, '');
          try { h = decodeURIComponent(h); } catch (_) {}
          if (h && stories.some(function (s) { return s.id === h; })) return h;
          return stories[0] ? stories[0].id : '';
        }

        function bootEditors(monaco) {
          editorTsx = monaco.editor.create(tsxHost, {
            value: '',
            language: 'typescript',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            readOnly: true,
            fontSize: 12
          });

          editorJson = monaco.editor.create(jsonHost, {
            value: '',
            language: 'json',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            readOnly: true,
            fontSize: 12
          });

          bootStatus.remove();
          setActive(pickInitialId());
          window.addEventListener('hashchange', function () {
            var id = pickInitialId();
            if (id) setActive(id);
          });
        }

        renderSidebar();

        if (typeof require === 'function') {
          require.config({ paths: { vs: '/vendor/monaco/vs' } });
          require(['vs/editor/editor.main'], function () {
            bootEditors(window.monaco);
          });
        } else {
          bootStatus.textContent = 'Monaco loader failed to load.';
        }

        var es = new EventSource('/events');
        es.onmessage = function (ev) {
          if (ev.data === 'reload') location.reload();
        };
        es.onerror = function () {
          // If the dev server restarts, EventSource will retry automatically.
        };
      })();
    </script>
  </body>
</html>`;
}
