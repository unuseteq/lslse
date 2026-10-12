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
function renderEditor() {
  const b = state.activeBoard;
  app.innerHTML = `<div class="editor"><header class="editor-bar"><button class="btn btn-ghost" id="back">← Доски</button><h2>${esc(b.title)}</h2><span style="color:var(--accent-2);font-size:12px">● синхронизировано</span><button class="btn btn-primary" id="share">Поделиться</button></header><div class="toolbar"><button class="tool" data-tool="text">T Текст</button><button class="tool" data-tool="image">▧ Изображение</button><button class="tool" data-tool="rect">▭ Прямоугольник</button><button class="tool" data-tool="circle">○ Круг</button><button class="tool" data-tool="line">╱ Линия</button><button class="tool" id="clear">Очистить</button></div><div class="canvas-wrap"><div class="canvas" id="canvas"><div class="canvas-grid"></div>${b.objects.map((o,i) => objectMarkup(o,i)).join('')}</div></div></div>`;
  document.querySelector('#back').onclick = () => { state.activeBoard = null; save(); render(); };
  document.querySelector('#share').onclick = () => toast('Ссылка на доску скопирована');
  document.querySelector('#clear').onclick = () => { if(confirm('Удалить все объекты с доски?')) { b.objects = []; save(); render(); } };
  document.querySelectorAll('[data-tool]').forEach(btn => btn.onclick = () => addObject(btn.dataset.tool));
  enableDragging();
}
function objectMarkup(o, i) { const style = `left:${o.x}px;top:${o.y}px;width:${o.w || ''}px;height:${o.h || ''}px;transform:rotate(${o.rotate || 0}deg)`; if(o.type==='image') return `<div class="object object-image" data-index="${i}" style="${style}"><img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80" alt="Игровой пейзаж"></div>`; return `<div class="object object-${o.type}" data-index="${i}" style="${style}">${o.type==='text' ? esc(o.text) : ''}</div>`; }
function addObject(type) { const b = state.activeBoard; const base = { type, x: 650 + Math.round(Math.random()*100), y: 350 + Math.round(Math.random()*80), w: type==='circle' ? 120 : type==='line' ? 150 : type==='text' ? 190 : 150, h: type==='line' ? 4 : type==='text' ? 55 : 120, rotate: 0 }; if(type==='text') base.text = 'Новая идея'; b.objects.push(base); save(); renderEditor(); toast('Объект добавлен'); }
function enableDragging() { document.querySelectorAll('.object').forEach(el => { el.onpointerdown = e => { const i = Number(el.dataset.index), o = state.activeBoard.objects[i]; const startX = e.clientX, startY = e.clientY, ox = o.x, oy = o.y; el.setPointerCapture(e.pointerId); const move = ev => { o.x = Math.max(0, Math.min(1600 - (o.w || 40), ox + ev.clientX - startX)); o.y = Math.max(0, Math.min(900 - (o.h || 30), oy + ev.clientY - startY)); el.style.left = `${o.x}px`; el.style.top = `${o.y}px`; }; const up = () => { el.releasePointerCapture(e.pointerId); save(); document.removeEventListener('pointermove',move); document.removeEventListener('pointerup',up); }; document.addEventListener('pointermove',move); document.addEventListener('pointerup',up); }; }); }
function toast(message) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = message; document.body.append(el); setTimeout(() => el.remove(), 2200); }
window.onhashchange = () => { state.route = location.hash.slice(1) || 'boards'; render(); };
render();
