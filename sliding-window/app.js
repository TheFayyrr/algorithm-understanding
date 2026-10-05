(() => {
  const root = document.getElementById('mq-lesson');
  const nums = [1, 3, -1, -3, 5, 3, 6, 7];
  const k = 3;
  const el = id => root.querySelector('#mq-' + id);
  const buildSteps = MonotonicQueue.buildSteps;
  const tracks = { max: buildSteps(nums, k, 'max'), min: buildSteps(nums, k, 'min') };
  let mode = 'max', cursor = 2, timer = null;
  const nodes = new Map();
  const cells = nums.map((value, i) => {
    const cell = document.createElement('div'); cell.className = 'mq-cell';
    const index = document.createElement('span'); index.className = 'mq-index text-small'; index.textContent = i;
    const pointer = document.createElement('span'); pointer.className = 'mq-pointer text-small';
    const number = document.createElement('span'); number.textContent = value;
    cell.append(index, pointer, number); el('array').append(cell);
    return { cell, pointer };
  });
  function pause() {
    if (timer !== null) clearInterval(timer);
    timer = null; el('play').textContent = '播放';
  }
  function draw() {
    const track = tracks[mode], step = track[cursor];
    cells.forEach(({ cell, pointer }, index) => {
      cell.classList.toggle('in-window', index >= step.start && index <= step.i);
      cell.classList.toggle('incoming', index === step.i && step.phase !== 'record');
      pointer.textContent = index === step.i && step.phase !== 'record' ? '↓' : '';
    });
    el('position').textContent = step.i < 0 ? 'i = —' : 'i = ' + step.i;
    el('bounds').textContent = step.i < 0 ? '窗口为空' : '窗口 [' + step.start + ', ' + step.i + ']';
    el('band').style.left = 100 * step.start / nums.length + '%';
    el('band').style.width = step.i < 0 ? '0%' : 100 * (step.i - step.start + 1) / nums.length + '%';
    el('array').setAttribute('aria-label', '数组 ' + nums.join('，') + '；' + el('bounds').textContent);
    const live = new Set(step.queue);
    for (const [id, node] of nodes) if (!live.has(id)) {
      nodes.delete(id); node.classList.add('leaving');
      setTimeout(() => node.remove(), 550);
    }
    el('queue').querySelector('.mq-empty')?.remove();
    const width = Math.min(94, el('queue').clientWidth / k - 4);
    step.queue.forEach((id, position) => {
      let node = nodes.get(id);
      if (!node) {
        node = document.createElement('div'); node.className = 'mq-node';
        const value = document.createElement('span'); value.textContent = nums[id];
        const index = document.createElement('span'); index.className = 'text-small mq-index'; index.textContent = 'i=' + id;
        const end = document.createElement('span'); end.className = 'text-small';
        node.append(value, index, end); nodes.set(id, node); el('queue').append(node);
      }
      node.style.width = width + 'px'; node.style.left = position * (width + 4) + 'px';
      node.classList.toggle('marked', step.marked === id);
      node.children[2].textContent = step.queue.length === 1 ? '头 / 尾' : position === 0 ? '队头' : position === step.queue.length - 1 ? '队尾' : '候选';
    });
    if (!step.queue.length) {
      const empty = document.createElement('div'); empty.className = 'mq-empty'; empty.textContent = '空'; el('queue').append(empty);
    }
    el('queue').setAttribute('aria-label', '从队头到队尾：' + (step.queue.map(id => nums[id]).join('，') || '空'));
    el('detail').textContent = step.detail;
    el('result').textContent = '[' + step.results.join(', ') + ']';
    el('count').textContent = (cursor + 1) + ' / ' + track.length;
    el('prev').disabled = cursor === 0; el('next').disabled = cursor === track.length - 1;
    if (cursor === track.length - 1) pause();
  }
  el('prev').addEventListener('click', () => { pause(); cursor = Math.max(0, cursor - 1); draw(); });
  el('next').addEventListener('click', () => { pause(); cursor = Math.min(tracks[mode].length - 1, cursor + 1); draw(); });
  el('play').addEventListener('click', () => {
    if (timer !== null) { pause(); return; }
    if (cursor === tracks[mode].length - 1) { cursor = 0; draw(); }
    el('play').textContent = '暂停';
    timer = setInterval(() => { cursor++; draw(); }, 1350);
  });
  root.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    pause(); mode = button.dataset.mode; cursor = 2;
    root.querySelectorAll('[data-mode]').forEach(tab => { const selected = tab === button; tab.classList.toggle('active', selected); tab.setAttribute('aria-selected', selected ? 'true' : 'false'); });
    el('main-panel').setAttribute('aria-labelledby', button.id); draw();
  }));
  const modeButtons = [...root.querySelectorAll('[data-mode]')];
  modeButtons.forEach((button, index) => button.addEventListener('keydown', event => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % modeButtons.length;
    else if (event.key === 'ArrowLeft') next = (index + modeButtons.length - 1) % modeButtons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = modeButtons.length - 1;
    else return;
    event.preventDefault(); modeButtons[next].click(); modeButtons[next].focus();
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  new ResizeObserver(draw).observe(el('queue'));
  draw();
})();
