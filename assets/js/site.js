const theme = document.querySelector('#theme-choice');
if (theme) {
  const modes = ['system', 'light', 'dark'];
  const labels = {system:'跟随系统', light:'浅色', dark:'深色'};
  const updateThemeLabel = () => {
    const mode = document.documentElement.dataset.theme || 'system';
    theme.setAttribute('aria-label', `当前为${labels[mode]}模式，点击切换外观`);
    theme.title = `外观：${labels[mode]}（点击切换）`;
  };
  updateThemeLabel();
  theme.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'system';
    const next = modes[(modes.indexOf(current) + 1) % modes.length];
    document.documentElement.dataset.theme = next;
    localStorage.setItem('nightnote-theme', next);
    updateThemeLabel();
  });
}
const menu = document.querySelector('.mobile-menu');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('#main-links')?.classList.toggle('open', open);
});
const dialog = document.querySelector('#search-dialog');
const input = document.querySelector('#search-input');
dialog?.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const {left, right, top, bottom} = dialog.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
});
let index;
async function openSearch() {
  dialog.showModal(); input.focus();
  if (!index) {
    try {
      index = await fetch(dialog.dataset.index).then(r => r.json());
      input.dispatchEvent(new Event('input'));
    } catch (_) { document.querySelector('#search-results').textContent = '搜索暂不可用。'; }
  }
}
document.querySelector('[data-search-open]')?.addEventListener('click', openSearch);
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
});
input?.addEventListener('input', () => {
  const q = input.value.trim().toLocaleLowerCase();
  const results = document.querySelector('#search-results');
  results.replaceChildren();
  if (!q || !index) return;
  for (const item of index.filter(p => (p.title + ' ' + p.description).toLocaleLowerCase().includes(q)).slice(0, 12)) {
    const a = document.createElement('a'); a.href = item.url;
    const types = {article:'文章', project:'项目', topic:'专题', tags:'标签', collection:'合集', page:'页面'};
    a.textContent = item.title + ' · ' + (types[item.type] || item.type); results.append(a);
  }
});
document.querySelectorAll('.copy-code').forEach(button => button.addEventListener('click', async () => {
  await navigator.clipboard.writeText(button.parentElement.querySelector('code').textContent);
  button.textContent = '已复制'; setTimeout(() => button.textContent = '复制', 1600);
}));
document.querySelectorAll('.article-body img').forEach(img => img.addEventListener('click', () => {
  const viewer = document.createElement('dialog');
  const copy = img.cloneNode(); copy.style.cssText = 'max-width:90vw;max-height:85vh;object-fit:contain;cursor:zoom-out';
  viewer.append(copy); document.body.append(viewer); viewer.showModal();
  viewer.addEventListener('click', () => viewer.close()); viewer.addEventListener('close', () => viewer.remove());
}));
const progress = document.querySelector('.reading-progress');
if (progress) window.addEventListener('scroll', () => {
  const height = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (height ? Math.min(100, scrollY / height * 100) : 100) + '%';
}, {passive:true});
const tocLinks = [...document.querySelectorAll('.desktop-toc a')];
if (tocLinks.length) {
  const headings = tocLinks.map(a => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      tocLinks.forEach(a => a.removeAttribute('aria-current'));
      tocLinks.find(a => decodeURIComponent(a.hash.slice(1)) === entry.target.id)?.setAttribute('aria-current', 'location');
    }
  }, {rootMargin:'-80px 0px -65% 0px'});
  headings.forEach(heading => observer.observe(heading));
}
document.querySelectorAll('[data-random-article]').forEach(button => button.addEventListener('click', async () => {
  const pages = (await (await fetch(dialog.dataset.index)).json()).filter(x => x.type === 'article');
  if (pages.length) location.href = pages[Math.floor(Math.random() * pages.length)].url;
}));
