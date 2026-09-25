'use strict';
// Runs the real loader against synthetic transport failures; no production requests.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),zlib=require('node:zlib');
const root=process.env.SOURCE_ROOT||path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'shared/oucv-loader.js'),'utf8');
function setup(){
 const state={offline:false,requests:[]};
 const c={URL,Blob,Response,DecompressionStream,location:{href:'https://fixture.test/case-manager/'},document:{currentScript:{src:'https://fixture.test/shared/oucv-loader.js'}}};c.window=c;
 c.fetch=async url=>{state.requests.push(String(url));if(state.offline)throw new Error('synthetic temporary transport failure');
  if(String(url).endsWith('.gz')){const b=zlib.gzipSync(JSON.stringify({records:[{code:'A00',zh:'合成資料',en:'synthetic'}]}));return {ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}}
  return {ok:true,json:async()=>({version:'0.2.0-rc.1',records:[{id:'synthetic',label:'測試',domain:'fixture',terms:['測試']}]})};};
 vm.createContext(c);vm.runInContext(source,c);return {api:c.OUCVSearch,state};
}
test('no requests before explicit lookup',()=>{const {state}=setup();assert.equal(state.requests.length,0)});
test('curated load caches success and does not load ICD',async()=>{const {api,state}=setup();const [a,b]=await Promise.all([api.load(),api.load()]);assert.strictEqual(a,b);await api.load();assert.equal(state.requests.length,4);assert(state.requests.every(x=>!x.endsWith('.gz')))});
test('curated load recovers on an explicit later request, without automatic retries',async()=>{const {api,state}=setup();state.offline=true;await assert.rejects(()=>api.load());const before=state.requests.length;await new Promise(r=>setTimeout(r,20));assert.equal(state.requests.length,before);state.offline=false;const rows=await api.load();assert(rows.length>0)});
test('official load recovers on an explicit later request, without automatic retries',async()=>{const {api,state}=setup();state.offline=true;await assert.rejects(()=>api.officialSearch('A00','cm'));const before=state.requests.length;await new Promise(r=>setTimeout(r,20));assert.equal(state.requests.length,before);state.offline=false;const rows=await api.officialSearch('A00','cm');assert.equal(rows[0].code,'A00')});
