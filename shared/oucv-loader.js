(function(g){
  const script=document.currentScript;
  const base=script&&script.src?new URL('./oucv/',script.src):new URL('../shared/oucv/',location.href);
  const names=['medical','care','social','network'];
  let records=null, loading=null;
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
  g.OUCVSearch={version:'0.2.0-rc.1',load,search,matchText,normalize:norm};
})(window);
