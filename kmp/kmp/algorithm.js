/*
 * KMP 算法与动画状态。采用不减一的前缀表：next[i] 是最长相等前后缀长度。
 * 同一份文件可在浏览器和 Node.js 中使用，不依赖界面或第三方库。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KMP = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_PATTERN = 'aabaaf';
  const DEFAULT_TEXT = 'aabaabaaf';

  function getNext(pattern) {
    const next = Array(pattern.length).fill(0);
    let j = 0;
    for (let i = 1; i < pattern.length; i++) {
      while (j > 0 && pattern[i] !== pattern[j]) j = next[j - 1];
      if (pattern[i] === pattern[j]) j++;
      next[i] = j;
    }
    return next;
  }

  function findFirst(text, pattern) {
    if (pattern.length === 0) return 0;
    const next = getNext(pattern);
    let i = 0;
    let j = 0;
    while (i < text.length) {
      while (j > 0 && text[i] !== pattern[j]) j = next[j - 1];
      if (text[i] === pattern[j]) j++;
      i++;
      if (j === pattern.length) return i - j;
    }
    return -1;
  }

  function buildPrefixSteps(pattern) {
    if (!pattern.length) {
      return [{ kind: 'complete', i: 0, j: 0, resolved: true,
        next: [], written: 0, detail: '空模式串的 next 数组为空。' }];
    }
    const next = Array(pattern.length).fill(0);
    const steps = [];
    let j = 0;
    let written = 1;
    const push = (kind, i, resolved, detail, extra = {}) => {
      steps.push({ kind, i, j, resolved, detail, next: next.slice(), written, ...extra });
    };
    push('init', pattern.length > 1 ? 1 : 0, false,
      '初始化：next 全为 0；j = 0，i 从 1 开始。');
    for (let i = 1; i < pattern.length; i++) {
      while (true) {
        const same = pattern[i] === pattern[j];
        push('compare', i, false,
          `比较 P[${i}] 的 ${pattern[i]} 与 P[${j}] 的 ${pattern[j]}：${same ? '相同 =' : '不同 ≠'}`, { same });
        if (same) {
          j++;
          push('extend', i, true, `相同：前缀和后缀都延长 1 个字符，j 变成 ${j}。`);
          break;
        }
        if (j === 0) {
          push('zero', i, true, 'j 已经是 0，字符仍不同；相等前后缀长度为 0。');
          break;
        }
        const oldJ = j;
        const lookup = j - 1;
        j = next[lookup];
        push('fallback', i, false,
          `i 保持 ${i}；读取 next[${lookup}] = ${j}，j 从 ${oldJ} 回退到 ${j}。`, { lookup, oldJ });
      }
      next[i] = j;
      written = i + 1;
      push('write', i, true,
        `写入 next[${i}] = ${j}；当前最长相等前后缀是 ${j ? pattern.slice(0, j) : '空'}。`);
    }
    push('complete', pattern.length - 1, true, 'next 数组生成完成。');
    return steps;
  }

  function buildSearchSteps(text, pattern) {
    const next = getNext(pattern);
    const steps = [];
    let i = 0;
    let j = 0;
    const push = (kind, detail, extra = {}) => {
      steps.push({ kind, i, j, detail, next: next.slice(), written: pattern.length, ...extra });
    };
    if (!pattern.length) {
      push('complete', '空模式串在下标 0 处匹配。', { result: 0 });
      return steps;
    }
    push('init', '开始匹配：i 指向文本，j 指向模式；已有匹配长度为 0。');
    while (i < text.length) {
      const same = text[i] === pattern[j];
      push('compare',
        `比较 T[${i}] 的 ${text[i]} 与 P[${j}] 的 ${pattern[j]}：${same ? '相同 =' : '不同 ≠'}`, { same });
      if (!same && j > 0) {
        const oldJ = j;
        const lookup = j - 1;
        j = next[lookup];
        push('fallback',
          `i 保持 ${i}；读取 next[${lookup}] = ${j}，保留 ${j} 个已匹配字符。`, { oldJ, lookup });
        continue;
      }
      if (same) j++;
      i++;
      if (j === pattern.length) {
        push('complete', `整个模式串匹配成功；起始下标为 ${i - j}（从 0 开始）。`, { result: i - j });
        return steps;
      }
      push('advance', same ? `相同：i、j 各前进 1；已有匹配长度为 ${j}。`
        : 'j = 0 且字符不同：i 前进 1，j 保持 0。');
    }
    push('complete', '文本扫描完毕，没有找到模式串。', { result: -1 });
    return steps;
  }

  return { DEFAULT_PATTERN, DEFAULT_TEXT, getNext, findFirst, buildPrefixSteps, buildSearchSteps };
});
