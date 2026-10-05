// 算法与教学状态独立于 DOM，浏览器和 Node.js 都可以使用。
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MonotonicQueue = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function validate(values, k, mode) {
    if (!Array.isArray(values)) {
      throw new TypeError('values 必须为有限数值数组');
    }
    for (const value of values) {
      if (!Number.isFinite(value)) throw new TypeError('values 必须为有限数值数组');
    }
    if (!Number.isInteger(k) || k < 1 || k > values.length) {
      throw new RangeError('要求 1 <= k <= values.length');
    }
    if (mode !== 'max' && mode !== 'min') throw new RangeError('mode 必须为 max 或 min');
  }

  function dominates(current, old, mode) {
    return mode === 'max' ? current > old : current < old;
  }

  // 固定容量的下标队列，避免 Array.shift 的线性搬移开销。
  // 每个下标最多入队、出队一次：O(n) 时间，O(k) 候选空间。
  function slidingWindow(values, k, mode = 'max') {
    validate(values, k, mode);
    const queue = new Array(k), results = [];
    let head = 0, count = 0;
    for (let i = 0; i < values.length; ++i) {
      while (count && queue[head] <= i - k) {
        head = (head + 1) % k;
        --count;
      }
      while (count && dominates(values[i], values[queue[(head + count - 1) % k]], mode)) --count;
      queue[(head + count) % k] = i;
      ++count;
      if (i >= k - 1) results.push(values[queue[head]]);
    }
    return results;
  }

  // 保留原动画中的逐步比较、淘汰、入队、记录。
  // queue 中的下标只用于显示身份，移出条件模拟题解按数值判断的写法。
  // 快照用于教学回看，其开销不代表计算函数的空间复杂度。
  function buildSteps(values, windowSize, mode = 'max') {
    validate(values, windowSize, mode);
    const queue = [], results = [], steps = [];
    let i = -1;
    const save = (detail, marked = null, phase = '') => steps.push({
      i, start: Math.max(0, i - windowSize + 1), queue: [...queue], results: [...results], detail, marked, phase
    });
    save('初始：候选队列为空。');
    for (i = 0; i < values.length; i++) {
      save('读入 nums[' + i + '] = ' + values[i] + '。', null, 'incoming');
      if (i >= windowSize) {
        const expired = i - windowSize;
        if (queue.length && values[queue[0]] === values[expired]) {
          save('移出值 ' + values[expired] + ' = 队头：pop_front()。', queue[0], 'expire');
          queue.shift();
          save('队头已移除：它离开了窗口。', null, 'expired');
        } else {
          save('移出值 ' + values[expired] + '：它已不在候选队列。', null, 'expired');
        }
      }
      while (queue.length && dominates(values[i], values[queue[queue.length - 1]], mode)) {
        const last = queue[queue.length - 1];
        save('比较：' + values[i] + (mode === 'max' ? ' > ' : ' < ') + values[last] + '；淘汰队尾。', last, 'compare');
        queue.pop();
        save('pop_back()：移除 ' + values[last] + '。', null, 'prune');
      }
      queue.push(i);
      save('push_back(' + values[i] + ')：新值进入队尾。', null, 'push');
      if (i >= windowSize - 1) {
        results.push(values[queue[0]]);
        save('front() = ' + values[queue[0]] + '；记录当前窗口的' + (mode === 'max' ? '最大' : '最小') + '值。', queue[0], 'record');
      }
    }
    return steps;
  }

  return { slidingWindow, buildSteps };
});
