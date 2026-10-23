const themeButton = document.querySelector('#theme');
const readTheme = () => { try { return localStorage.getItem('hit-theme'); } catch { return null; } };
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = theme === 'light' ? '◐' : '☼';
  themeButton.setAttribute('aria-label', theme === 'light' ? 'Bật giao diện tối' : 'Bật giao diện sáng');
}
setTheme(readTheme() === 'light' ? 'light' : 'dark');
themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(next);
  try { localStorage.setItem('hit-theme', next); } catch { /* Storage is optional. */ }
});
document.querySelectorAll('.copy').forEach(button => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(button.closest('.code-block').querySelector('code').textContent);
    button.textContent = 'Đã sao chép';
  } catch { button.textContent = 'Hãy chọn và sao chép mã'; }
  setTimeout(() => { button.textContent = 'Sao chép'; }, 2000);
}));
const topButton = document.querySelector('#top');
if ('IntersectionObserver' in window) {
  const topObserver = new IntersectionObserver(([entry]) => { topButton.hidden = entry.isIntersecting; });
  topObserver.observe(document.querySelector('.breadcrumb'));
}
topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
const headings = document.querySelectorAll('.prose h2[id], .prose h3[id]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.toc a').forEach(link => link.classList.toggle('current', link.hash === '#' + entry.target.id));
    });
  }, { rootMargin: '-70px 0px -65% 0px' });
  headings.forEach(heading => observer.observe(heading));
}
