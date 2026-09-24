const P={"styleA":{"name":"個管風格 A","subject":"個案","self":"個管","s3":"訪視對象","s4":"訪視內容","desc":"日期獨立＋(一)(二)；偏確認、目前、其表示、表知悉。"},"styleB":{"name":"個管風格 B","subject":"個案","self":"個管員","s3":"服務對象","s4":"服務內容","desc":"近期狀況導向；1.2.3.固定且較精簡。"},"styleC":{"name":"個管風格 C","subject":"案主","self":"個管員","s3":"訪視對象","s4":"訪視內容","desc":"案主／個管員；保留聯絡→其告知／其表示→故／後續之互動鏈。"},"styleD":{"name":"個管風格 D","subject":"個案","self":"個管","s3":"訪視對象","s4":"訪視內容","desc":"直接案○表示；細分資訊點並接個管告知／提醒。"},"styleE":{"name":"個管風格 E","subject":"個案","self":"個管員","s3":"訪視對象","s4":"訪視內容","desc":"自然敘事；用惟、故、另、並串接事件、限制與後續。"}};
(function(){
 var S=window.LTCShared,$=function(id){return document.getElementById(id)};
 $("date").value=S.today();
 function profile(){
  var p=P[$("style").value];
  $("profile").textContent=p.name+"｜"+p.desc+"\n預設稱謂："+p.subject+"｜個管自稱："+p.self+"｜三/四欄："+p.s3+"／"+p.s4;
 }
 $("style").addEventListener("change",profile);profile();
 function explicitSource(s){return /^(案|外看).{0,7}(表示|告知)|^(個案|案主)(表示|告知)|^其(告知|表示)|^個管(員)?/.test(s)}
 function render(style,raw){
  var p=P[style],c=S.detectRelation(raw),a=S.sentences(S.formalPolish(raw,p.subject,$("recordMode").value==="compact"));
  if(style==="styleA")return a.map(function(s,i){
   var x=explicitSource(s)||c==="待確認"?s:(i===0?c+"表示"+s:"其表示"+s);
   return "("+(["一","二","三","四","五","六"][i]||i+1)+")\n"+S.shortDate($("date").value)+"\n"+S.ensure(x);
  }).join("\n");
  if(style==="styleC")return a.map(function(s,i){
   var x=s;
   if(!explicitSource(x)){if(c!=="待確認")x=i===0?"個管員與"+c+"聯絡，關心案主近況，其告知"+x:"其表示"+x;else if(i===0)x="個管員關心案主近況，"+x}
   return (i+1)+"."+S.ensure(x);
  }).join("\n");
  if(style==="styleD")return a.map(function(s,i){
   var x=explicitSource(s)||c==="待確認"?s:c+"表示"+s;
   if(i===0&&c!=="待確認"&&!/^電聯/.test(x))x="電聯"+c+"，關心個案近況，"+x;
   return (i+1)+"."+S.ensure(x.replace(/^其告知/,c+"表示").replace(/^其表示/,c+"表示"));
  }).join("\n");
  if(style==="styleB")return a.map(function(s,i){
   var x=explicitSource(s)||c==="待確認"?s:c+"表示"+s;
   if(i===0&&!/近期|甫出院|住院|加護病房/.test(x))x="近期"+x;
   return (i+1)+"."+S.ensure(x);
  }).join("\n");
  return a.map(function(s,i){
   var x=explicitSource(s)||c==="待確認"?s:(i===0?c+"表示":"另"+c+"表示")+s;
   if(i>0&&!/^另/.test(x)&&!explicitSource(s))x="另"+x;
   return S.ensure(x);
  }).join("\n");
 }
 function record(style,a){
  var p=P[style],c=S.detectRelation(a.clean),ch=S.changeStatus(a.clean,a.hits);
  return "一、服務追蹤方式："+$("method").value+"\n二、服務追蹤日期："+S.roc($("date").value)+"\n三、"+p.s3+"："+c+"\n四、"+p.s4+"：\n"+render(style,a.clean)+"\n五、照顧計畫異動需求："+ch;
 }
 function update(){
  var a=S.analyze($("input").value),risk=S.riskCheck($("input").value,a.positive),c=S.detectRelation(a.clean),ch=S.changeStatus(a.clean,a.hits),w=[];
  $("hits").innerHTML=a.hits.length?a.hits.map(function(h){return '<span class="chip '+(h.status==="negated"?"neg":h.status==="uncertain"?"uncertain":h.risk==="high"?"risk":"")+'">'+S.esc(h.label)+(h.status==="negated"?"（否定）":h.status==="uncertain"?"（不確定）":"")+"</span>"}).join(""):'<span class="meta">未命中既有概念</span>';
  $("instructions").innerHTML=(a.instructions.length?a.instructions:["無"]).map(function(x){return '<span class="chip">'+S.esc(x)+'</span>'}).join("");
  $("crossBox").innerHTML=a.crosses.map(function(r){return '<div class="cross"><strong>'+S.esc(r.title)+'</strong><div>'+S.esc(r.text)+'</div></div>'}).join("");
  var risks=Array.from(new Set(risk.phrases.concat(risk.high.map(function(x){return x.label}))));
  $("riskBox").classList.toggle("hidden",!risks.length);if(risks.length)$("riskBox").innerHTML="<strong>安全提醒：</strong>偵測到可能涉及急性安全風險："+S.esc(risks.join("、"))+"。本工具不判定嚴重度，應先確認是否已有醫療處置或仍有立即危險。";
  if(c==="待確認")w.push("未提供實際電訪／訪視對象，第三欄保留「待確認」。");
  if(ch==="待確認")w.push("沒有足夠證據判定照顧計畫有／無異動，第五欄不自行推測。");
  var uncertain=a.hits.filter(function(h){return h.status==="uncertain"});if(uncertain.length)w.push("偵測到不確定語氣："+uncertain.map(function(x){return x.label}).join("、")+"；不得改寫成確定事實。");
  $("qa").classList.toggle("hidden",!w.length);$("qa").innerHTML=w.length?"<strong>QA：</strong>"+w.map(S.esc).join(" "):"";
  $("advice").textContent=S.buildAdvice(a,$("depth").value);
  $("questionScript").textContent=S.questionScript(a);
  return a;
 }
 $("gen").onclick=function(){if(!$("input").value.trim())return;var a=update();$("output").textContent=record($("style").value,a);$("status").textContent="已完成個管紀錄生成。";$("status").className="status ok"};
 $("compare").onclick=function(){if(!$("input").value.trim())return;var a=update();$("grid").innerHTML=Object.keys(P).map(function(k){return '<div class="cmp"><h3>'+S.esc(P[k].name)+'</h3><div class="meta">'+S.esc(P[k].desc)+'</div><div class="txt">'+S.esc(record(k,a))+'</div></div>'}).join("");$("compareCard").classList.remove("hidden")};
 $("sampleAccident").onclick=function(){$("input").value="個案上週五出門時出車禍，目前住進加護病房，體況有趨於穩定。幫我生成一段電訪紀錄，還要告訴我接下來要追蹤什麼。"};
 $("sampleWound").onclick=function(){$("input").value="個案目前剛出院，身上有壓瘡，現在大多躺在床上，可否協助生成一段話？"};
 $("sampleCare").onclick=function(){$("input").value="外看下週要休假十天，案女白天要上班，家裡目前沒有人可以顧個案，家屬最近照顧壓力也很大。"};
 $("sampleService").onclick=function(){$("input").value="案女來電表示居服員最近常遲到，服務內容也和原本講的不一樣，家屬不太滿意，想更換服務單位。"};
 $("clear").onclick=function(){$("input").value="";$("output").textContent="尚未產生";$("advice").textContent="尚未產生";$("questionScript").textContent="尚未產生";$("hits").innerHTML='<span class="meta">尚未分析</span>';$("instructions").innerHTML='<span class="meta">尚未分析</span>';$("crossBox").innerHTML="";$("qa").classList.add("hidden");$("riskBox").classList.add("hidden");$("compareCard").classList.add("hidden");$("status").textContent=""};
 $("copy").onclick=async function(){try{await navigator.clipboard.writeText($("output").textContent);$("status").textContent="已複製正式紀錄。"}catch(e){$("status").textContent="瀏覽器未允許直接複製。"}};
 function drawLex(){
  var q=S.normText($("lexSearch").value),g=$("lexGroup").value,arr=S.listLexicon().filter(function(x){return(!g||x.group===g)&&(!q||S.normText(x.label+" "+x.aliases.join(" ")).includes(q))});
  $("lexCount").textContent="顯示 "+arr.length+" / "+S.LEXICON.length+" 個概念";
  $("lexGrid").innerHTML=arr.map(function(x){return '<div class="lexitem"><div class="head"><strong>'+S.esc(x.label)+'</strong><span class="tag">'+S.esc(S.GROUPS[x.group])+'</span></div><div class="aliases"><strong>同義詞／口語：</strong>'+S.esc(x.aliases.join("、"))+'</div><div class="follow"><strong>正式化概念：</strong>'+S.esc(x.normal)+'</div></div>'}).join("");
 }
 $("lexGroup").innerHTML='<option value="">全部領域</option>'+Object.entries(S.GROUPS).map(function(kv){return '<option value="'+kv[0]+'">'+S.esc(kv[1])+'</option>'}).join("");
 $("lexSearch").addEventListener("input",drawLex);$("lexGroup").addEventListener("change",drawLex);drawLex();
})();
