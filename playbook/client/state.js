const SIDEBAR_WIDTH_KEY = 'playbook.sidebarWidth';
const PREVIEW_RATIO_KEY = 'playbook.previewHeightRatio';

const DEFAULT_SIDEBAR_WIDTH = 320;
const DEFAULT_PREVIEW_HEIGHT_RATIO = 0.58;
const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 520;
const MIN_PREVIEW_HEIGHT_RATIO = 0.28;
const MAX_PREVIEW_HEIGHT_RATIO = 0.78;
const NARROW_BREAKPOINT = 1100;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function readNumber(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function writeNumber(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage failures in private mode / sandboxed contexts.
  }
}

function pickInitialStoryId(stories) {
  const hash = (window.location.hash || '').replace(/^#/, '');
  const decoded = hash ? decodeURIComponent(hash) : '';
  if (decoded && stories.some((story) => story.id === decoded)) return decoded;
  return stories[0]?.id ?? '';
}

export function createStore(stories) {
  const subscribers = new Set();

  const state = {
    stories,
    selectedStoryId: pickInitialStoryId(stories),
    activeInspectorTab: 'tsx',
    sidebarWidth: clamp(readNumber(SIDEBAR_WIDTH_KEY, DEFAULT_SIDEBAR_WIDTH), MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH),
    previewHeightRatio: clamp(
      readNumber(PREVIEW_RATIO_KEY, DEFAULT_PREVIEW_HEIGHT_RATIO),
      MIN_PREVIEW_HEIGHT_RATIO,
      MAX_PREVIEW_HEIGHT_RATIO,
    ),
    isNarrow: window.innerWidth < NARROW_BREAKPOINT,
    sidebarOpen: window.innerWidth >= NARROW_BREAKPOINT,
  };

  function notify() {
    for (const subscriber of subscribers) {
      subscriber(getState());
    }
  }

  function getState() {
    return { ...state };
  }

  function setState(partial) {
    let changed = false;
    for (const [key, value] of Object.entries(partial)) {
      if (state[key] !== value) {
        state[key] = value;
        changed = true;
      }
    }
    if (!changed) return;

    writeNumber(SIDEBAR_WIDTH_KEY, state.sidebarWidth);
    writeNumber(PREVIEW_RATIO_KEY, state.previewHeightRatio);
    notify();
  }

  function selectStory(storyId) {
    if (!stories.some((story) => story.id === storyId)) return;
    const patch = { selectedStoryId: storyId };
    if (state.isNarrow) patch.sidebarOpen = false;
    setState(patch);
  }

  function setInspectorTab(tab) {
    if (tab !== 'tsx' && tab !== 'json') return;
    setState({ activeInspectorTab: tab });
  }

  function setSidebarWidth(width) {
    setState({ sidebarWidth: clamp(width, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH) });
  }

  function setPreviewHeightRatio(ratio) {
    setState({ previewHeightRatio: clamp(ratio, MIN_PREVIEW_HEIGHT_RATIO, MAX_PREVIEW_HEIGHT_RATIO) });
  }

  function setNarrowMode(isNarrow) {
    if (isNarrow) {
      setState({ isNarrow: true, sidebarOpen: false });
      return;
    }
    setState({ isNarrow: false, sidebarOpen: true });
  }

  function setSidebarOpen(sidebarOpen) {
    setState({ sidebarOpen });
  }

  function toggleSidebar() {
    setState({ sidebarOpen: !state.sidebarOpen });
  }

  function syncHashToSelection() {
    const nextId = pickInitialStoryId(stories);
    if (nextId && nextId !== state.selectedStoryId) {
      selectStory(nextId);
    }
  }

  function subscribe(subscriber) {
    subscribers.add(subscriber);
    subscriber(getState());
    return () => subscribers.delete(subscriber);
  }

  return {
    subscribe,
    getState,
    selectStory,
    setInspectorTab,
    setSidebarWidth,
    setPreviewHeightRatio,
    setNarrowMode,
    setSidebarOpen,
    toggleSidebar,
    syncHashToSelection,
    constants: {
      NARROW_BREAKPOINT,
      MIN_SIDEBAR_WIDTH,
      MAX_SIDEBAR_WIDTH,
      MIN_PREVIEW_HEIGHT_RATIO,
      MAX_PREVIEW_HEIGHT_RATIO,
    },
  };
}
