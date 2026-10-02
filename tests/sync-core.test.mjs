import test from 'node:test';
import assert from 'node:assert/strict';
import {articleFromPost,isNativeArticle,isOwnArticleLink,mergeArchive,postIdFromUrl,renderJs,classify} from '../scripts/sync-core.mjs';
const id='2079602472453386270';
const base={id,created_at:'2026-10-02T14:30:00Z',text:'우리는 전력이 아니라 시간을 구매하는 겁니다 EROC INIO'};
test('detect article field and get actual title, URL, KST date, topic',()=>{
  const a=articleFromPost({...base,article_title:'우리는 전력이 아니라 시간을 구매하는 겁니다',article:{id:'another-entity-id'}});
  assert.equal(a.title,'우리는 전력이 아니라 시간을 구매하는 겁니다');
  assert.equal(a.category,'전력·인프라');assert.equal(a.cover,'power');assert.equal(a.date,'2026-10-02');
  assert.equal(a.url,`https://x.com/NURadu_/status/${id}`);
  assert.equal(a.access,'unknown');assert(a.tags.includes('EROC'));assert(!a.summary.includes('EROC')); // Private article text not copied into teaser
});
test('filter regular posts even with investment keywords and external article URLs',()=>{
  assert.equal(isNativeArticle(base),false);
  assert.equal(articleFromPost({...base,entities:{urls:[{expanded_url:'https://example.com/article/123456789'}]}}),null);
});
test('accept only specific native article URLs and exact domain',()=>{
  assert.equal(isOwnArticleLink(`https://x.com/NURadu_/article/${id}`),true);
  assert.equal(isOwnArticleLink(`https://x.com/i/article/${id}`),false); // author cannot be verified from this URL alone
  assert.equal(isOwnArticleLink(`https://x.com/SomeoneElse/article/${id}`),false);
  assert.equal(isOwnArticleLink(`https://x.com.evil.test/NURadu_/article/${id}`),false);
  assert.equal(isNativeArticle({...base,entities:{urls:[{expanded_url:`https://x.com/NURadu_/article/${id}`}]}}),true);
});
test('dedupe by post ID and sort numeric ID accurately',()=>{
  const one=articleFromPost({...base,article_title:'old title'});
  const two=articleFromPost({...base,article_title:'new title'});
  const three=articleFromPost({...base,id:'2079602472453386271',article_title:'later'});
  const out=mergeArchive([one],[two,three]);assert.equal(out.length,2);assert.equal(out[0].title,'later');assert.equal(out[1].title,'new title');
});
test('unverified access, search-safe JS encoding and canonical URL matching',()=>{
  const entry=articleFromPost({...base,article_title:'<script>test</script>',entities:{urls:[{expanded_url:`https://x.com/NURadu_/article/${id}`}]}});
  assert.equal(entry.url,`https://x.com/NURadu_/article/${id}`);
  assert.equal(postIdFromUrl(entry.url),id);
  const js=renderJs([entry]);assert(!js.includes('<script>'));assert(js.includes('\\u003cscript>'));
});
test('KST next day rollover and category fallback',()=>{
  const a=articleFromPost({...base,created_at:'2026-10-02T18:30:00Z',article_title:'해외 시장의 변화'});
  assert.equal(a.date,'2026-10-03');assert.equal(classify('새로운 관점','독립 연구').category,'시장·산업');
});

test('never expose subscriber article body or note text in public archive',()=>{
  const secret='이 문장은 유료 구독자에게만 보여야 하는 내부 분석 내용';
  const a=articleFromPost({...base,article_title:'전력 분석',text:secret,note_post:{text:secret},article:{id:'abc',description:secret}});
  assert(!JSON.stringify(a).includes(secret));
});
