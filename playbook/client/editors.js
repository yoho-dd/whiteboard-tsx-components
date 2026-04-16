function storyUrl(path, nonce) {
  return `/${String(path || '').replace(/^\/+/, '')}?v=${encodeURIComponent(nonce)}`;
}

function getSelectedStory(state) {
  return state.stories.find((story) => story.id === state.selectedStoryId) ?? state.stories[0] ?? null;
}

function loadMonaco() {
  return new Promise((resolve, reject) => {
    if (window.monaco?.editor) {
      resolve(window.monaco);
      return;
    }
    if (typeof window.require !== 'function') {
      reject(new Error('Monaco loader is unavailable.'));
      return;
    }
    window.require.config({ paths: { vs: '/vendor/monaco/vs' } });
    window.require(['vs/editor/editor.main'], () => resolve(window.monaco), reject);
  });
}

export function setupEditors({ store, nonce, elements }) {
  const {
    tabsEl,
    bootStatusEl,
    tsxPaneEl,
    jsonPaneEl,
    tsxHostEl,
    jsonHostEl,
  } = elements;

  const cache = new Map();
  let editors = null;
  let latestState = store.getState();

  function setBootStatus(message, hidden = false) {
    bootStatusEl.textContent = message;
    bootStatusEl.classList.toggle('is-hidden', hidden);
  }

  function setActiveTab(tab) {
    const isTsx = tab === 'tsx';
    tsxPaneEl.classList.toggle('is-active', isTsx);
    jsonPaneEl.classList.toggle('is-active', !isTsx);

    for (const button of tabsEl.querySelectorAll('[data-tab]')) {
      const active = button.dataset.tab === tab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    }

    if (!editors) return;
    requestAnimationFrame(() => {
      (isTsx ? editors.tsx : editors.json).layout();
    });
  }

  async function fetchText(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return await res.text();
  }

  async function ensureContent(story) {
    if (!story || !editors) return;
    const cacheKey = `${story.id}:${nonce}`;
    if (!cache.has(cacheKey)) {
      const promise = Promise.all([
        fetchText(storyUrl(story.source, nonce)),
        fetchText(storyUrl(story.dsl, nonce)),
      ]).then(([tsx, json]) => ({ tsx, json }));
      cache.set(cacheKey, promise);
    }

    try {
      const { tsx, json } = await cache.get(cacheKey);
      if (store.getState().selectedStoryId !== story.id) return;
      editors.tsx.setValue(tsx);
      editors.json.setValue(json);
      setBootStatus('', true);
    } catch (error) {
      const message = String(error);
      editors.tsx.setValue(message);
      editors.json.setValue(message);
      setBootStatus('Failed to load source files.', false);
    }
  }

  function syncEditors(state) {
    latestState = state;
    setActiveTab(state.activeInspectorTab);
    if (!editors) return;
    const story = getSelectedStory(state);
    void ensureContent(story);
  }

  for (const button of tabsEl.querySelectorAll('[data-tab]')) {
    button.addEventListener('click', () => {
      store.setInspectorTab(button.dataset.tab);
    });
  }

  const unsubscribe = store.subscribe(syncEditors);

  loadMonaco()
    .then((monaco) => {
      editors = {
        tsx: monaco.editor.create(tsxHostEl, {
          value: '',
          language: 'typescript',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          readOnly: true,
          fontSize: 12,
        }),
        json: monaco.editor.create(jsonHostEl, {
          value: '',
          language: 'json',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          readOnly: true,
          fontSize: 12,
        }),
      };

      syncEditors(latestState);
    })
    .catch((error) => {
      setBootStatus(String(error), false);
    });

  return unsubscribe;
}
