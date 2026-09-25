"""Real complete pages/scripts/data; controlled in-memory transport, NOT hosted E2E.
Run: python tests/full_page_integration.py --report result.json
No browser policies are changed. All test notes are synthetic.
"""
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
import argparse, base64, json, re, sys

parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1])
parser.add_argument('--report',type=Path,required=True)
parser.add_argument('--golden',type=Path)
parser.add_argument('--write-golden',action='store_true')
args=parser.parse_args();root=args.root.resolve();args.report.parent.mkdir(parents=True,exist_ok=True)
report={'scope':'complete-page browser integration with real scripts and real packaged JSON/gzip; fixture transport only; not HTTP/Pages/iOS E2E','checks':[]}
golden=json.loads(args.golden.read_text()) if args.golden and args.golden.exists() and not args.write_golden else {}
observed={}; pages=[];script_orders={}

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 report['browser']=browser.version
 def boot(role='case-manager',width=1280):
  page=browser.new_page(viewport={'width':width,'height':900});page.set_default_timeout(3500)
  errors=[];page.on('pageerror',lambda e: errors.append(str(e)));pages.append((page,errors))
  def read_file(_source,url):
   path=urlparse(url).path
   if not path.startswith('/ltc-note-assistant/shared/'):raise RuntimeError('Unexpected fixture request '+path)
   rel=path.removeprefix('/ltc-note-assistant/')
   if rel not in {f'shared/oucv/{n}.json' for n in ['medical','care','social','network']}|{f'shared/icd/{n}.search.json.gz' for n in ['icd10cm','icd10pcs']}:
    raise RuntimeError('Request outside approved static assets')
   return base64.b64encode((root/rel).read_bytes()).decode()
  page.expose_binding('__readFixture',read_file)
  html=(root/role/'index.html').read_text();scripts=re.findall(r'<script\s+src="([^"]+)"\s*></script>',html)
  html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
  html=html.replace('<link rel="stylesheet" href="../shared/styles.css">','<style>'+(root/'shared/styles.css').read_text()+'</style>')
  page.set_content(html)
  page.evaluate('''() => {
   window.__transport={requests:[],delay:{},fail:{}};
   window.fetch=async (url,options={})=>{
    const u=new URL(String(url));const s=window.__transport,key=u.pathname.split('/').pop();
    s.requests.push({url:u.href,options});
    const shouldFail=(s.fail[key]||0)>0;if(shouldFail)s.fail[key]--;
    const delay=s.delay[key]||0;if(delay)await new Promise(r=>setTimeout(r,delay));
    if(shouldFail)throw new Error('synthetic transport failure');
    const encoded=await window.__readFixture(u.href);
    const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
    return new Response(bytes,{status:200});
   };
  }''')
  for src in scripts:
   path=(root/role/src).resolve();assert path.is_relative_to(root)
   # Only the origin locator is supplied; source itself remains byte-identical.
   page.evaluate('(src)=>Object.defineProperty(document,"currentScript",{configurable:true,value:{src}})',f'https://fixture.test/ltc-note-assistant/{path.relative_to(root).as_posix()}')
   page.add_script_tag(content=path.read_text())
   page.evaluate('delete document.currentScript')
  script_orders[role]=scripts
  return page
 def check(name,fn):
  start=len(pages)
  try:fn();report['checks'].append({'name':name,'status':'PASS'})
  except Exception as e:
   report['checks'].append({'name':name,'status':'FAIL','error':str(e)[:1200]})
  finally:
   for p,errors in pages[start:]:
    if errors:report['checks'].append({'name':name+' script errors','status':'FAIL','error':errors})
    p.close()
 def note(p,text='案女表示個案有糖尿病，目前不需調整服務。'):
  p.locator('#input').fill(text);p.locator('#gen').click()
  p.wait_for_function("!document.getElementById('oucvMentionBox').classList.contains('hidden')")
 def lex(p,q):
  p.locator('summary').click();p.locator('#lexSearch').fill(q);p.wait_for_timeout(180)
 def official(p,q='A00',kind='cm'):
  lex(p,q);p.locator('#oucvOfficialType').select_option(kind);p.locator('#oucvOfficialSearch').click()
  p.wait_for_function("!document.getElementById('oucvOfficialSearch').disabled")
 def visible_count(p,selector):return p.locator(selector).count()
 def initial():
  p=boot();assert p.locator('#style option').count()==5;assert p.locator('#role').count()==0
  assert p.locator('#oucvOfficialSearch').count()==1
  assert p.evaluate('window.__transport.requests.length')==0
  assert p.locator('.home-link').get_attribute('href')=='../'
 check('initial page and independent case-manager controls; zero requests',initial)
 def styles():
  p=boot();p.locator('#date').fill('2026-09-25')
  for sid in ['sampleFall','sampleAccident','sampleWound','sampleCare','sampleService']:
   p.locator('#'+sid).click()
   for style in ['styleA','styleB','styleC','styleD','styleE']:
    p.locator('#style').select_option(style)
    for mode in ['faithful','compact']:
     p.locator('#recordMode').select_option(mode);p.locator('#gen').click()
     text=p.locator('#output').inner_text();key=f'{sid}/{style}/{mode}'
     observed[key]=text
     assert all(marker in text for marker in ['一、','二、','三、','四、','五、'])
     if not args.write_golden and golden:assert text==golden[key],key+' changed generated record'
  p.locator('#compare').click();assert p.locator('#grid .cmp').count()==5
 check('50 record combinations preserve full baseline output + five-style comparison',styles)
 def clear():
  p=boot();note(p);p.locator('#clear').click();p.wait_for_timeout(100)
  assert not p.locator('#oucvMentionBox').is_visible(),'OUCV mentions survive actual clear'
  assert p.locator('#output').inner_text()=='尚未產生';assert p.locator('#input').input_value()==''
 check('actual clear button removes all OUCV mentions',clear)
 def edit():
  p=boot();note(p);p.locator('#input').fill('新的合成紀錄');assert not p.locator('#oucvMentionBox').is_visible()
 check('editing invalidates old mentions immediately',edit)
 def sample():
  p=boot();note(p);p.locator('#sampleFall').click();p.wait_for_timeout(50)
  assert not p.locator('#oucvMentionBox').is_visible(),'sample replaces text but leaves previous mentions'
 check('sample button invalidates old mentions',sample)
 def stale_official():
  p=boot();lex(p,'A00');p.evaluate("__transport.delay['icd10cm.search.json.gz']=300")
  p.locator('#oucvOfficialSearch').click();p.locator('#lexSearch').fill('A01');p.wait_for_timeout(600)
  assert visible_count(p,'[data-oucv-official]')==0,'stale official result'
 check('earlier official query cannot overwrite a newer query',stale_official)
 def stale_kind():
  p=boot();lex(p,'A00');p.evaluate("__transport.delay['icd10cm.search.json.gz']=300")
  p.locator('#oucvOfficialSearch').click();p.locator('#oucvOfficialType').select_option('pcs');p.wait_for_timeout(600)
  assert visible_count(p,'[data-oucv-official]')==0
 check('type change invalidates in-flight official results',stale_kind)
 def retry_official():
  p=boot();lex(p,'A00');p.evaluate("__transport.fail['icd10cm.search.json.gz']=1")
  p.locator('#oucvOfficialSearch').click();p.wait_for_timeout(150)
  assert '載入失敗' in p.locator('#lexCount').inner_text()
  before=p.evaluate('__transport.requests.length');p.wait_for_timeout(150);assert p.evaluate('__transport.requests.length')==before
  p.locator('#oucvOfficialSearch').click();p.wait_for_function("!document.getElementById('oucvOfficialSearch').disabled")
  assert visible_count(p,'[data-oucv-official="CM:A00"]')==1
 check('official load recovers only on explicit retry',retry_official)
 def retry_common():
  p=boot();p.evaluate("__transport.fail['medical.json']=1");p.locator('#input').fill('糖尿病');p.locator('#gen').click();p.wait_for_timeout(150)
  assert p.locator('#output').inner_text()!='尚未產生'
  before=p.evaluate('__transport.requests.length');p.wait_for_timeout(100);assert p.evaluate('__transport.requests.length')==before
  p.locator('#gen').click();p.wait_for_function("!document.getElementById('oucvMentionBox').classList.contains('hidden')")
 check('common load failure leaves record generation usable and retry works',retry_common)
 def stale_common_error():
  p=boot();p.evaluate("__transport.fail['medical.json']=1;__transport.delay['medical.json']=350")
  lex(p,'糖尿病');p.locator('#lexSearch').fill('');p.wait_for_timeout(500)
  assert '未載入' not in p.locator('#lexCount').inner_text(),'obsolete common error replaced empty-query status'
 check('obsolete common-search failure cannot replace newer status',stale_common_error)
 def lazy():
  p=boot();note(p);assert not any('.gz' in x['url'] for x in p.evaluate('__transport.requests'))
  official(p,'霍亂');assert visible_count(p,'[data-oucv-official="CM:A00"]')==1
  assert not any('icd10pcs' in x['url'] for x in p.evaluate('__transport.requests'))
  count=p.evaluate('__transport.requests.length');p.locator('#oucvOfficialSearch').click();p.wait_for_function("!document.getElementById('oucvOfficialSearch').disabled");assert p.evaluate('__transport.requests.length')==count
 check('real CM gzip decompression, lazy loading and successful cache',lazy)
 def pcs():
  p=boot();official(p,'0016070','pcs');assert visible_count(p,'[data-oucv-official="PCS:0016070"]')==1
  assert not any('icd10cm.search' in x['url'] for x in p.evaluate('__transport.requests'))
 check('real PCS code search loads only PCS',pcs)
 def cap():
  p=boot();official(p,'A','all');assert visible_count(p,'[data-oucv-official]')==100
 check('large result sets obey 100-row display cap',cap)
 def failure_original():
  p=boot();p.evaluate("__transport.fail={'medical.json':1,'care.json':1,'social.json':1,'network.json':1}")
  p.locator('#input').fill('案女表示個案昨日回診。');p.locator('#gen').click();p.wait_for_timeout(200)
  assert '昨日回診' in p.locator('#output').inner_text()
  p.locator('#copy').click();assert '未允許' in p.locator('#status').inner_text()
 check('record + clipboard denial handling survive unavailable optional vocab',failure_original)
 def injection():
  p=boot();text='案女表示個案有糖尿病。<img src=x onerror="window.__injected=1">'
  p.locator('#input').fill(text);p.locator('#gen').click();p.wait_for_timeout(150)
  assert p.evaluate('window.__injected||0')==0
  assert p.locator('#output img').count()==0
  for request in p.evaluate('__transport.requests'):
   assert urlparse(request['url']).query=='';assert 'body' not in request['options']
 check('notes remain text; no input in transport URL or body',injection)
 def mobile():
  p=boot(width=375);p.locator('summary').click();p.locator('#lexSearch').fill('糖尿病');p.wait_for_timeout(250)
  assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1')
  assert p.locator('#oucvOfficialType').get_attribute('aria-label')
  p.locator('#oucvOfficialSearch').focus();assert p.evaluate("document.activeElement.id==='oucvOfficialSearch'")
  p.screenshot(path=str(args.report.with_suffix('.png')),full_page=True)
 check('375px viewport, keyboard focus, official selector accessible name',mobile)
 def supervisor():
  p=boot('supervisor');assert p.locator('#style').count()==0;assert p.locator('#oucvOfficialSearch').count()==0
  p.locator('#date').fill('2026-09-25')
  for sid in ['sampleLeave','sampleScope','sampleNoShow','sampleConflict']:
   p.locator('#'+sid).click();p.locator('#gen').click();text=p.locator('#output').inner_text();key='supervisor/'+sid;observed[key]=text
   if not args.write_golden and golden:assert text==golden[key]
  assert p.evaluate('__transport.requests.length')==0
 check('paused supervisor controls and four output snapshots stay unchanged',supervisor)
 browser.close()
report['script_orders']=script_orders
report['baseline_snapshots_compared']=len(observed) if golden and not args.write_golden else 0
report['pass']=sum(x['status']=='PASS' for x in report['checks']);report['fail']=sum(x['status']=='FAIL' for x in report['checks'])
args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2))
if args.write_golden and args.golden:args.golden.write_text(json.dumps(observed,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2));sys.exit(1 if report['fail'] else 0)
