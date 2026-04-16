function groupStories(stories) {
  const groups = new Map();
  for (const story of stories) {
    const category = story.category || 'Ungrouped';
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(story);
  }
  return [...groups.entries()];
}

function createStoryItem(story, isActive, onSelect) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `story-item${isActive ? ' is-active' : ''}`;
  button.dataset.id = story.id;
  button.setAttribute('aria-pressed', String(isActive));

  const title = document.createElement('div');
  title.className = 'story-item__title';
  title.textContent = story.title;
  button.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'story-item__meta';
  const code = document.createElement('code');
  code.textContent = story.id;
  meta.appendChild(code);
  button.appendChild(meta);

  if (story.description) {
    const desc = document.createElement('div');
    desc.className = 'story-item__desc';
    desc.textContent = story.description;
    button.appendChild(desc);
  }

  button.addEventListener('click', () => onSelect(story.id));
  return button;
}

export function setupSidebar({ store, sidebarEl, storyCountEl }) {
  function render(state) {
    storyCountEl.textContent = `${state.stories.length} stories`;
    sidebarEl.innerHTML = '';

    const groups = groupStories(state.stories);
    for (const [groupName, stories] of groups) {
      const section = document.createElement('section');
      section.className = 'story-group';

      const title = document.createElement('div');
      title.className = 'story-group__title';
      title.textContent = groupName;
      section.appendChild(title);

      for (const story of stories) {
        section.appendChild(createStoryItem(story, story.id === state.selectedStoryId, store.selectStory));
      }

      sidebarEl.appendChild(section);
    }
  }

  return store.subscribe(render);
}
