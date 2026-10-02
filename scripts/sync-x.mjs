#!/usr/bin/env node
/** Runs in GitHub Actions (or locally with env vars). No secrets are written to website/ or git. */
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {articleFromPost,mergeArchive,renderJs,USERNAME} from './sync-core.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const autoPath=path.join(root,'website','articles-auto.js');
const statePath=path.join(root,'sync','x-sync-state.json');
const archivePath=path.join(root,'sync','articles-auto.json');
const demoMode=process.argv.includes('--fixture');
const fixturePath=demoMode ? process.argv[process.argv.indexOf('--fixture')+1] : null;
const token=process.env.X_ACCESS_TOKEN || process.env.X_BEARER_TOKEN;
const initialPages=clamp(process.env.X_INITIAL_PAGES,5,1,32);
const incrementalPages=clamp(process.env.X_INCREMENTAL_PAGES,32,1,32);
const PAGE_SIZE=100;
function clamp(value,defaultValue,min,max){const n=Number(value);return Number.isInteger(n)&&n>=min&&n<=max?n:defaultValue;}
async function jsonFile(file,fallback) { try {return JSON.parse(await readFile(file,'utf8'));} catch(e){if(e.code==='ENOENT')return fallback;throw e;} }
async function api(resource,query={}) {
  const url=new URL(`https://api.x.com/2/${resource}`);
  Object.entries(query).forEach(([k,v])=>{if(v!==undefined && v!==null && v!=='')url.searchParams.set(k,String(v));});
  const response=await fetch(url, {headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},signal:AbortSignal.timeout(20000)});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(`X API error ${response.status}: ${JSON.stringify(body).slice(0,500)} (check account token, user ID, credits and post.fields access)`);
  return body;
}
function newestOf(posts){return posts.reduce((max,p)=>(!max||BigInt(p.id)>BigInt(max))?p.id:max,null);}
async function main(){
  let state=await jsonFile(statePath,{last_post_id:null,user_id:null});
  const previous=await jsonFile(archivePath,[]);
  const userId=String(process.env.X_USER_ID || state.user_id || '');
  let effectiveUserId=userId;
  if(!demoMode && !token) throw new Error('Set X_ACCESS_TOKEN or X_BEARER_TOKEN in GitHub Actions secrets. No tokens are accepted in site files.');
  if(!demoMode && !/^\d{1,19}$/.test(effectiveUserId)){
    const lookup=await api(`users/by/username/${USERNAME}`,{'user.fields':'username'});
    effectiveUserId=String(lookup.data?.id || '');
    if(!/^\d{1,19}$/.test(effectiveUserId) || lookup.data?.username?.toLowerCase()!==USERNAME.toLowerCase()) throw new Error('Account resolution failed or returned a different username');
  }
  let nextToken=null;
  let newest=null;
  let pages=0;
  const posts=[];
  const firstRun=!state.last_post_id;
  const maxPages=firstRun?initialPages:incrementalPages;
  do {
    let result;
    if(demoMode){
      const fixture=await jsonFile(path.resolve(fixturePath),{});
      result=Array.isArray(fixture) ? {data:fixture,meta:{}} : fixture;
    } else {
      const query={max_results:PAGE_SIZE,exclude:'replies,retweets','post.fields':'article,article_title,author_id,created_at,entities,note_post,text',
        ...(state.last_post_id?{since_id:state.last_post_id}:{}),...(nextToken?{pagination_token:nextToken}:{})};
      result=await api(`users/${effectiveUserId}/tweets`,query);
    }
    const page=Array.isArray(result.data)?result.data:[];
    if(!newest) newest=result.meta?.newest_id || newestOf(page);
    posts.push(...page);
    pages++;
    nextToken=demoMode ? null : (result.meta?.next_token || null);
    if(!firstRun && nextToken && pages===maxPages) throw new Error('Too many new posts for configured X_INCREMENTAL_PAGES. Increase it to <=32 and retry; state was NOT advanced.');
  } while(nextToken && pages<maxPages);
  const incoming=posts.map(articleFromPost).filter(Boolean);
  const merged=mergeArchive(previous,incoming);
  const newCount=merged.length-previous.length;
  const nextState={last_post_id:newest && (!state.last_post_id || BigInt(newest)>BigInt(state.last_post_id))?newest:state.last_post_id,
    user_id:effectiveUserId||state.user_id||null,username:USERNAME,last_success:(newest && newest!==state.last_post_id) || newCount ? new Date().toISOString() : (state.last_success||null),article_count:merged.length};
  if(demoMode) { console.log(`FIXTURE MODE: ${posts.length} posts, ${incoming.length} article entries; ${newCount} new. Nothing written.`);console.log(JSON.stringify(merged,null,2));return; }
  // Never replace a working public index with invalid/partial API data: only reach here after all pages succeeded.
  const newJson=JSON.stringify(merged,null,2)+'\n';
  if(newJson !== JSON.stringify(previous,null,2)+'\n'){
    await writeFile(archivePath,newJson);
    await writeFile(autoPath,renderJs(merged));
  }
  await writeFile(statePath,JSON.stringify(nextState,null,2)+'\n');
  console.log(`X @${USERNAME}: scanned ${posts.length} posts (${pages} page(s)); found ${incoming.length} articles, added ${newCount}; total ${merged.length}.`);
  console.log(firstRun && nextToken ? `Initial import limited to latest ${posts.length} posts as configured.` : `Cursor advanced to ${nextState.last_post_id || '(no posts)'}.`);
}
main().catch(e=>{console.error(String(e?.message||e));process.exitCode=1;});
