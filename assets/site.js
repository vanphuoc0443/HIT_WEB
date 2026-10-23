const themeButton = document.querySelector('#theme');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* Optional preference. */ } }
};
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = theme === 'light' ? 'Tối' : 'Sáng';
  themeButton.setAttribute('aria-label', theme === 'light' ? 'Bật giao diện tối' : 'Bật giao diện sáng');
}
setTheme(storage.get('hit-theme') === 'light' ? 'light' : 'dark');
themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(next);
  storage.set('hit-theme', next);
});

// Reveal once on entry; never hide content if observation is unavailable or motion is reduced.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => {
    element.classList.add('is-observed');
    revealObserver.observe(element);
  });
}

const topButton = document.querySelector('#top');
if ('IntersectionObserver' in window) {
  const topObserver = new IntersectionObserver(([entry]) => { topButton.hidden = entry.isIntersecting; });
  topObserver.observe(document.querySelector('.page-start'));
}
topButton.addEventListener('click', () => window.scrollTo({ top:0, behavior:reducedMotion.matches ? 'instant' : 'smooth' }));

const headings = [...document.querySelectorAll('.prose h2[id], .prose h3[id]')];
headings.forEach(heading => {
  const link = document.createElement('a');
  link.className = 'heading-link';
  link.href = '#' + heading.id;
  link.setAttribute('aria-label', 'Liên kết tới ' + heading.textContent);
  link.textContent = '#';
  heading.append(link);
});
if ('IntersectionObserver' in window) {
  const tocObserver = new IntersectionObserver(entries => {
    const entry = entries.find(item => item.isIntersecting);
    if (!entry) return;
    document.querySelectorAll('.toc a, .toc-inline a').forEach(link => {
      const active = link.hash === '#' + entry.target.id;
      link.classList.toggle('current', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin:'-100px 0px -55% 0px', threshold:0 });
  headings.forEach(heading => tocObserver.observe(heading));
}

document.querySelectorAll('.copy').forEach(button => {
  button.setAttribute('aria-live', 'polite');
  button.addEventListener('click', async () => {
    const code = button.closest('.code-block').querySelector('code');
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = 'Đã sao chép';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = 'Đã chọn mã, nhấn Ctrl+C';
    }
    clearTimeout(button.resetTimer);
    button.resetTimer = setTimeout(() => { button.textContent = 'Sao chép'; }, 2600);
  });
});

// A real Flexbox experiment. FLIP animates the actual elements between both layouts.
const demo = document.querySelector('#flex-demo');
if (demo) {
  const blocks = [...demo.children];
  function changeLayout(update) {
    blocks.forEach(block => block.getAnimations().forEach(animation => animation.cancel()));
    const before = blocks.map(block => block.getBoundingClientRect());
    update();
    if (reducedMotion.matches) return;
    blocks.forEach((block, index) => {
      const after = block.getBoundingClientRect();
      block.animate([
        { transform:`translate(${before[index].left-after.left}px, ${before[index].top-after.top}px)` },
        { transform:'translate(0, 0)' }
      ], { duration:550, easing:'cubic-bezier(.22,1,.36,1)' });
    });
  }
  document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => {
    changeLayout(() => { demo.dataset.direction = button.dataset.direction; });
    document.querySelector('#code-direction').textContent = button.dataset.direction;
    document.querySelectorAll('button[data-direction]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
  }));
  document.querySelector('#demo-gap').addEventListener('input', event => {
    demo.style.setProperty('--demo-gap', event.target.value + 'px');
    document.querySelector('#gap-value').textContent = event.target.value;
    document.querySelector('#code-gap').textContent = event.target.value + 'px';
  });
}

const search = document.querySelector('#lesson-search');
if (search) {
  let filter = 'all';
  const rows = [...document.querySelectorAll('.lesson-row')];
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
  function filterLessons() {
    const query = normalize(search.value.trim());
    let visible = 0;
    rows.forEach(row => {
      const matches = normalize(row.textContent).includes(query) && (filter === 'all' || row.classList.contains('is-ready'));
      row.hidden = !matches;
      if (matches) visible++;
    });
    document.querySelector('.search-empty').hidden = visible > 0;
    document.querySelector('#search-status').textContent = `${visible} tuần học phù hợp.`;
  }
  search.addEventListener('input', filterLessons);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    filterLessons();
  }));
  document.querySelector('#reset-search').addEventListener('click', () => {
    search.value = '';
    document.querySelector('[data-filter="all"]').click();
    search.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) && !event.target.isContentEditable) {
      event.preventDefault();
      search.focus();
    }
  });
  const last = storage.get('hit-last-lesson');
  const row = rows.find(item => item.classList.contains('is-ready') && item.getAttribute('href') === `Lesson${last}/README.html`);
  if (row) {
    const resume = document.querySelector('.hero .primary');
    resume.href = row.getAttribute('href');
    resume.firstChild.textContent = `Đọc tiếp Tuần ${last} `;
  }
} else if (headings.length) {
  const match = location.pathname.match(/Lesson(\d+)\/README\.html$/);
  if (match) storage.set('hit-last-lesson', match[1]);
}