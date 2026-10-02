/** X Article metadata → public archive entry. No credentials or network calls here. */
export const USERNAME = 'NURadu_';
const KNOWN_TICKERS = ['EROC','INIO','MP','USAR','ONDS','UMAC','AVAV','KTOS','NVE','MRAM','NVDA','GOOG','GOOGL','BB','FLNC','JOBY','OPTT','TSLA','AMD','INTC','PLTR','COR'];
const CATEGORIES = [
  { category:'자원·공급망', cover:'rare', words:['희토류','rare earth','광산','자석','정제','minerals','us rare earth','mp materials','us ar','usar'] },
  { category:'전력·인프라', cover:'power', words:['btm','전력','데이터센터','발전기','송전망','전기 인프라','grid','eroc','inio','에너지','원전'] },
  { category:'반도체·기술', cover:'semi', words:['반도체','mram','hbm','dram','유리기판','nve','코닝','gpu','메모리','파운드리','nvidia'] },
  { category:'방산·우주', cover:'aero', words:['드론','방산','우주','위성','avav','ktos','onds','umac','aircraft','satellite'] },
  { category:'거시경제', cover:'macro', words:['금리','fsi','금융 스트레스','연준','거시','인플레이션','macro','fomc','fed','yield'] },
  { category:'투자 프레임워크', cover:'framework', words:['시가총액','희석','밸류에이션','capex','tam','valuation','재무제표','투자 원칙','투자 공부','기업가치'] },
  { category:'기업 분석', cover:'company', words:['실적','매출','영업이익','ceo','earnings','주가','기업분석','티커'] }
];
const clean = x => typeof x === 'string' ? x.replace(/\s+/g,' ').trim() : '';
export function titleOf(value) {
  if (typeof value === 'string') return clean(value);
  if (value && typeof value === 'object') return clean(value.title || value.text || value.name || value.value);
  return '';
}
export function isOwnArticleLink(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || !['x.com','www.x.com','twitter.com','www.twitter.com','mobile.x.com'].includes(u.hostname)) return false;
    const p = u.pathname.split('/').filter(Boolean);
    return p.length === 3 && /^\d{5,20}$/.test(p[2]) && p[1] === 'article' && p[0].toLowerCase() === USERNAME.toLowerCase();
  } catch { return false; }
}
function sourceLinks(post) {
  const e = [...(post.entities?.urls || []), ...(post.note_post?.entities?.urls || []), ...(post.note_tweet?.entities?.urls || [])];
  return e.flatMap(x => [x.expanded_url,x.unwound_url,x.url].filter(Boolean));
}
export function isNativeArticle(post) {
  if (!post || typeof post !== 'object' || !/^\d{5,20}$/.test(String(post.id ?? ''))) return false;
  const title = titleOf(post.article_title) || titleOf(post.article?.title) || titleOf(post.article?.article_title);
  if (title) return true;
  if (typeof post.article === 'string' && clean(post.article)) return true;
  if (post.article && typeof post.article === 'object' && (post.article.id || post.article.content_state || post.article.body)) return true;
  return sourceLinks(post).some(isOwnArticleLink);
}
function shortText(post) {
  return clean((post.note_post?.text || post.note_tweet?.text || post.text || '')
    .replace(/https?:\/\/\S+/g,'').replace(/(?:^|\s)#(?:아티클|article)(?=\s|$)/gi,' '));
}
export function classify(title, summary) {
  const phrase = `${title} ${summary}`.toLowerCase();
  for (const entry of CATEGORIES) if (entry.words.some(w => phrase.includes(w))) return { category:entry.category, cover:entry.cover };
  return {category:'시장·산업',cover:'framework'};
}
function kstDate(timestamp) {
  const d = new Date(timestamp);
  if (!Number.isFinite(d.getTime())) return new Date().toISOString().slice(0,10);
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Seoul'}).formatToParts(d).map(x=>[x.type,x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
function tagsOf(post, title, summary) {
  const tags = [];
  const add = x => {const v=clean(x).replace(/^[$#]/,'');if(v && v.length <= 25 && !tags.some(t=>t.toLowerCase()===v.toLowerCase())) tags.push(v);};
  for (const x of post.entities?.hashtags || []) add(x.tag);
  for (const x of post.entities?.cashtags || []) add(x.tag.toUpperCase());
  const haystack=`${title} ${summary}`.toUpperCase();
  for (const t of KNOWN_TICKERS) if (new RegExp(`(^|[^A-Z0-9])\\$?${t}(?![A-Z0-9])`,'i').test(haystack)) add(t);
  return tags.slice(0,5);
}
export function articleFromPost(post) {
  if (!isNativeArticle(post)) return null;
  // A subscriber-only article may contain private text in API fields. Never persist the post/note body.
  // Only the explicitly supplied article title, URL, derived tags and a generic category teaser are public.
  const bodyForClassificationOnly = shortText(post);
  const linkTitle = (post.entities?.urls || []).map(x=>titleOf(x.title)).find(Boolean) || '';
  const date = kstDate(post.created_at);
  const title = (titleOf(post.article_title) || titleOf(post.article?.title) || titleOf(post.article?.article_title) || linkTitle || `X 아티클 · ${date}`).slice(0,140);
  const meta = classify(title, bodyForClassificationOnly);
  const summary = `${meta.category} 분야의 장문 리서치입니다. 본문과 열람 조건은 X 원문에서 확인할 수 있습니다.`;
  const ownLink = sourceLinks(post).find(isOwnArticleLink);
  return {
    id:`x-${post.id}`, xPostId:String(post.id), source:'x-api',
    title, summary, date,
    category:meta.category, cover:meta.cover, tags:tagsOf(post,title,bodyForClassificationOnly),
    access:'unknown', url:ownLink || `https://x.com/${USERNAME}/status/${post.id}`,
    featured:false, readMinutes:null, demo:false
  };
}
export function postIdFromUrl(url) {
  try { const u=new URL(url); if (!['x.com','www.x.com','twitter.com','www.twitter.com','mobile.x.com'].includes(u.hostname)) return null;
    const match=u.pathname.match(/\/(?:status|article)\/(\d{5,20})(?:\/|$)/);return match?.[1] || null;
  } catch {return null;}
}
export function mergeArchive(previous, incoming) {
  const byId=new Map();
  for(const a of previous || []) if(a && /^\d{5,20}$/.test(String(a.xPostId ?? ''))) byId.set(String(a.xPostId),a);
  for(const a of incoming || []) if(a?.xPostId) byId.set(String(a.xPostId), {...byId.get(String(a.xPostId)),...a});
  return [...byId.values()].sort((a,b)=>a.xPostId === b.xPostId ? 0 : BigInt(a.xPostId)>BigInt(b.xPostId)?-1:1);
}
export function renderJs(data) {
  // Keep user content JSON-encoded; prevent literal script-close sequences if it gets inlined later.
  const encoded=JSON.stringify(data,null,2).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return `/* Generated by scripts/sync-x.mjs — do not put API keys here. */\nwindow.NURADU_AUTOSYNC_ARTICLES = ${encoded};\n`;
}
