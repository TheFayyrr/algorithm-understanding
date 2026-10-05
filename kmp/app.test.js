// 使用最小 DOM 检查交互，不引入浏览器依赖；真实样式由浏览器渲染。
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const KMP = require('./algorithm.js');

function createLesson() {
  class Element {
    constructor() {
      this.children = [];
      this.dataset = {};
      this.style = {};
      this.handlers = {};
      this.disabled = false;
      this.hidden = false;
      this.textContent = '';
      this.className = '';
      this.attrs = {};
      this.value = 'prefix';
    }
    setAttribute(key, value) { this.attrs[key] = value; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    addEventListener(name, handler) { this.handlers[name] = handler; }
  }
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
  const elements = new Map(ids.map(id => [id, new Element()]));
  const root = elements.get('kmp-animated-lesson');
  root.querySelector = selector => {
    const element = elements.get(selector.slice(1));
    assert.ok(element, `页面缺少元素 ${selector}`);
    return element;
  };
  const document = {
    hidden: false,
    handlers: {},
    getElementById: id => elements.get(id),
    createElement: () => new Element(),
    addEventListener(name, handler) { this.handlers[name] = handler; }
  };
  const timers = new Map();
  let timerId = 0;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    KMP, document,
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); }
  });
  const get = id => elements.get(id);
  const click = id => get(id).handlers.click();
  function finishBySteps() {
    let steps = 0;
    while (!get('kmp-lesson-next').disabled) {
      click('kmp-lesson-next');
      assert.ok(++steps < 100, '动画应当结束');
    }
  }
  return { root, document, timers, get, click, finishBySteps };
}

test('播放可暂停，重播会结束；前缀表在界面中正确写入', () => {
  const lesson = createLesson();
  lesson.click('kmp-lesson-play');
  assert.equal(lesson.timers.size, 1);
  lesson.click('kmp-lesson-play');
  assert.equal(lesson.timers.size, 0);
  lesson.finishBySteps();
  const values = lesson.get('kmp-next-cells').children.map(cell => Number(cell.children[1].textContent));
  assert.deepEqual(values, [0, 1, 0, 1, 2, 0]);
  lesson.click('kmp-lesson-play');
  let ticks = 0;
  while (lesson.timers.size) {
    const [id, callback] = lesson.timers.entries().next().value;
    lesson.timers.delete(id);
    callback();
    assert.ok(++ticks < 100, '自动播放不能无限循环');
  }
  assert.equal(lesson.root.dataset.kind, 'complete');
  assert.equal(lesson.get('kmp-lesson-play').textContent, '重播');
});

test('切换阶段会暂停，搜索回退保持文本指针并移动模式串', () => {
  const lesson = createLesson();
  lesson.click('kmp-lesson-play');
  lesson.get('kmp-lesson-stage').value = 'search';
  lesson.get('kmp-lesson-stage').handlers.change();
  assert.equal(lesson.timers.size, 0);
  assert.equal(lesson.root.dataset.step, 0);
  while (lesson.root.dataset.kind !== 'fallback') lesson.click('kmp-lesson-next');
  assert.deepEqual([lesson.root.dataset.i, lesson.root.dataset.j], [5, 2]);
  assert.equal(lesson.get('kmp-top-pointer').style.left, `${5 / 9 * 100}%`);
  assert.equal(lesson.get('kmp-bottom-belt').style.left, `${3 / 9 * 100}%`);
  lesson.finishBySteps();
  assert.match(lesson.get('kmp-lesson-detail').textContent, /起始下标为 3/);
});
