const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync(require('node:path').join(__dirname,'../case-manager/oucv-ui.js'),'utf8');
assert(s.includes('oucvOfficialType'),'missing ICD type selector');
assert(s.includes('oucvOfficialSearch'),'missing official ICD search button');
assert(s.includes('officialSearch('),'UI must call officialSearch');
assert(s.includes('不得作為自動診斷'),'missing safety notice');
console.log('PASS OUCV UI static ICD controls');
