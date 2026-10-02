(function () {
  'use strict';
  // Manually edited entries take precedence over synced records with the same X post ID.
  const manual = Array.isArray(window.NURADU_ARTICLES) ? window.NURADU_ARTICLES : [];
  const synced = Array.isArray(window.NURADU_AUTOSYNC_ARTICLES) ? window.NURADU_AUTOSYNC_ARTICLES : [];
  function xPostId(a) {
    if (a.xPostId) return String(a.xPostId);
    try { const u=new URL(a.url); if (!['x.com','www.x.com','twitter.com','www.twitter.com','mobile.x.com'].includes(u.hostname)) return '';
      return u.pathname.match(/\/(?:status|article)\/(\d{5,20})(?:\/|$)/)?.[1] || '';
    } catch { return ''; }
  }
  const realManual = manual.filter(a => !a.demo && typeof a.title === 'string' && a.title.trim());
  const seen = new Set(realManual.map(xPostId).filter(Boolean));
  const autoUnique = synced.filter(a => {
    const key=xPostId(a);
    if (!key || seen.has(key) || !a.title) return false;
    seen.add(key);return true;
  });
  // Samples disappear automatically when at least one real article is present.
  const raw = (realManual.length || autoUnique.length) ? [...realManual,...autoUnique] : (new URLSearchParams(location.search).has('demo') ? manual : []);
  const articles = raw.map((a, i) => ({ ...a, _position:i })).filter(a => typeof a.title === 'string' && a.title.trim());
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const allowedAccess = ['all','free','subscriber'];
  const categories = Array.from(new Set(articles.map(a => a.category).filter(Boolean)));
  function storedView() { try { return localStorage.getItem('nuradu-view') === 'list' ? 'list' : 'grid'; } catch { return 'grid'; } }
  function rememberView(value) { try { localStorage.setItem('nuradu-view',value); } catch { /* Browsers may restrict storage for local files. */ } }
  const state = {
    q: params.get('q') || '',
    category: categories.includes(params.get('category')) ? params.get('category') : '전체',
    access: allowedAccess.includes(params.get('access')) ? params.get('access') : 'all',
    news: params.get('new') === '1',
    sort: ['newest','oldest','title'].includes(params.get('sort')) ? params.get('sort') : 'newest',
    view: storedView()
  };
  const title = $('featured-title');
  const summary = $('featured-summary');
  const feature = articles.find(a => a.featured) || articles[0];
  if (feature) {
    title.textContent = feature.title;
    summary.textContent = feature.summary || '';
    if (feature.url && /^https:\/\/(?:www\.)?(?:x\.com|twitter\.com)\//i.test(feature.url)) {
      $('featured-link').href = feature.url;
      $('featured-link').textContent = 'X에서 원문 읽기 ↗';
      $('featured-link').target = '_blank';
      $('featured-link').rel = 'noopener noreferrer';
    }
  }
  $('stat-total').textContent = articles.length;
  $('stat-topic').textContent = categories.length;
  $('stat-free').textContent = articles.filter(a => a.access === 'free').length;
  $('demoNotice').hidden = !articles.some(a => a.demo);
  $('currentYear').textContent = new Date().getFullYear();

  const countByCategory = cat => cat === '전체' ? articles.length : articles.filter(a => a.category === cat).length;
  function updateQuery() {
    const url = new URL(location.href);
    const pairs = {q:state.q.trim(),category:state.category === '전체' ? '' : state.category,access:state.access === 'all' ? '' : state.access,new:state.news ? '1' : '',sort:state.sort === 'newest' ? '' : state.sort};
    for (const [k,v] of Object.entries(pairs)) v ? url.searchParams.set(k,v) : url.searchParams.delete(k);
    try { history.replaceState(null,'',url.pathname + url.search + url.hash); } catch { /* Local-file preview may restrict history changes. */ }
  }
  function chips() {
    const parent = $('categoryChips');
    parent.replaceChildren();
    for (const cat of ['전체',...categories]) {
      const b = document.createElement('button');
      b.type='button'; b.className='chip' + (state.category === cat ? ' is-active' : '');
      b.setAttribute('aria-pressed',String(state.category === cat));
      const label=document.createTextNode(cat);const count=document.createElement('span');count.className='chip-count';count.textContent=String(countByCategory(cat));b.append(label,count);
      b.addEventListener('click',()=>{state.category=cat;render();});parent.appendChild(b);
    }
  }
  function fmtDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value||'')) return value||'날짜 미등록';
    return value.replace(/-/g,'.');
  }
  function within30(dateStr) {
    const d = new Date((dateStr || '') + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return false;
    const days=(Date.now()-d.getTime())/86400000;return days >= -1 && days <= 30;
  }
  function isXUrl(value) { try {const u=new URL(value);return u.protocol==='https:' && ['x.com','www.x.com','twitter.com','www.twitter.com','mobile.x.com'].includes(u.hostname);} catch {return false;} }
  function matches(a) {
    const q=state.q.trim().normalize('NFKC').toLowerCase();
    const terms=q.split(/\s+/).filter(Boolean);
    const haystack=[a.title,a.summary,a.category,...(a.tags||[])].join(' ').normalize('NFKC').toLowerCase();
    return (!terms.length || terms.every(t=>haystack.includes(t))) && (state.category==='전체'||a.category===state.category) && (state.access==='all'||a.access===state.access) && (!state.news||within30(a.date));
  }
  function text(parent,selector,value){parent.querySelector(selector).textContent = value == null ? '' : String(value);}
  const coverSymbols={power:'PWR',rare:'REE',aero:'AIR',framework:'IDEA',semi:'Si',company:'EQ',macro:'FSI'};
  function card(a, index){
    const fragment=$('articleTemplate').content.cloneNode(true);
    const root=fragment.querySelector('.article-card');
    const access=a.access==='free'?'무료 공개':a.access==='subscriber'?'구독자 전용':'X에서 열람 확인';
    const tag=fragment.querySelector('.card-access');
    tag.textContent=access;tag.classList.add(a.access==='free'?'is-free':'is-subscriber');
    const art=fragment.querySelector('.card-art');
    art.dataset.cover=Object.hasOwn(coverSymbols,a.cover)?a.cover:'framework';
    text(fragment,'.card-index',String(index+1).padStart(3,'0')+' / NURADU');
    text(fragment,'.shape-text',coverSymbols[a.cover]||'N.');
    text(fragment,'.card-category',a.category||'RESEARCH');
    text(fragment,'.card-date',fmtDate(a.date));
    text(fragment,'.card-category-text',(a.category||'RESEARCH').toUpperCase());
    text(fragment,'.card-read',a.readMinutes ? `${a.readMinutes} MIN READ` : 'FIELD NOTES');
    text(fragment,'.card-title',a.title);
    text(fragment,'.card-summary',a.summary||'');
    const tags=fragment.querySelector('.card-tags');
    for(const item of (a.tags||[]).slice(0,4)){const span=document.createElement('span');span.textContent='#'+item;tags.appendChild(span);}
    const link=fragment.querySelector('.card-open');
    if(isXUrl(a.url)) {link.href=a.url;link.setAttribute('aria-label',`${a.title} X 원문 열기`);}
    else {link.removeAttribute('href');link.removeAttribute('target');link.classList.add('is-disabled');link.textContent='원문 링크 등록 전';link.setAttribute('aria-disabled','true');}
    text(fragment,'.card-link-state',a.demo?'SAMPLE DATA':a.source==='x-api'?'SYNCED FROM X':(a.access==='free'?'OPEN ACCESS':'X SUBSCRIPTION'));
    root.dataset.id=a.id||'';
    return fragment;
  }
  function render(){
    chips();
    $('searchInput').value=state.q;
    $('newOnly').checked=state.news;
    $('sortSelect').value=state.sort;
    document.querySelectorAll('[data-access]').forEach(el=>{const active=el.dataset.access===state.access;el.classList.toggle('is-active',active);el.setAttribute('aria-pressed',String(active));});
    $('gridBtn').classList.toggle('is-active',state.view==='grid');$('gridBtn').setAttribute('aria-pressed',String(state.view==='grid'));
    $('listBtn').classList.toggle('is-active',state.view==='list');$('listBtn').setAttribute('aria-pressed',String(state.view==='list'));
    const grid=$('articleGrid');grid.classList.toggle('as-list',state.view==='list');
    const filtered=articles.filter(matches).sort((a,b)=>state.sort==='oldest'?(a.date||'').localeCompare(b.date||''):state.sort==='title'?a.title.localeCompare(b.title,'ko'):(b.date||'').localeCompare(a.date||'')||a._position-b._position);
    $('resultCount').textContent=filtered.length;
    grid.replaceChildren(...filtered.map(card));
    $('emptyState').hidden=filtered.length>0;
    updateQuery();
  }
  function reset(){state.q='';state.category='전체';state.access='all';state.news=false;state.sort='newest';render();}
  $('searchInput').addEventListener('input',e=>{state.q=e.target.value;renderSearchOnly();});
  // 검색창은 render()가 값을 재할당하므로 입력 중 커서 위치가 흐트러지지 않도록 별도 처리
  function renderSearchOnly(){const input=$('searchInput');const start=input.selectionStart;const end=input.selectionEnd;render();input.focus();if(start!==null&&end!==null)input.setSelectionRange(start,end);}
  document.querySelectorAll('[data-access]').forEach(b=>b.addEventListener('click',()=>{state.access=b.dataset.access;render();}));
  $('newOnly').addEventListener('change',e=>{state.news=e.target.checked;render();});
  $('sortSelect').addEventListener('change',e=>{state.sort=e.target.value;render();});
  $('gridBtn').addEventListener('click',()=>{state.view='grid';rememberView(state.view);render();});
  $('listBtn').addEventListener('click',()=>{state.view='list';rememberView(state.view);render();});
  $('resetBtn').addEventListener('click',reset);$('emptyReset').addEventListener('click',reset);
  $('shareBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);$('shareBtn').textContent='링크 복사 완료 ✓';setTimeout(()=>$('shareBtn').textContent='현재 검색 조건 공유 ↗',1800);}catch{$('shareBtn').textContent='주소창의 URL을 복사해 주세요';}});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!e.ctrlKey&&!e.metaKey){e.preventDefault();$('searchInput').focus();}if(e.key==='Escape'&&document.activeElement===$('searchInput'))$('searchInput').blur();});
  render();
})();
