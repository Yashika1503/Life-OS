// utility for storage
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
function load(key, def) {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
}

// dark mode
const themeToggle = document.getElementById('dark-mode-toggle');
function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    save('theme', theme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
});
applyTheme(load('theme', 'light'));

// navigation sidebar
const sidebar = document.getElementById('sidebar');
const sidebarButtons = sidebar.querySelectorAll('button[data-target]');
const sections = document.querySelectorAll('main section');

function showSection(id) {
    sections.forEach(sec => {
        sec.classList.toggle('visible', sec.id === id);
    });
}

sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        showSection(btn.dataset.target);
    });
});

// collapse toggle
const collapseToggle = document.getElementById('collapse-toggle');
function applyCollapse(state) {
    if (state) sidebar.classList.add('collapsed');
    else sidebar.classList.remove('collapsed');
    save('sidebarCollapsed', state);
}

collapseToggle.addEventListener('click', () => {
    const collapsed = sidebar.classList.contains('collapsed');
    applyCollapse(!collapsed);
});

applyCollapse(load('sidebarCollapsed', false));

// show initial section if desired
// showSection('todo-section');

// to-do list
const todoListEl = document.getElementById('todo-list');
const newTaskEl = document.getElementById('new-task');
const newCategoryEl = document.getElementById('new-category');
const addTaskBtn = document.getElementById('add-task');
let todos = load('todos', []);
let currentFilter = 'all';

function renderTodos() {
    const filter = document.getElementById('filter-category').value;
    todoListEl.innerHTML = '';
    todos.forEach((t, index) => {
        if (filter !== 'all' && t.category !== filter) return;
        const li = document.createElement('li');
        li.className = 'todo-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = t.done;
        checkbox.addEventListener('change', () => {
            t.done = checkbox.checked;
            save('todos', todos);
        });

        const text = document.createElement('span');
        text.textContent = t.text;
        if (t.done) text.style.textDecoration = 'line-through';
        checkbox.addEventListener('change', () => {
            text.style.textDecoration = checkbox.checked ? 'line-through' : '';
        });

        const category = document.createElement('span');
        category.className = 'category-chip ' + t.category; // add category-specific class
        category.textContent = t.category;

        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.textContent = '×';
        del.addEventListener('click', () => {
            todos.splice(index, 1);
            save('todos', todos);
            renderTodos();
        });

        li.appendChild(checkbox);
        li.appendChild(text);
        li.appendChild(category);
        li.appendChild(del);
        li.classList.add(t.category); // style border by category
        todoListEl.appendChild(li);
    });
}

addTaskBtn.addEventListener('click', () => {
    const text = newTaskEl.value.trim();
    const category = newCategoryEl.value;
    if (!text) return;
    todos.push({ text, category, done: false });
    save('todos', todos);
    renderTodos();
    newTaskEl.value = '';
});

const filterSelect = document.getElementById('filter-category');
filterSelect.addEventListener('change', () => {
    updateFilterColor();
    renderTodos();
});

function updateFilterColor() {
    const value = filterSelect.value;
    filterSelect.className = '';
    filterSelect.classList.add('filter-' + value);
}

// initialize filter color on load
updateFilterColor();

renderTodos();

// text editor
const editor = document.getElementById('editor');
const AUTOSAVE_INTERVAL = 2000;

function saveEditor() {
    save('notes', editor.innerHTML);
}

editor.addEventListener('input', () => {
    saveEditor();
});

setInterval(saveEditor, AUTOSAVE_INTERVAL);
editor.innerHTML = load('notes', '');

// habit tracker
const habitListEl = document.getElementById('habit-list');
const newHabitEl = document.getElementById('new-habit');
const addHabitBtn = document.getElementById('add-habit');
let habits = load('habits', []);

function renderHabits() {
    habitListEl.innerHTML = '';
    habits.forEach((h, idx) => {
        const li = document.createElement('li');
        li.className = 'habit-item';

        const name = document.createElement('span');
        name.textContent = h.name;

        const controls = document.createElement('div');
        const check = document.createElement('button');
        check.textContent = '✔';
        check.addEventListener('click', () => {
            const today = new Date().toDateString();
            if (h.last === today) return; // already done
            if (h.last === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()) {
                h.streak++;
            } else {
                h.streak = 1;
            }
            h.last = today;
            save('habits', habits);
            renderHabits();
        });
        controls.appendChild(check);

        const streak = document.createElement('span');
        streak.textContent = `Streak: ${h.streak}`;
        controls.appendChild(streak);

        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        const inner = document.createElement('div');
        const percent = Math.min(h.streak / 30 * 100, 100);
        inner.style.width = percent + '%';
        bar.appendChild(inner);
        controls.appendChild(bar);

        li.appendChild(name);
        li.appendChild(controls);
        habitListEl.appendChild(li);
    });
}

addHabitBtn.addEventListener('click', () => {
    const text = newHabitEl.value.trim();
    if (!text) return;
    habits.push({ name: text, streak: 0, last: null });
    save('habits', habits);
    renderHabits();
    newHabitEl.value = '';
});

renderHabits();
