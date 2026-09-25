const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
global.window=global;
global.location={href:'https://example.test/case-manager/'};
global.document={currentScript:{src:'https://example.test/shared/oucv-loader.js'}};
global.fetch=async url=>{
  const u=new URL(url); const name=path.basename(u.pathname);
  if(u.pathname.includes('/shared/icd/')){
    const p=path.join(root,'shared','icd',name);
    if(!fs.existsSync(p))return {ok:false,status:404};
    const b=fs.readFileSync(p);
    return {ok:true,status:200,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};
  }
  const p=path.join(root,'shared','oucv',name);
  if(!fs.existsSync(p))return {ok:false,status:404,json:async()=>({})};
  return {ok:true,status:200,json:async()=>JSON.parse(fs.readFileSync(p,'utf8'))};
};
vm.runInThisContext(fs.readFileSync(path.join(root,'shared','oucv-loader.js'),'utf8'),{filename:'oucv-loader.js'});
(async()=>{
  assert.equal(typeof OUCVSearch.officialSearch,'function');
  const cm=await OUCVSearch.officialSearch('霍亂','cm',10);
  assert(cm.some(x=>x.code==='A00'&&x.zh==='霍亂'&&x.kind==='CM'));
  const en=await OUCVSearch.officialSearch('Cholera','cm',10);
  assert(en.some(x=>x.code==='A00'));
  const code=await OUCVSearch.officialSearch('0016070','pcs',10);
  assert(code.some(x=>x.code==='0016070'&&x.kind==='PCS'));
  assert.equal((await OUCVSearch.officialSearch('', 'cm', 10)).length,0);
  console.log('PASS official ICD search',cm.length,en.length,code.length);
})().catch(e=>{console.error(e);process.exit(1)});
