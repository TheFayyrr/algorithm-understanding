// 最小 DOM 检查实际 app.js 的交互；不代替浏览器的真实样式渲染。
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const MonotonicQueue = require('./algorithm.js');

function createLesson(width = 320) {
  class Element {
    constructor() {
      this.children=[]; this.dataset={}; this.style={}; this.handlers={}; this.attrs={};
      this.disabled=false; this.textContent=''; this.className=''; this.clientWidth=width; this.parent=null;
      this.classList={
        add: value => { this.className += ' ' + value; },
        toggle: (value, enabled) => {
          const names = new Set(this.className.split(/\s+/).filter(Boolean));
          if (enabled) names.add(value); else names.delete(value);
          this.className=[...names].join(' ');
        }
      };
    }
    setAttribute(name,value) { this.attrs[name]=value; }
    append(...nodes) { for (const node of nodes) { node.parent=this; this.children.push(node); } }
    addEventListener(name,callback) { this.handlers[name]=callback; }
    remove() { if (this.parent) this.parent.children=this.parent.children.filter(node => node!==this); }
    querySelector(selector) {
      if (selector.startsWith('.')) return this.children.find(node => node.className.split(/\s+/).includes(selector.slice(1))) ?? null;
      throw new Error(selector);
    }
    click() { if (!this.disabled) this.handlers.click(); }
    focus() { this.focused=true; }
  }
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  const ids=[...html.matchAll(/id="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,'页面中的 id 必须唯一');
  const elements=new Map(ids.map(id=>{
    const element=new Element(); element.id=id;
    return [id,element];
  }));
  const root=elements.get('mq-lesson');
  const tabs=[elements.get('mq-max-tab'),elements.get('mq-min-tab')];
  tabs[0].dataset.mode='max'; tabs[1].dataset.mode='min';
  root.querySelector=selector=>{
    assert.ok(elements.has(selector.slice(1)),`页面缺少 ${selector}`);
    return elements.get(selector.slice(1));
  };
  root.querySelectorAll=()=>tabs;
  const document={hidden:false,handlers:{},getElementById:id=>elements.get(id),createElement:()=>new Element(),addEventListener(name,callback){this.handlers[name]=callback;}};
  let id=0; const timers=new Map();
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),{
    document,MonotonicQueue,
    setTimeout(callback){callback();return 0;},
    setInterval(callback){timers.set(++id,callback);return id;},
    clearInterval(timer){timers.delete(timer);},
    ResizeObserver:class { observe() {} }
  });
  const get=name=>elements.get('mq-'+name);
  const click=name=>get(name).click();
  function finish() {
    let steps=0;
    while (!get('next').disabled) { click('next'); assert.ok(++steps<100,'演示必须结束'); }
  }
  function tickToEnd() {
    let steps=0;
    while (timers.size) { [...timers.values()][0](); assert.ok(++steps<100,'自动播放必须结束'); }
  }
  return {get,click,finish,tickToEnd,timers,document};
}

test('两个模式可以逐步到达正确答案，后退会更新画面', () => {
  const lesson=createLesson();
  lesson.finish(); assert.equal(lesson.get('result').textContent,'[3, 3, 5, 5, 6, 7]');
  lesson.click('prev'); assert.equal(lesson.get('next').disabled,false);
  lesson.click('min-tab'); lesson.finish();
  assert.equal(lesson.get('result').textContent,'[-1, -3, -3, -3, 3, 3]');
  assert.equal(lesson.get('min-tab').attrs['aria-selected'], 'true');
  assert.equal(lesson.get('main-panel').attrs['aria-labelledby'],'mq-min-tab');
});

test('播放可暂停、自动结束和重播，切换模式和页面隐藏会暂停', () => {
  const lesson=createLesson();
  lesson.click('play'); assert.equal(lesson.timers.size,1);
  const before=lesson.get('count').textContent;
  [...lesson.timers.values()][0](); assert.notEqual(lesson.get('count').textContent,before);
  lesson.click('play'); assert.equal(lesson.timers.size,0);
  lesson.click('play'); lesson.tickToEnd(); assert.equal(lesson.get('next').disabled,true);
  lesson.click('play'); assert.equal(lesson.timers.size,1);
  lesson.click('min-tab'); assert.equal(lesson.timers.size,0);
  assert.equal(lesson.get('result').textContent,'[]');
  lesson.click('play'); lesson.document.hidden=true;
  lesson.document.handlers.visibilitychange(); assert.equal(lesson.timers.size,0);
});

test('模式按钮支持方向键，窄宽度时节点位置在容器内', () => {
  const lesson=createLesson(250);
  let prevented=false;
  lesson.get('max-tab').handlers.keydown({key:'ArrowRight',preventDefault(){prevented=true;}});
  assert.ok(prevented && lesson.get('min-tab').focused);
  let steps=0;
  while (!lesson.get('next').disabled) {
    lesson.click('next');
    for (const node of lesson.get('queue').children) if (node.className.split(/\s+/).includes('mq-node')) {
      assert.ok(parseFloat(node.style.left)>=0);
      assert.ok(parseFloat(node.style.left)+parseFloat(node.style.width)<=250);
    }
    assert.ok(++steps<100);
  }
});

test('离线网页按顺序加载本地脚本，不依赖聊天页面运行时', () => {
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  assert.ok(html.indexOf('src="algorithm.js"')<html.indexOf('src="app.js"'));
  assert.match(html, /src="app.js" defer/);
  assert.doesNotMatch(html, /window\.openai|cdn\.jsdelivr|<iframe|fetch\(/);
});
