(function(){
  var O=window.OUCVSearch,$=function(id){return document.getElementById(id)};
  if(!O)return;
  var lexSearch=$("lexSearch"),lexGroup=$("lexGroup"),lexGrid=$("lexGrid"),lexCount=$("lexCount"),input=$("input"),hits=$("hits");
  if(!lexSearch||!lexGrid||!lexCount)return;
  var token=0,mentionToken=0,officialToken=0,timer=null;
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]})}
  function domainLabel(d){
    var m={"medical.disease":"疾病／診斷","health.symptom":"症狀／徵象","medical.procedure":"醫療處置","health.nutrition":"營養／飲食","care.service":"長照服務","function.adl_iadl":"功能／ADL／IADL","equipment.assistive":"輔具／設備","event.workflow":"事件／行政","social.welfare":"社會福利","protection.safety":"保護／安全","family.relationship":"家庭／關係","economy.housing":"經濟／居住","network.professional":"專業／網絡","employment.education.justice":"就業／教育／司法"};
    return m[d]||d;
  }
  function setStatus(msg){
    var base=lexCount.textContent.replace(/\s*｜\s*OUCV.*$/,'');
    lexCount.textContent=base+' ｜ OUCV '+O.version+'：'+msg;
  }
  async function extendSearch(){
    var q=lexSearch.value.trim(),mine=++token;
    if(!q){setStatus('輸入關鍵字後載入共用詞彙');return}
    if(lexGroup&&lexGroup.value){setStatus('目前分類篩選僅顯示原個管詞庫');return}
    setStatus('搜尋中…');
    try{
      var rows=await O.search(q,80);if(mine!==token)return;
      var existing=new Set(Array.from(lexGrid.querySelectorAll('[data-oucv-id]')).map(function(x){return x.getAttribute('data-oucv-id')}));
      rows.forEach(function(x){if(existing.has(x.id))return;var d=document.createElement('div');d.className='lexitem oucv-item';d.setAttribute('data-oucv-id',x.id);d.innerHTML='<div class="head"><strong>'+esc(x.label)+'</strong><span class="tag">'+esc(domainLabel(x.domain))+'</span></div><div class="aliases"><strong>OUCV 搜尋詞：</strong>'+esc(x.terms.slice(1).join('、')||'—')+'</div><div class="follow"><strong>用途：</strong>搜尋提示；不得由症狀自動推定診斷或改寫正式紀錄</div>';lexGrid.appendChild(d)});
      setStatus(rows.length+' 筆共用詞彙命中');
    }catch(e){if(mine===token)setStatus('擴充詞庫未載入，原個管功能仍可使用')}
  }
  function invalidateOfficial(){officialToken++;Array.from(lexGrid.querySelectorAll('[data-oucv-official]')).forEach(function(x){x.remove()})}
  lexSearch.addEventListener('input',function(){token++;invalidateOfficial();clearTimeout(timer);timer=setTimeout(extendSearch,120)});
  if(lexGroup)lexGroup.addEventListener('change',function(){token++;invalidateOfficial();setTimeout(extendSearch,0)});

  var officialBar=document.createElement('div');
  officialBar.className='lexbar';
  officialBar.style.marginTop='10px';
  officialBar.innerHTML='<select id="oucvOfficialType" aria-label="完整 ICD 搜尋類型"><option value="cm">完整疾病／診斷 ICD-10-CM</option><option value="pcs">完整處置 ICD-10-PCS</option><option value="all">CM＋PCS 全部</option></select><button id="oucvOfficialSearch" type="button">搜尋完整 ICD</button>';
  if(lexGrid&&lexGrid.parentNode)lexGrid.parentNode.insertBefore(officialBar,lexGrid);
  var officialNote=document.createElement('div');
  officialNote.className='meta';
  officialNote.textContent='完整 ICD 僅在按下搜尋時載入官方索引；查詢命中不得作為自動診斷、因果判定或直接寫入正式紀錄。';
  if(officialBar.parentNode)officialBar.parentNode.insertBefore(officialNote,officialBar.nextSibling);

  async function officialLookup(){
    var btn=$("oucvOfficialSearch"),type=$("oucvOfficialType"),q=lexSearch.value.trim();
    if(!btn||!type)return;
    if(!q){setStatus('請先輸入疾病、處置、英文名稱或 ICD 代碼');return}
    var mine=++officialToken,requestedType=type.value;
    btn.disabled=true;var old=btn.textContent;btn.textContent='載入完整 ICD…';
    try{
      var rows=await O.officialSearch(q,requestedType,100);
      if(mine!==officialToken||q!==lexSearch.value.trim()||requestedType!==type.value)return;
      Array.from(lexGrid.querySelectorAll('[data-oucv-official]')).forEach(function(x){x.remove()});
      rows.forEach(function(x){
        var d=document.createElement('div');d.className='lexitem oucv-item';d.setAttribute('data-oucv-official',x.kind+':'+x.code);
        d.innerHTML='<div class="head"><strong>'+esc(x.code+' '+(x.zh||''))+'</strong><span class="tag">ICD-10-'+esc(x.kind)+'</span></div><div class="aliases"><strong>英文：</strong>'+esc(x.en||'—')+'</div><div class="follow"><strong>用途：</strong>官方代碼查詢；不得作為自動診斷或未經確認的專業判定</div>';lexGrid.appendChild(d);
      });
      setStatus('完整 ICD '+rows.length+' 筆命中（最多顯示100筆）');
    }catch(e){if(mine===officialToken)setStatus('完整 ICD 載入失敗；原個管與常用 OUCV 搜尋仍可使用')}
    finally{btn.disabled=false;btn.textContent=old}
  }
  var officialBtn=$("oucvOfficialSearch");if(officialBtn)officialBtn.addEventListener('click',officialLookup);
  var officialType=$("oucvOfficialType");if(officialType)officialType.addEventListener('change',invalidateOfficial);
  var box=document.createElement('div');box.id='oucvMentionBox';box.className='qa hidden';
  box.setAttribute('aria-live','polite');
  var anchor=$("crossBox")||hits; if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(box,anchor.nextSibling);
  function hideMentions(){mentionToken++;box.classList.add('hidden');box.textContent=''}
  if(input)input.addEventListener('input',hideMentions);
  var clearBtn=$("clear");if(clearBtn)clearBtn.addEventListener('click',hideMentions);
  ['sampleFall','sampleAccident','sampleWound','sampleCare','sampleService'].forEach(function(id){
    var sampleBtn=$(id);if(sampleBtn)sampleBtn.addEventListener('click',hideMentions);
  });
  async function renderMentions(){
    if(!input||!input.value.trim()||!box){hideMentions();return}
    var raw=input.value,mine=++mentionToken;
    try{
      var rows=await O.matchText(raw,20);if(mine!==mentionToken||raw!==input.value)return;
      if(!rows.length){box.classList.add('hidden');box.textContent='';return}
      box.classList.remove('hidden');
      box.innerHTML='<strong>OUCV 共用詞彙提示：</strong>'+rows.map(function(x){return '<span class="chip">'+esc(x.label)+'</span>'}).join(' ')+'<div class="meta">僅代表文字中出現相符詞彙，不等於確診、因果、資格判定或已完成處置。</div>';
    }catch(e){if(mine===mentionToken)hideMentions()}
  }
  ['gen','compare'].forEach(function(id){var el=$(id);if(el)el.addEventListener('click',function(){setTimeout(renderMentions,0)})});
  setStatus('可用；完整 ICD 原始索引保留在 OUCV 雲端來源庫');
})();
