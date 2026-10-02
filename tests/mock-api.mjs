import { readFile } from 'node:fs/promises';
const data=JSON.parse(await readFile(new URL('./mock-x-response.json',import.meta.url),'utf8'));
globalThis.fetch = async input => {
  const u=new URL(input);
  if (!u.pathname.endsWith('/users/123/tweets')) throw new Error(`Unexpected API route: ${u.pathname}`);
  const payload=u.searchParams.has('since_id') ? {data:[],meta:{result_count:0}} : data;
  return new Response(JSON.stringify(payload),{status:200,headers:{'content-type':'application/json'}});
};
