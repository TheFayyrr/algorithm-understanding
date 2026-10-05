const test = require('node:test');
const assert = require('node:assert/strict');
const { slidingWindow, buildSteps } = require('./algorithm.js');

function brute(values, k, mode) {
  const output = [];
  for (let left = 0; left + k <= values.length; ++left) {
    let best = values[left];
    for (let i = left + 1; i < left + k; ++i) {
      best = mode === 'max' ? Math.max(best, values[i]) : Math.min(best, values[i]);
    }
    output.push(best);
  }
  return output;
}

function check(values, k, mode) {
  const expected = brute(values, k, mode);
  assert.deepEqual(slidingWindow(values, k, mode), expected);
  const steps = buildSteps(values, k, mode);
  assert.deepEqual(steps.at(-1).results, expected);
  const records = steps.filter(s => s.phase === 'record');
  assert.equal(records.length, values.length - k + 1);
  records.forEach((step, i) => assert.equal(step.results.at(-1), expected[i]));
  for (const step of steps) {
    if (step.phase !== 'push' && step.phase !== 'record') continue;
    assert.ok(step.queue.length <= k);
    assert.ok(step.queue.every(i => i >= step.start && i <= step.i));
    for (let j = 1; j < step.queue.length; ++j) {
      assert.ok(step.queue[j - 1] < step.queue[j], '候选保留原出现顺序');
      const a = values[step.queue[j - 1]], b = values[step.queue[j]];
      assert.ok(mode === 'max' ? a >= b : a <= b, '候选数值保持单调');
    }
  }
}

test('示例、重复值、负数、k=1、k=n 与单调输入', () => {
  for (const values of [[1,3,-1,-3,5,3,6,7],[5,5,1],[5,5,5,5],[-7,-2,-5],[-2],[-3,-2,-1,0,1],[5,4,3,2,1]]) {
    for (let k = 1; k <= values.length; ++k) {
      check(values, k, 'max'); check(values, k, 'min');
    }
  }
  const duplicateWindow = buildSteps([5,5,1], 2).find(s => s.phase === 'record');
  assert.deepEqual(duplicateWindow.queue, [0,1], '按数值出队的动画保留两个相同候选');
});

test('固定种子的 3360 组模式／窗口结果与独立暴力方法一致', () => {
  let seed = 239;
  const random = () => { seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed; };
  let checked = 0;
  for (let n = 1; n <= 20; ++n) for (let k = 1; k <= n; ++k) for (let repeat = 0; repeat < 8; ++repeat) {
    const values = Array.from({length:n}, () => (random() % 11) - 5);
    for (const mode of ['max','min']) { check(values,k,mode); ++checked; }
  }
  assert.equal(checked,3360);
});

test('拒绝非法窗口、非法模式和非数值，计算不修改输入', () => {
  for (const k of [0,-1,4,1.5]) assert.throws(() => slidingWindow([1,2,3],k), RangeError);
  assert.throws(() => buildSteps([],1), RangeError);
  assert.throws(() => slidingWindow([1],1,'other'), RangeError);
  for (const input of [[NaN],[Infinity],[undefined],new Array(1),'1']) {
    assert.throws(() => slidingWindow(input,1), TypeError);
  }
  const original = Object.freeze([3,1,2]);
  check(original,2,'max');
});
