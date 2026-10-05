const test = require('node:test');
const assert = require('node:assert/strict');
const KMP = require('./algorithm.js');

function stringsUpTo(maxLength) {
  const result = [''];
  let level = [''];
  for (let length = 1; length <= maxLength; length++) {
    level = level.flatMap(prefix => ['a', 'b'].map(c => prefix + c));
    result.push(...level);
  }
  return result;
}

// 独立枚举每一截的真前缀和真后缀，不使用 KMP 回退规则。
function bruteNext(pattern) {
  return Array.from(pattern, (_, i) => {
    const part = pattern.slice(0, i + 1);
    for (let length = part.length - 1; length > 0; length--) {
      if (part.slice(0, length) === part.slice(-length)) return length;
    }
    return 0;
  });
}

test('前缀表与独立的前后缀枚举一致', () => {
  for (const pattern of [...stringsUpTo(6), 'aabaaf', 'ababaca', 'aaaaaf']) {
    assert.deepEqual(KMP.getNext(pattern), bruteNext(pattern), pattern);
  }
});

test('首次匹配位置与原生字符串查找一致，覆盖空串与多次失配', () => {
  for (const text of stringsUpTo(5)) {
    for (const pattern of stringsUpTo(4)) {
      assert.equal(KMP.findFirst(text, pattern), text.indexOf(pattern), `${text} / ${pattern}`);
    }
  }
  for (const [text, pattern] of [
    ['aabaabaaf', 'aabaaf'], ['aabaabaafa', 'aabaaf'],
    ['ababababac', 'ababac'], ['aaaaab', 'aaaac'], ['hello', 'll']
  ]) assert.equal(KMP.findFirst(text, pattern), text.indexOf(pattern));
});

test('aabaaf 的动画正确展示连续回退和最终前缀表', () => {
  const steps = KMP.buildPrefixSteps('aabaaf');
  assert.deepEqual(steps.at(-1).next, [0, 1, 0, 1, 2, 0]);
  const fallback = steps.filter(s => s.i === 5 && s.kind === 'fallback');
  assert.deepEqual(fallback.map(s => [s.i, s.oldJ, s.lookup, s.j]),
    [[5, 2, 1, 1], [5, 1, 0, 0]]);
  // 每次写入的值独立检查，不能仅检查最终数组。
  for (const step of steps.filter(s => s.kind === 'write')) {
    assert.equal(step.j, bruteNext('aabaaf'.slice(0, step.i + 1)).at(-1));
  }
});

test('匹配动画的失配回退保留 i，最终位置与实际搜索一致', () => {
  const steps = KMP.buildSearchSteps('aabaabaaf', 'aabaaf');
  const fallback = steps.find(s => s.kind === 'fallback');
  assert.deepEqual([fallback.i, fallback.oldJ, fallback.lookup, fallback.j], [5, 5, 4, 2]);
  assert.deepEqual([steps.at(-1).i, steps.at(-1).j, steps.at(-1).result], [9, 6, 3]);
  for (const [text, pattern] of [['', ''], ['', 'a'], ['abc', ''], ['abc', 'xy']]) {
    assert.equal(KMP.buildSearchSteps(text, pattern).at(-1).result, text.indexOf(pattern));
  }
});
