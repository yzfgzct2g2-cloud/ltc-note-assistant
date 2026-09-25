(function(g){
  const script=document.currentScript;
  const sharedBase=script&&script.src?new URL('./',script.src):new URL('../shared/',location.href);
  const base=new URL('./oucv/',sharedBase);
  const icdBase=new URL('./icd/',sharedBase);
  const names=['medical','care','social','network'];
  let records=null, loading=null;
  const officialCache={cm:null,pcs:null};
  const officialLoading={cm:null,pcs:null};
  const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
  async function load(){
    if(records)return records;
    if(!loading)loading=Promise.all(names.map(async name=>{
      const res=await fetch(new URL(name+'.json',base),{cache:'force-cache'});
      if(!res.ok)throw new Error('OUCV pack load failed: '+name+' '+res.status);
      const data=await res.json();
      if(data.version!=='0.2.0-rc.1'||!Array.isArray(data.records))throw new Error('OUCV pack version/schema mismatch: '+name);
      return data.records;
    })).then(parts=>{
      records=parts.flat().map(x=>Object.assign({},x,{_hay:norm(x.terms.join(' '))}));
      return records;
    }).catch(function(error){
      loading=null; // A later explicit user request may retry; never loop automatically.
      throw error;
    });
    return loading;
  }
  async function search(q,limit=100){
    const n=norm(q);if(!n)return [];
    const rows=await load(),out=[];
    for(const x of rows){if(x._hay.includes(n)){out.push({id:x.id,label:x.label,domain:x.domain,terms:x.terms});if(out.length>=limit)break;}}
    return out;
  }
  async function matchText(text,limit=30){
    const n=norm(text);if(!n)return [];
    const rows=await load(),out=[];
    for(const x of rows){let matched='';for(const term of x.terms){const t=norm(term);if(t.length>=2&&n.includes(t)){matched=term;break;}}
      if(matched){out.push({id:x.id,label:x.label,domain:x.domain,matched});if(out.length>=limit)break;}}
    return out;
  }
  async function decodeGzipJson(res){
    if(typeof DecompressionStream!=='function')throw new Error('此瀏覽器不支援壓縮 ICD 索引解壓縮');
    const buf=await res.arrayBuffer();
    const stream=new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).json();
  }
  async function loadOfficial(kind){
    kind=kind==='pcs'?'pcs':'cm';
    if(officialCache[kind])return officialCache[kind];
    if(!officialLoading[kind])officialLoading[kind]=(async()=>{
      const file=kind==='pcs'?'icd10pcs.search.json.gz':'icd10cm.search.json.gz';
      const res=await fetch(new URL(file,icdBase),{cache:'force-cache'});
      if(!res.ok)throw new Error('ICD index load failed: '+kind+' '+res.status);
      const data=await decodeGzipJson(res);
      if(!data||!Array.isArray(data.records))throw new Error('ICD index schema mismatch: '+kind);
      officialCache[kind]=data.records.map(x=>Object.assign({},x,{_hay:norm([x.code,x.zh,x.en].join(' ')),kind:kind.toUpperCase()}));
      return officialCache[kind];
    })().catch(function(error){
      officialLoading[kind]=null; // Release only this failed in-flight cache.
      throw error;
    });
    return officialLoading[kind];
  }
  async function officialSearch(q,kind='cm',limit=100){
    const n=norm(q);if(!n)return [];
    const kinds=kind==='all'?['cm','pcs']:[kind==='pcs'?'pcs':'cm'];
    const out=[];
    for(const k of kinds){
      const rows=await loadOfficial(k);
      for(const x of rows){
        if(x._hay.includes(n)){
          out.push({code:x.code,zh:x.zh,en:x.en,kind:x.kind,status:x.status||'',changed:x.changed||''});
          if(out.length>=limit)return out;
        }
      }
    }
    return out;
  }
  g.OUCVSearch={version:'0.2.0-rc.1',load,search,matchText,officialSearch,loadOfficial,normalize:norm};
})(window);
