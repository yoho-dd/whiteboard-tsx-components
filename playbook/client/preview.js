function storyUrl(path, nonce) {
  return `/${String(path || '').replace(/^\/+/, '')}?v=${encodeURIComponent(nonce)}`;
}

function getSelectedStory(state) {
  return state.stories.find((story) => story.id === state.selectedStoryId) ?? state.stories[0] ?? null;
}

export function setupPreview({ store, nonce, elements }) {
  const {
    storyTitleEl,
    storyMetaEl,
    previewStageEl,
    previewViewportEl,
    previewCanvasEl,
    previewImgEl,
    previewEmptyEl,
    zoomOutBtnEl,
    zoomFitBtnEl,
    zoomResetBtnEl,
    zoomInBtnEl,
    zoomLabelEl,
    openPngEl,
    openDslEl,
    openTsxEl,
  } = elements;

  const ZOOM_MIN = 0.1;
  const ZOOM_MAX = 4;
  const ZOOM_STEP = 1.2;

  let zoomMode = 'fit';
  let zoomScale = 1;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getFitScale() {
    const naturalWidth = previewImgEl.naturalWidth;
    const naturalHeight = previewImgEl.naturalHeight;
    const viewportWidth = previewViewportEl.clientWidth;
    const viewportHeight = previewViewportEl.clientHeight;
    if (!naturalWidth || !naturalHeight || !viewportWidth || !viewportHeight) return 1;

    const scaleX = viewportWidth / naturalWidth;
    const scaleY = viewportHeight / naturalHeight;
    return clamp(Math.min(scaleX, scaleY), ZOOM_MIN, ZOOM_MAX);
  }

  function applyZoom() {
    const hasImage = Boolean(previewImgEl.naturalWidth && previewImgEl.naturalHeight);
    if (!hasImage) {
      previewCanvasEl.style.width = '';
      previewCanvasEl.style.height = '';
      zoomLabelEl.textContent = 'Fit';
      return;
    }

    const scale = zoomMode === 'fit' ? getFitScale() : zoomScale;
    const width = previewImgEl.naturalWidth * scale;
    const height = previewImgEl.naturalHeight * scale;
    previewCanvasEl.style.width = `${width}px`;
    previewCanvasEl.style.height = `${height}px`;
    zoomLabelEl.textContent = zoomMode === 'fit' ? `Fit ${Math.round(scale * 100)}%` : `${Math.round(scale * 100)}%`;
  }

  function setZoom(mode, scale = zoomScale) {
    zoomMode = mode;
    zoomScale = clamp(scale, ZOOM_MIN, ZOOM_MAX);
    applyZoom();
  }

  function stepZoom(direction) {
    const currentScale = zoomMode === 'fit' ? getFitScale() : zoomScale;
    const nextScale = direction > 0 ? currentScale * ZOOM_STEP : currentScale / ZOOM_STEP;
    setZoom('manual', nextScale);
  }

  previewImgEl.addEventListener('load', () => {
    previewStageEl.classList.add('has-image');
    previewEmptyEl.textContent = '';
    if (zoomMode === 'fit') {
      setZoom('fit');
      previewViewportEl.scrollTop = 0;
      previewViewportEl.scrollLeft = 0;
      return;
    }
    applyZoom();
  });

  previewImgEl.addEventListener('error', () => {
    previewStageEl.classList.remove('has-image');
    previewEmptyEl.textContent = 'Preview image failed to load.';
    previewCanvasEl.style.width = '';
    previewCanvasEl.style.height = '';
    zoomLabelEl.textContent = 'Error';
  });

  zoomOutBtnEl.addEventListener('click', () => stepZoom(-1));
  zoomInBtnEl.addEventListener('click', () => stepZoom(1));
  zoomResetBtnEl.addEventListener('click', () => setZoom('manual', 1));
  zoomFitBtnEl.addEventListener('click', () => {
    previewViewportEl.scrollTop = 0;
    previewViewportEl.scrollLeft = 0;
    setZoom('fit');
  });

  const resizeObserver = new ResizeObserver(() => {
    if (zoomMode === 'fit') applyZoom();
  });
  resizeObserver.observe(previewViewportEl);

  function render(state) {
    const story = getSelectedStory(state);
    if (!story) {
      storyTitleEl.textContent = 'No stories';
      storyMetaEl.textContent = '当前没有可用 story。';
      previewImgEl.removeAttribute('src');
      previewStageEl.classList.remove('has-image');
      previewEmptyEl.textContent = 'No preview available.';
      previewCanvasEl.style.width = '';
      previewCanvasEl.style.height = '';
      zoomLabelEl.textContent = 'Fit';
      return;
    }

    storyTitleEl.textContent = story.title || story.id;
    storyMetaEl.textContent = story.description
      ? `${story.id} · ${story.description}`
      : story.id;

    previewStageEl.classList.remove('has-image');
    previewEmptyEl.textContent = 'Loading preview…';
    setZoom('fit');
    previewImgEl.src = storyUrl(story.image, nonce);
    previewImgEl.alt = story.title || story.id;

    openPngEl.href = storyUrl(story.image, nonce);
    openDslEl.href = storyUrl(story.dsl, nonce);
    openTsxEl.href = storyUrl(story.source, nonce);
  }

  return store.subscribe(render);
}
