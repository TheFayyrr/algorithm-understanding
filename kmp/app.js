// 动画界面：所有算法状态由 algorithm.js 生成。
(() => {
      const root = document.getElementById('kmp-animated-lesson');
      const query = id => root.querySelector('#' + id);
      const pattern = KMP.DEFAULT_PATTERN;
      const text = KMP.DEFAULT_TEXT;

      const lessons = {
        prefix: KMP.buildPrefixSteps(pattern),
        search: KMP.buildSearchSteps(text, pattern)
      };
      const stageSelect = query('kmp-lesson-stage');
      const previousButton = query('kmp-lesson-prev');
      const playButton = query('kmp-lesson-play');
      const nextButton = query('kmp-lesson-next');
      const topBelt = query('kmp-top-belt');
      const bottomBelt = query('kmp-bottom-belt');
      const topPointer = query('kmp-top-pointer');
      const bottomPointer = query('kmp-bottom-pointer');
      const nextCells = query('kmp-next-cells');
      let stage = 'prefix';
      let cursor = 0;
      let timer = null;
      let playing = false;
      let topSlots = [];
      let bottomSlots = [];
      let arraySlots = [];

      function makeSlot(index, character) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        const indexLabel = document.createElement('span');
        indexLabel.className = 'slot-index text-small tabular-nums';
        indexLabel.textContent = index;
        const characterLabel = document.createElement('span');
        characterLabel.className = 'slot-char tabular-nums';
        characterLabel.textContent = character;
        slot.append(indexLabel, characterLabel);
        slot.setAttribute('aria-label', `下标 ${index}，值 ${character}`);
        return { slot, value: characterLabel, index };
      }

      function mount() {
        const isPrefix = stage === 'prefix';
        const topString = isPrefix ? pattern : text;
        const columns = topString.length;
        topBelt.replaceChildren();
        bottomBelt.replaceChildren();
        nextCells.replaceChildren();
        topBelt.style.width = '100%';
        topBelt.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
        bottomBelt.style.width = `${pattern.length / columns * 100}%`;
        bottomBelt.style.gridTemplateColumns = `repeat(${pattern.length}, minmax(0, 1fr))`;
        topSlots = Array.from(topString, (c, i) => makeSlot(i, c));
        bottomSlots = Array.from(pattern, (c, i) => makeSlot(i, c));
        arraySlots = Array.from(pattern, (_, i) => makeSlot(i, 0));
        topSlots.forEach(cell => topBelt.append(cell.slot));
        bottomSlots.forEach(cell => bottomBelt.append(cell.slot));
        arraySlots.forEach(cell => nextCells.append(cell.slot));
        topPointer.style.width = `${100 / columns}%`;
        bottomPointer.style.width = `${100 / columns}%`;
        query('kmp-top-label').textContent = isPrefix ? '前缀 P · 从左端开始' : '文本 T · i 指向文本';
        query('kmp-bottom-label').textContent = isPrefix ? '后缀 P · 当前这一截的末端' : '模式 P · j 指向模式';
        draw();
      }

      function draw() {
        const state = lessons[stage][cursor];
        const isPrefix = stage === 'prefix';
        const columns = isPrefix ? pattern.length : text.length;
        const isComplete = state.kind === 'complete';
        const comparing = state.kind === 'compare' || state.kind === 'fallback' || state.kind === 'zero';
        const alignedStart = isPrefix ? 0 : state.i - state.j;
        const suffixEnd = state.resolved ? state.i : state.i - 1;
        const suffixStart = suffixEnd - state.j + 1;
        query('kmp-lesson-i').textContent = `i = ${state.i}`;
        query('kmp-lesson-j').textContent = `j = ${state.j}`;
        query('kmp-lesson-progress').textContent = isPrefix ? (isComplete ? 'next 已完成' : `正在求 next[${state.i}]`) : (isComplete ? '匹配完成' : `已匹配 ${state.j} 个字符`);
        query('kmp-top-fragment').textContent = isPrefix ? (pattern.slice(0, state.j) || '空') : (text.slice(alignedStart, state.i) || '空');
        query('kmp-bottom-fragment').textContent = pattern.slice(0, state.j) || '空';
        topPointer.textContent = isPrefix ? 'j ↓' : 'i ↓';
        bottomPointer.textContent = isPrefix ? 'i ↓' : 'j ↓';
        topPointer.hidden = isComplete;
        bottomPointer.hidden = isComplete;
        topPointer.style.left = `${(isPrefix ? state.j : state.i) / columns * 100}%`;
        bottomPointer.style.left = `${state.i / columns * 100}%`;
        bottomBelt.style.left = `${alignedStart / columns * 100}%`;
        topBelt.style.left = '0%';

        topSlots.forEach(cell => {
          const kept = isPrefix ? cell.index < state.j : cell.index >= alignedStart && cell.index < state.i;
          const current = comparing && cell.index === (isPrefix ? state.j : state.i);
          cell.slot.className = 'slot' + (current ? ' is-current' : kept ? ' is-kept' : '') + (isPrefix && cell.index > state.i ? ' is-future' : '');
        });
        bottomSlots.forEach(cell => {
          const kept = isPrefix ? cell.index >= suffixStart && cell.index <= suffixEnd : cell.index < state.j;
          const current = comparing && cell.index === (isPrefix ? state.i : state.j);
          cell.slot.className = 'slot' + (current ? ' is-current' : kept ? ' is-kept' : '') + (isPrefix && cell.index > state.i ? ' is-future' : '');
        });
        arraySlots.forEach(cell => {
          cell.value.textContent = state.next[cell.index];
          cell.slot.setAttribute('aria-label', `next[${cell.index}] = ${state.next[cell.index]}${cell.index >= state.written ? '，尚未计算' : ''}`);
          const reading = state.kind === 'fallback' && cell.index === state.lookup;
          const writing = isPrefix && state.kind === 'write' && cell.index === state.i;
          cell.slot.className = 'slot' + (reading || writing ? ' is-current' : '') + (cell.index >= state.written ? ' is-unwritten' : '');
        });
        query('kmp-next-action').textContent = state.kind === 'fallback' ? `读取下标 ${state.lookup}，得到 ${state.j}` : isPrefix && state.kind === 'write' ? `写入下标 ${state.i}，值为 ${state.j}` : isPrefix ? `${state.written} / ${pattern.length} 已计算` : '预先计算好的数组';
        query('kmp-lesson-detail').textContent = state.detail;
        query('kmp-lesson-count').textContent = `第 ${cursor + 1} / ${lessons[stage].length} 步`;
        previousButton.disabled = cursor === 0;
        nextButton.disabled = cursor === lessons[stage].length - 1;
        playButton.textContent = playing ? '暂停' : cursor === lessons[stage].length - 1 ? '重播' : '播放';
        playButton.setAttribute('aria-pressed', playing ? 'true' : 'false');
        root.dataset.stage = stage;
        root.dataset.kind = state.kind;
        root.dataset.step = cursor;
        root.dataset.i = state.i;
        root.dataset.j = state.j;
      }

      function pause() {
        if (timer !== null) clearTimeout(timer);
        timer = null;
        playing = false;
      }

      function tick() {
        if (!playing) return;
        if (cursor >= lessons[stage].length - 1) {
          pause();
          draw();
          return;
        }
        cursor++;
        if (cursor === lessons[stage].length - 1) pause();
        draw();
        if (playing) timer = setTimeout(tick, 1750);
      }

      previousButton.addEventListener('click', () => {
        pause();
        if (cursor > 0) cursor--;
        draw();
      });
      nextButton.addEventListener('click', () => {
        pause();
        if (cursor < lessons[stage].length - 1) cursor++;
        draw();
      });
      playButton.addEventListener('click', () => {
        if (playing) {
          pause();
        } else {
          if (cursor === lessons[stage].length - 1) cursor = 0;
          playing = true;
          timer = setTimeout(tick, 1750);
        }
        draw();
      });
      stageSelect.addEventListener('change', () => {
        pause();
        stage = stageSelect.value;
        cursor = 0;
        mount();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { pause(); draw(); }
      });
      mount();
    })();
