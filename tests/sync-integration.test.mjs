import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtemp,cp,mkdir,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('end-to-end sync works with mocked official endpoint and never duplicates or stores tokens',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'nuradu-e2e-'));
 try {
  for (const sub of ['scripts','sync','website','tests']) await cp(path.join(root,sub),path.join(dir,sub),{recursive:true});
  const env={...process.env,X_BEARER_TOKEN:'SHOULD_NOT_APPEAR_IN_PUBLIC_FILES',X_USER_ID:'123',X_INITIAL_PAGES:'1'};
  function run(){return spawnSync(process.execPath,['--import',path.join(dir,'tests/mock-api.mjs'),path.join(dir,'scripts/sync-x.mjs')],{cwd:dir,env,encoding:'utf8'});}
  const first=run();assert.equal(first.status,0,first.stderr);
  const archive=JSON.parse(await readFile(path.join(dir,'sync/articles-auto.json'),'utf8'));
  const state=JSON.parse(await readFile(path.join(dir,'sync/x-sync-state.json'),'utf8'));
  const js=await readFile(path.join(dir,'website/articles-auto.js'),'utf8');
  assert.equal(archive.length,1);assert.equal(archive[0].source,'x-api');
  assert.equal(state.last_post_id,'2079602472453386271');
  assert(!js.includes(env.X_BEARER_TOKEN));
  const second=run();assert.equal(second.status,0,second.stderr);
  assert.deepEqual(JSON.parse(await readFile(path.join(dir,'sync/articles-auto.json'),'utf8')),archive);
  assert.equal((JSON.parse(await readFile(path.join(dir,'sync/x-sync-state.json'),'utf8'))).last_success,state.last_success);
 } finally {await rm(dir,{force:true,recursive:true});}
});
