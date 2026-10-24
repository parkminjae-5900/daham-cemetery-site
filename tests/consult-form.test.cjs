const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

// Minimal DOM double: reject HTML parsing sinks rather than emulate a browser.
class Element {
  constructor(tag) { this.tagName=tag; this.children=[]; this.style={}; this.value=''; this.hidden=true; this.listeners={}; this._text=''; }
  set innerHTML(_) { throw new Error('Unsafe HTML sink'); }
  set outerHTML(_) { throw new Error('Unsafe HTML sink'); }
  insertAdjacentHTML() { throw new Error('Unsafe HTML sink'); }
  set textContent(value) { this._text=String(value); this.children=[]; }
  get textContent() { return this._text+this.children.map(x=>x.textContent).join(''); }
  replaceChildren(...children) { this._text=''; this.children=children; }
  addEventListener(name, handler) { this.listeners[name]=handler; }
}
function setup() {
  const elements=Object.fromEntries(['consultForm','result','graves','terrain','plan','contact'].map(id=>[id,new Element('div')]));
  elements.graves.value='2기';
  elements.terrain.value='차량 접근 가능';
  elements.plan.value='개장 후 화장';
  const document={
    getElementById:id=>elements[id]||null,
    createElement:tag=>new Element(tag),
    querySelector:()=>null,
    querySelectorAll:()=>[]
  };
  vm.runInNewContext(source,{document});
  return elements;
}
function check(elements) {
  let prevented=false;
  elements.consultForm.listeners.submit({preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  const result=elements.result;
  assert.equal(result.hidden,false);
  assert.deepEqual(result.children.map(x=>x.tagName),['b','br','span','br','br','a']);
  const expected='다함장묘 상담 요청\n묘지 기수: '+elements.graves.value+
    '\n현장 지형: '+elements.terrain.value+'\n희망 진행: '+elements.plan.value+
    '\n연락처: '+(elements.contact.value.trim()||'연락처 미입력');
  assert.equal(result.children[2].textContent,expected);
  assert.equal(result.children[2].style.whiteSpace,'pre-line');
  const link=result.children[5];
  assert.equal(link.href,'sms:01051985900?body='+encodeURIComponent(expected));
  assert.equal(decodeURIComponent(link.href.split('?body=')[1]),expected);
  assert.equal(link.textContent,'이 내용으로 문자 보내기 →');
}
const inputs=[
  ['normal',' 010-1234-5678 '],
  ['empty',''],
  ['whitespace','   '],
  ['special characters',`< > & " ' % ? # + 한글 😀`],
  ['image event','<img src=x onerror="globalThis.pwned=1">'],
  ['script','<script>globalThis.pwned=1</script>'],
  ['SVG event','<svg onload="globalThis.pwned=1"></svg>'],
  ['attribute breakout','"><a href="javascript:alert(1)">click</a>'],
  ['HTML entity','&lt;img src=x onerror=alert(1)&gt;']
];
for (const [name,value] of inputs) test(name,()=>{const e=setup();e.contact.value=value;check(e);});
for (const field of ['graves','terrain','plan']) test('tampered '+field,()=>{
  const e=setup();e[field].value='<img src=x onerror=alert(1)>\n&body=other';check(e);
});
test('repeated submission replaces old content and SMS link',()=>{
  const e=setup();e.contact.value=inputs[4][1];check(e);
  e.contact.value='010-9876-5432';check(e);
  assert.equal(e.result.textContent.includes('<img'),false);
});
