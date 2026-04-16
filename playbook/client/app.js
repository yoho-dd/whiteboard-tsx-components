import { createStore } from './state.js';
import { setupLayout } from './layout.js';
import { setupSidebar } from './sidebar.js';
import { setupPreview } from './preview.js';
import { setupEditors } from './editors.js';

function getBootstrapData() {
  return {
    stories: Array.isArray(window.__PLAYBOOK_STORIES__) ? window.__PLAYBOOK_STORIES__ : [],
    nonce: typeof window.__PLAYBOOK_NONCE__ === 'string' ? window.__PLAYBOOK_NONCE__ : '',
  };
}

function collectElements() {
  return {
    appShellEl: document.getElementById('appShell'),
    sidebarEl: document.getElementById('sidebar'),
    storySidebarEl: document.getElementById('storySidebar'),
    storyCountEl: document.getElementById('storyCount'),
    sidebarToggleEl: document.getElementById('sidebarToggle'),
    sidebarResizerEl: document.getElementById('sidebarResizer'),
    workspaceEl: document.getElementById('workspace'),
    workspaceResizerEl: document.getElementById('workspaceResizer'),
    storyTitleEl: document.getElementById('storyTitle'),
    storyMetaEl: document.getElementById('storyMeta'),
    previewStageEl: document.getElementById('previewStage'),
    previewViewportEl: document.getElementById('previewViewport'),
    previewCanvasEl: document.getElementById('previewCanvas'),
    previewImgEl: document.getElementById('previewImg'),
    previewEmptyEl: document.getElementById('previewEmpty'),
    zoomOutBtnEl: document.getElementById('zoomOutBtn'),
    zoomFitBtnEl: document.getElementById('zoomFitBtn'),
    zoomResetBtnEl: document.getElementById('zoomResetBtn'),
    zoomInBtnEl: document.getElementById('zoomInBtn'),
    zoomLabelEl: document.getElementById('zoomLabel'),
    openPngEl: document.getElementById('openPng'),
    openDslEl: document.getElementById('openDsl'),
    openTsxEl: document.getElementById('openTsx'),
    tabsEl: document.getElementById('inspectTabs'),
    tsxPaneEl: document.getElementById('tsxPane'),
    jsonPaneEl: document.getElementById('jsonPane'),
    tsxHostEl: document.getElementById('tsxHost'),
    jsonHostEl: document.getElementById('jsonHost'),
    bootStatusEl: document.getElementById('bootStatus'),
  };
}

function syncLocationHash(store) {
  let lastStoryId = '';
  store.subscribe((state) => {
    if (!state.selectedStoryId || state.selectedStoryId === lastStoryId) return;
    lastStoryId = state.selectedStoryId;
    const nextHash = `#${encodeURIComponent(state.selectedStoryId)}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  });

  window.addEventListener('hashchange', () => {
    store.syncHashToSelection();
  });
}

function setupLiveReload() {
  const es = new EventSource('/events');
  es.onmessage = (event) => {
    if (event.data === 'reload') {
      window.location.reload();
    }
  };
}

function boot() {
  const { stories, nonce } = getBootstrapData();
  const store = createStore(stories);
  const elements = collectElements();

  setupLayout({
    store,
    elements: {
      appShellEl: elements.appShellEl,
      workspaceEl: elements.workspaceEl,
      sidebarEl: elements.storySidebarEl,
      sidebarResizerEl: elements.sidebarResizerEl,
      workspaceResizerEl: elements.workspaceResizerEl,
      sidebarToggleEl: elements.sidebarToggleEl,
    },
  });

  setupSidebar({
    store,
    sidebarEl: elements.sidebarEl,
    storyCountEl: elements.storyCountEl,
  });

  setupPreview({
    store,
    nonce,
    elements: {
      storyTitleEl: elements.storyTitleEl,
      storyMetaEl: elements.storyMetaEl,
      previewStageEl: elements.previewStageEl,
      previewViewportEl: elements.previewViewportEl,
      previewCanvasEl: elements.previewCanvasEl,
      previewImgEl: elements.previewImgEl,
      previewEmptyEl: elements.previewEmptyEl,
      zoomOutBtnEl: elements.zoomOutBtnEl,
      zoomFitBtnEl: elements.zoomFitBtnEl,
      zoomResetBtnEl: elements.zoomResetBtnEl,
      zoomInBtnEl: elements.zoomInBtnEl,
      zoomLabelEl: elements.zoomLabelEl,
      openPngEl: elements.openPngEl,
      openDslEl: elements.openDslEl,
      openTsxEl: elements.openTsxEl,
    },
  });

  setupEditors({
    store,
    nonce,
    elements: {
      tabsEl: elements.tabsEl,
      bootStatusEl: elements.bootStatusEl,
      tsxPaneEl: elements.tsxPaneEl,
      jsonPaneEl: elements.jsonPaneEl,
      tsxHostEl: elements.tsxHostEl,
      jsonHostEl: elements.jsonHostEl,
    },
  });

  syncLocationHash(store);
  setupLiveReload();
}

boot();
