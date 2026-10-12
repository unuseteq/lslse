const state = {
  user: JSON.parse(localStorage.getItem('bg_user') || 'null'),
  boards: JSON.parse(localStorage.getItem('bg_boards') || 'null') || [
    { id: 1, title: 'Идеи для нового проекта', color: '', updated: 'Сегодня', objects: [] },
    { id: 2, title: 'Комната стрима', color: 'mint', updated: 'Вчера', objects: [] },
    { id: 3, title: 'План турнира', color: 'orange', updated: '12 окт.', objects: [] }
  ],
  route: location.hash.slice(1) || 'boards',
  activeBoard: null,
  selected: null,
  tool: null
};
const app = document.querySelector('#app');
const save = () => { localStorage.setItem('bg_boards', JSON.stringify(state.boards)); localStorage.setItem('bg_user', JSON.stringify(state.user)); };
const esc = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
function render() { state.user ? renderApp() : renderAuth(); }
function renderAuth() {
  const register = state.route === 'register';
  app.innerHTML = `<main class="auth"><section class="auth-card"><div class="brand"><span class="brand-mark">✦</span> BestGames</div><h1>${register ? 'Создайте аккаунт' : 'С возвращением'}</h1><p class="subtitle">${register ? 'Начните собирать идеи вместе с командой' : 'Войдите, чтобы продолжить работу'}</p><form id="auth-form" novalidate><div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" required autocomplete="email" placeholder="you@example.com"></div>${register ? '<div class="field"><label for="name">Имя</label><input id="name" name="name" required autocomplete="name" placeholder="Ваше имя"></div>' : ''}<div class="field"><label for="password">Пароль</label><input id="password" name="password" type="password" required autocomplete="${register ? 'new-password' : 'current-password'}" placeholder="${register ? 'Не менее 8 символов, цифра и спецсимвол' : 'Введите пароль'}"></div><div class="error" id="form-error" role="alert"></div><button class="btn btn-primary" style="width:100%" type="submit">${register ? 'Зарегистрироваться' : 'Войти'}</button></form><p class="auth-switch">${register ? 'Уже есть аккаунт?' : 'Нет аккаунта?'} <span class="link" data-route="${register ? 'login' : 'register'}">${register ? 'Войти' : 'Создать аккаунт'}</span></p></section></main>`;
  document.querySelector('[data-route]').onclick = e => { state.route = e.target.dataset.route; render(); };
  document.querySelector('#auth-form').onsubmit = e => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');
    const name = String(form.get('name') || '').trim();
    const error = document.querySelector('#form-error');
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailIsValid) {
      error.textContent = 'Введите корректный адрес электронной почты.';
      return;
    }
    if (register && !name) {
      error.textContent = 'Укажите имя.';
      return;
    }
    if (register && !/^[A-Za-z]+$/.test(name)) {
      error.textContent = 'Имя должно быть написано латиницей.';
      return;
    }
    if (register && password.length < 8) {
      error.textContent = 'Пароль должен содержать не менее 8 символов.';
      return;
    }
    if (register && !/\d/.test(password)) {
      error.textContent = 'Добавьте в пароль хотя бы одну цифру.';
      return;
    }
    if (register && !/[^A-Za-z0-9]/.test(password)) {
      error.textContent = 'Добавьте в пароль хотя бы один спецсимвол.';
      return;
    }

    state.user = { email, name: register ? name : (state.user?.name || email.split('@')[0]) };
    state.route = 'boards';
    save();
    render();
  };
}
function renderApp() { state.activeBoard ? renderEditor() : renderBoards(); }
function renderBoards() {
  app.innerHTML = `<div class="shell"><header class="topbar"><div class="brand"><span class="brand-mark">✦</span> BestGames</div><div class="userbar"><span>${esc(state.user.name)} · ${esc(state.user.email)}</span><div class="avatar">${esc(state.user.name[0].toUpperCase())}</div><button class="btn btn-ghost" id="logout">Выйти</button></div></header><div class="layout"><aside class="sidebar"><h2>Рабочее пространство</h2><button class="nav-item active">▦ Все доски</button><button class="nav-item" id="new-board-nav">＋ Новая доска</button></aside><main class="content"><div class="heading"><div><h1>Ваши доски</h1><p class="subtitle">Создавайте идеи и обсуждайте их вместе</p></div><button class="btn btn-primary" id="new-board">＋ Создать доску</button></div><div class="board-grid">${state.boards.map(b => `<article class="board-card" data-id="${b.id}"><div class="board-cover ${b.color}"><h3>${esc(b.title)}</h3></div><div class="board-info"><div class="board-meta"><span>${b.objects.length} объектов</span><span>${b.updated}</span></div></div></article>`).join('')}</div></main></div></div>`;
  document.querySelector('#logout').onclick = () => { state.user = null; save(); render(); };
  const create = () => { const title = prompt('Название новой доски'); if (!title?.trim()) return; const board = { id: Date.now(), title: title.trim(), color: '', updated: 'Только что', objects: [] }; state.boards.unshift(board); save(); render(); };
  document.querySelector('#new-board').onclick = create; document.querySelector('#new-board-nav').onclick = create;
  document.querySelectorAll('.board-card').forEach(card => card.onclick = () => { state.activeBoard = state.boards.find(b => b.id === Number(card.dataset.id)); render(); });
}
function addObject(type) { const b = state.activeBoard; const base = { type, x: 650 + Math.round(Math.random()*100), y: 350 + Math.round(Math.random()*80), w: type==='circle' ? 120 : type==='line' ? 150 : type==='text' ? 190 : 150, h: type==='line' ? 4 : type==='text' ? 55 : 120, rotate: 0 }; if(type==='text') base.text = 'Новая идея'; b.objects.push(base); state.selected = b.objects.length - 1; save(); renderEditor(); document.querySelector('[data-text]')?.focus(); toast('Объект добавлен'); }
function renderEditor() {
  const board = state.activeBoard;
  const selected = state.selected === null ? null : board.objects[state.selected];
  app.innerHTML = `<div class="editor"><header class="editor-bar"><button class="btn btn-ghost" id="back">← Доски</button><h2>${esc(board.title)}</h2><span style="color:var(--accent-2);font-size:12px">● синхронизировано</span><button class="btn btn-primary" id="share">Поделиться</button></header><div class="toolbar"><button class="tool" data-tool="text">T Текст</button><button class="tool" data-tool="image">▧ Изображение</button><button class="tool" data-tool="rect">▭ Прямоугольник</button><button class="tool" data-tool="circle">○ Круг</button><button class="tool" data-tool="line">╱ Линия</button><button class="tool" id="clear">Очистить</button><div class="object-controls" ${selected ? '' : 'hidden'}>${selected?.type === 'text' ? `<label class="object-text-control">Текст <input data-text type="text" value="${esc(selected.text || '')}" placeholder="Введите текст"></label>` : ''}<label>Ширина <input data-size="w" type="number" min="40" max="1600" value="${selected?.w || 150}"> px</label><label>Высота <input data-size="h" type="number" min="30" max="900" value="${selected?.h || 120}"> px</label><label>Вращение <input data-size="rotate" type="number" min="-360" max="360" value="${selected?.rotate || 0}"> °</label></div></div><div class="canvas-wrap"><div class="canvas" id="canvas"><div class="canvas-grid"></div>${board.objects.map((object, index) => objectMarkup(object, index)).join('')}</div></div></div>`;
  document.querySelector('#back').onclick = () => { state.activeBoard = null; state.selected = null; save(); render(); };
  document.querySelector('#share').onclick = () => toast('Ссылка на доску скопирована');
  document.querySelector('#clear').onclick = () => { if (confirm('Удалить все объекты с доски?')) { board.objects = []; state.selected = null; save(); renderEditor(); } };
  document.querySelectorAll('[data-tool]').forEach(button => button.onclick = () => addObject(button.dataset.tool));
  const textInput = document.querySelector('[data-text]');
  if (textInput) textInput.oninput = () => { selected.text = textInput.value; const textObject = document.querySelector(`.object[data-index="${state.selected}"]`); if (textObject) textObject.firstChild.textContent = textInput.value; save(); };
  document.querySelectorAll('[data-size]').forEach(input => input.onchange = () => {
    if (state.selected === null) return;
    const object = board.objects[state.selected];
    const property = input.dataset.size;
    const [min, max] = property === 'w' ? [40, 1600] : property === 'h' ? [30, 900] : [-360, 360];
    object[property] = Math.max(min, Math.min(max, Number(input.value) || 0));
    input.value = object[property];
    updateObjectElement(state.selected);
    save();
  });
  document.querySelector('#canvas').onpointerdown = event => {
    if (event.target.id === 'canvas' || event.target.classList.contains('canvas-grid')) {
      state.selected = null;
      renderEditor();
    }
  };
  enableDragging();
}
function objectMarkup(object, index) {
  const style = `left:${object.x}px;top:${object.y}px;width:${object.w || ''}px;height:${object.h || ''}px;transform:rotate(${object.rotate || 0}deg)`;
  const content = object.type === 'image' ? '<img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80" alt="Игровой пейзаж">' : (object.type === 'text' ? esc(object.text) : '');
  const selected = state.selected === index;
  const handles = selected ? '<button class="object-handle object-handle-rotate" data-handle="rotate" aria-label="Вращать объект" title="Потяните, чтобы вращать"></button><button class="object-handle object-handle-resize" data-handle="resize" aria-label="Изменить размер объекта" title="Потяните, чтобы изменить размер"></button>' : '';
  return `<div class="object object-${object.type}${selected ? ' selected' : ''}" data-index="${index}" style="${style}">${content}${handles}</div>`;
}
function updateObjectElement(index) {
  const object = state.activeBoard.objects[index];
  const element = document.querySelector(`.object[data-index="${index}"]`);
  if (!element) return;
  element.style.width = `${object.w}px`;
  element.style.height = `${object.h}px`;
  element.style.transform = `rotate(${object.rotate || 0}deg)`;
}
function enableDragging() {
  document.querySelectorAll('.object').forEach(element => {
    element.onpointerdown = event => {
      event.stopPropagation();
      const index = Number(element.dataset.index);
      const object = state.activeBoard.objects[index];
      const handle = event.target.dataset.handle;
      if (state.selected !== index) {
        state.selected = index;
        renderEditor();
        return;
      }
      if (handle === 'rotate' || handle === 'resize') {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const startX = event.clientX;
        const startY = event.clientY;
        const startAngle = Math.atan2(startY - centerY, startX - centerX) * 180 / Math.PI;
        const startRotation = object.rotate || 0;
        const startWidth = object.w;
        const startHeight = object.h;
        const moveHandle = moveEvent => {
          if (handle === 'rotate') {
            const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * 180 / Math.PI;
            object.rotate = Math.round(startRotation + angle - startAngle);
            const input = document.querySelector('[data-size="rotate"]');
            if (input) input.value = object.rotate;
          } else {
            object.w = Math.max(40, Math.min(1600, startWidth + moveEvent.clientX - startX));
            object.h = Math.max(30, Math.min(900, startHeight + moveEvent.clientY - startY));
            document.querySelector('[data-size="w"]').value = Math.round(object.w);
            document.querySelector('[data-size="h"]').value = Math.round(object.h);
          }
          updateObjectElement(index);
        };
        const stopHandle = () => {
          save();
          document.removeEventListener('pointermove', moveHandle);
          document.removeEventListener('pointerup', stopHandle);
        };
        document.addEventListener('pointermove', moveHandle);
        document.addEventListener('pointerup', stopHandle, { once: true });
        return;
      }
      const startX = event.clientX;
      const startY = event.clientY;
      const originX = object.x;
      const originY = object.y;
      const move = moveEvent => {
        object.x = Math.max(0, Math.min(1600 - (object.w || 40), originX + moveEvent.clientX - startX));
        object.y = Math.max(0, Math.min(900 - (object.h || 30), originY + moveEvent.clientY - startY));
        element.style.left = `${object.x}px`;
        element.style.top = `${object.y}px`;
      };
      const stop = () => {
        save();
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', stop);
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', stop, { once: true });
    };
  });
}
function toast(message) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = message; document.body.append(el); setTimeout(() => el.remove(), 2200); }
window.onhashchange = () => { state.route = location.hash.slice(1) || 'boards'; render(); };
render();
