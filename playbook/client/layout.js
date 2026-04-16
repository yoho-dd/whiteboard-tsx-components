function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function setupLayout({ store, elements }) {
  const {
    appShellEl,
    workspaceEl,
    sidebarEl,
    sidebarResizerEl,
    workspaceResizerEl,
    sidebarToggleEl,
  } = elements;

  function applyState(state) {
    document.body.classList.toggle('is-narrow', state.isNarrow);
    document.body.classList.toggle('sidebar-open', state.sidebarOpen);
    document.documentElement.style.setProperty('--sidebar-width', `${state.sidebarWidth}px`);
    document.documentElement.style.setProperty('--preview-height', `${(state.previewHeightRatio * 100).toFixed(1)}%`);
    sidebarToggleEl.setAttribute('aria-expanded', String(state.sidebarOpen));
    sidebarEl.setAttribute('aria-hidden', String(state.isNarrow && !state.sidebarOpen));
  }

  function onResize() {
    const nextIsNarrow = window.innerWidth < store.constants.NARROW_BREAKPOINT;
    if (nextIsNarrow !== store.getState().isNarrow) {
      store.setNarrowMode(nextIsNarrow);
      return;
    }
    applyState(store.getState());
  }

  function startDrag(onMove) {
    return (event) => {
      event.preventDefault();
      document.body.classList.add('is-resizing');

      function handleMove(moveEvent) {
        onMove(moveEvent);
      }

      function handleUp() {
        document.body.classList.remove('is-resizing');
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      }

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    };
  }

  sidebarResizerEl.addEventListener('pointerdown', startDrag((event) => {
    if (store.getState().isNarrow) return;
    const rect = appShellEl.getBoundingClientRect();
    const nextWidth = event.clientX - rect.left;
    store.setSidebarWidth(nextWidth);
  }));

  workspaceResizerEl.addEventListener('pointerdown', startDrag((event) => {
    if (store.getState().isNarrow) return;
    const rect = workspaceEl.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    store.setPreviewHeightRatio(ratio);
  }));

  sidebarToggleEl.addEventListener('click', () => {
    store.toggleSidebar();
  });

  workspaceEl.addEventListener('pointerdown', () => {
    const state = store.getState();
    if (state.isNarrow && state.sidebarOpen) {
      store.setSidebarOpen(false);
    }
  });

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && store.getState().sidebarOpen && store.getState().isNarrow) {
      store.setSidebarOpen(false);
    }
  });

  applyState(store.getState());
  return store.subscribe(applyState);
}
