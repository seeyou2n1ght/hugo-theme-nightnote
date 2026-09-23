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
    try { localStorage.setItem('nightnote-theme', next); } catch (_) {}
    updateThemeLabel();
  });
}
const menu = document.querySelector('.mobile-menu');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('#main-links')?.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    menu.setAttribute('aria-expanded', 'false');
    document.querySelector('#main-links')?.classList.remove('open');
    menu.focus();
  }
});
const dialog = document.querySelector('#search-dialog');
const input = document.querySelector('#search-input');
dialog?.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const {left, right, top, bottom} = dialog.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
});
let index;
let indexRequest;
function loadIndex() {
  return indexRequest ||= fetch(dialog.dataset.index).then(response => {
    if (!response.ok) throw new Error('Search index unavailable');
    return response.json();
  }).then(pages => index = pages).catch(error => {
    indexRequest = undefined;
    throw error;
  });
}
async function openSearch() {
  dialog.showModal(); input.focus();
  if (!index) {
    document.querySelector('#search-results').textContent = '正在加载…';
    try {
      await loadIndex();
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
  if (!index) { results.textContent = '搜索尚未就绪，请关闭后重新打开重试。'; return; }
  if (!q) { results.textContent = '输入关键词，搜索标题和摘要。'; return; }
  const matches = index.filter(p => (p.title + ' ' + p.description).toLocaleLowerCase().includes(q));
  results.textContent = matches.length ? `找到 ${matches.length} 条结果` : '没有找到匹配内容，请换个关键词。';
  for (const item of matches) {
    const a = document.createElement('a'); a.href = item.url;
    const types = {article:'文章', project:'项目', topic:'专题', tags:'标签', collection:'合集', page:'页面'};
    a.textContent = item.title + ' · ' + (types[item.type] || item.type); results.append(a);
  }
});
document.querySelectorAll('.copy-code').forEach(button => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(button.parentElement.querySelector('code').textContent);
    button.textContent = '已复制';
  } catch (_) { button.textContent = '复制失败，请手动选择代码'; }
  setTimeout(() => button.textContent = '复制', 1600);
}));
document.querySelectorAll('.article-body img').forEach(img => {
  if (img.closest('a')) return;
  img.tabIndex = 0;
  img.setAttribute('role', 'button');
  img.setAttribute('aria-label', `放大图片：${img.alt || '正文图片'}`);
  img.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); img.click(); }
  });
  img.addEventListener('click', () => {
    const viewer = document.createElement('dialog');
    viewer.className = 'image-viewer';
    viewer.setAttribute('aria-label', img.alt || '图片预览');
    const copy = document.createElement('img'); copy.src = img.currentSrc || img.src; copy.alt = img.alt;
    const close = document.createElement('button'); close.type = 'button'; close.className = 'close';
    close.textContent = '×'; close.setAttribute('aria-label', '关闭图片');
    viewer.append(close, copy); document.body.append(viewer); viewer.showModal();
    viewer.addEventListener('click', () => viewer.close());
    viewer.addEventListener('close', () => { viewer.remove(); img.focus({preventScroll:true}); });
  });
});
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
  try {
    const pages = (await loadIndex()).filter(x => x.type === 'article');
    if (pages.length) location.href = pages[Math.floor(Math.random() * pages.length)].url;
    else { dialog.showModal(); document.querySelector('#search-results').textContent = '暂无可随机阅读的文章。'; }
  } catch (_) { dialog.showModal(); document.querySelector('#search-results').textContent = '随机阅读暂不可用，请稍后重试。'; }
}));
