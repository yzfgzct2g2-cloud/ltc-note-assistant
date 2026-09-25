const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
global.window=global;
global.location={href:'https://example.test/case-manager/'};
global.document={currentScript:{src:'https://example.test/shared/oucv-loader.js'}};
global.fetch=async url=>{
  const name=path.basename(new URL(url).pathname);
  const p=path.join(root,'shared','oucv',name);
  if(!fs.existsSync(p))return {ok:false,status:404,json:async()=>({})};
  return {ok:true,status:200,json:async()=>JSON.parse(fs.readFileSync(p,'utf8'))};
};
vm.runInThisContext(fs.readFileSync(path.join(root,'shared','oucv-loader.js'),'utf8'),{filename:'oucv-loader.js'});
(async()=>{
  assert.equal(OUCVSearch.version,'0.2.0-rc.1');
  assert((await OUCVSearch.search('外看')).some(x=>x.terms.includes('外看')));
  assert((await OUCVSearch.search('CVA')).some(x=>x.label==='腦中風'));
  assert((await OUCVSearch.search('沒飯吃')).length>0);
  const m=await OUCVSearch.matchText('案女表示個案有糖尿病，昨天沒有跌倒');
  assert(m.some(x=>x.label==='糖尿病'));
  assert(m.some(x=>x.label.includes('跌倒')),'mention matching is intentionally lexical; assertion remains elsewhere');
  assert.equal((await OUCVSearch.search('xyz不存在')).length,0);
  console.log('PASS OUCV loader', (await OUCVSearch.load()).length, 'records');
})().catch(e=>{console.error(e);process.exit(1)});
