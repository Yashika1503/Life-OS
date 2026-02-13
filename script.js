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

// auto-collapse on mobile width
function checkMobileCollapse() {
    if (window.innerWidth <= 768) {
        applyCollapse(true);
    } else {
        const saved = load('sidebarCollapsed', false);
        applyCollapse(saved);
    }
}
window.addEventListener('resize', checkMobileCollapse);
checkMobileCollapse();

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
    const filter = currentFilter;
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
        if (t.done) {
            text.style.textDecoration = 'line-through';
            li.classList.add('done');
        }
        checkbox.addEventListener('change', () => {
            text.style.textDecoration = checkbox.checked ? 'line-through' : '';
            li.classList.toggle('done', checkbox.checked);
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

// remove old select-based filter logic; use tab buttons instead
const tabButtons = document.querySelectorAll('.filter-tabs button');
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        updateTabActive();
        renderTodos();
    });
});

function updateTabActive() {
    tabButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === currentFilter));
}

updateTabActive();
renderTodos();

// add clear completed link to the bottom of todo card
const clearLink = document.createElement('span');
clearLink.className = 'clear-completed';
clearLink.textContent = 'Clear Completed';
clearLink.addEventListener('click', () => {
    todos = todos.filter(t => !t.done);
    save('todos', todos);
    renderTodos();
});
const todoSectionCard = document.querySelector('#todo-section .card');
todoSectionCard.appendChild(clearLink);

// notes section
const notesContainer = document.getElementById('notes-container');
const notesSearch = document.getElementById('notes-search');
const newNoteBtn = document.getElementById('new-note-btn');
let notes = load('notes', []);
let searchTerm = '';

console.log('Notes elements:', { notesContainer, notesSearch, newNoteBtn });

function renderNotes() {
    console.log('renderNotes called, notes:', notes);
    if (!notesContainer) {
        console.error('notesContainer not found');
        return;
    }
    notesContainer.innerHTML = '';
    const filtered = notes
        .map((n, idx) => ({ ...n, originalIdx: idx }))
        .filter(n => 
            n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    if (filtered.length === 0) {
        const notFound = document.createElement('div');
        notFound.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 2rem; color: #999; font-size: 1.1rem;';
        notFound.textContent = searchTerm ? 'Not found' : 'No notes yet. Click + to create one!';
        notesContainer.appendChild(notFound);
        return;
    }
    
    filtered.forEach((note) => {
        const card = document.createElement('div');
        card.className = 'note-card';
        
        const title = document.createElement('div');
        title.className = 'note-card-title';
        title.textContent = note.title || 'Untitled';
        
        const preview = document.createElement('div');
        preview.className = 'note-card-preview';
        preview.textContent = note.content || 'No content';
        
        const footer = document.createElement('div');
        footer.className = 'note-card-footer';
        
        const tag = document.createElement('button');
        tag.className = 'note-card-tag';
        tag.textContent = 'None';
        
        const date = document.createElement('span');
        const noteDate = new Date(note.date);
        date.textContent = noteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'note-card-delete';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notes.splice(note.originalIdx, 1);
            save('notes', notes);
            renderNotes();
        });
        
        footer.appendChild(tag);
        footer.appendChild(date);
        
        card.appendChild(title);
        card.appendChild(preview);
        card.appendChild(footer);
        card.appendChild(deleteBtn);
        
        card.addEventListener('click', () => editNote(note.originalIdx));
        notesContainer.appendChild(card);
    });
}

function editNote(idx) {
    const note = notes[idx];
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    const form = document.createElement('div');
    form.style.cssText = 'background: var(--bg-color); color: var(--text-color); padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
    
    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'Title:';
    titleLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: bold;';
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = note.title;
    titleInput.style.cssText = 'width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #999; border-radius: 4px; font-size: 1rem; box-sizing: border-box; background: #f5f5f5; color: #333;';
    
    const contentLabel = document.createElement('label');
    contentLabel.textContent = 'Content:';
    contentLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: bold;';
    
    const contentInput = document.createElement('textarea');
    contentInput.value = note.content;
    contentInput.style.cssText = 'width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #999; border-radius: 4px; font-size: 1rem; resize: vertical; min-height: 150px; box-sizing: border-box; background: #f5f5f5; color: #333;';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 0.5rem; justify-content: flex-end;';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.style.cssText = 'padding: 0.75rem 1.5rem; background: #007acc; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 1rem;';
    saveBtn.addEventListener('mouseover', () => saveBtn.style.background = '#0059a1');
    saveBtn.addEventListener('mouseout', () => saveBtn.style.background = '#007acc');
    saveBtn.addEventListener('click', () => {
        notes[idx].title = titleInput.value || 'Untitled';
        notes[idx].content = contentInput.value;
        save('notes', notes);
        renderNotes();
        document.body.removeChild(modal);
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'padding: 0.75rem 1.5rem; background: #e0e0e0; color: #333; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 1rem;';
    cancelBtn.addEventListener('mouseover', () => cancelBtn.style.background = '#d0d0d0');
    cancelBtn.addEventListener('mouseout', () => cancelBtn.style.background = '#e0e0e0');
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);
    
    form.appendChild(titleLabel);
    form.appendChild(titleInput);
    form.appendChild(contentLabel);
    form.appendChild(contentInput);
    form.appendChild(buttonContainer);
    
    modal.appendChild(form);
    document.body.appendChild(modal);
    
    titleInput.focus();
}

newNoteBtn.addEventListener('click', () => {
    console.log('Create note button clicked');
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    const form = document.createElement('div');
    form.style.cssText = 'background: #ffffff; color: #333333; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
    
    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'Title:';
    titleLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: bold;';
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Untitled';
    titleInput.style.cssText = 'width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #999; border-radius: 4px; font-size: 1rem; box-sizing: border-box; background: #f5f5f5; color: #333;';
    
    const contentLabel = document.createElement('label');
    contentLabel.textContent = 'Content:';
    contentLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: bold;';
    
    const contentInput = document.createElement('textarea');
    contentInput.placeholder = 'Start typing...';
    contentInput.style.cssText = 'width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #999; border-radius: 4px; font-size: 1rem; resize: vertical; min-height: 150px; box-sizing: border-box; background: #f5f5f5; color: #333;';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 0.5rem; justify-content: flex-end;';
    
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = 'Create';
    saveBtn.style.cssText = 'padding: 0.75rem 1.5rem; background: #007acc; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 1rem;';
    saveBtn.addEventListener('mouseover', () => saveBtn.style.background = '#0059a1');
    saveBtn.addEventListener('mouseout', () => saveBtn.style.background = '#007acc');
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Save button clicked');
        const title = titleInput.value.trim() || 'Untitled';
        const content = contentInput.value.trim();
        console.log('Creating note:', title, content);
        
        notes.push({
            title: title,
            content: content,
            date: new Date().toISOString()
        });
        console.log('Notes array:', notes);
        save('notes', notes);
        console.log('Calling renderNotes');
        renderNotes();
        console.log('About to remove modal');
        try {
            if (modal.parentNode) {
                document.body.removeChild(modal);
                console.log('Modal removed successfully');
            }
        } catch (err) {
            console.error('Error removing modal:', err);
        }
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'padding: 0.75rem 1.5rem; background: #e0e0e0; color: #333; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 1rem;';
    cancelBtn.addEventListener('mouseover', () => cancelBtn.style.background = '#d0d0d0');
    cancelBtn.addEventListener('mouseout', () => cancelBtn.style.background = '#e0e0e0');
    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.removeChild(modal);
    });
    
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);
    
    form.appendChild(titleLabel);
    form.appendChild(titleInput);
    form.appendChild(contentLabel);
    form.appendChild(contentInput);
    form.appendChild(buttonContainer);
    
    modal.appendChild(form);
    document.body.appendChild(modal);
    
    titleInput.focus();
    console.log('Modal opened');
});

notesSearch.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderNotes();
});

renderNotes();

// habit tracker
const habitListEl = document.getElementById('habit-list');
const newHabitNameEl = document.getElementById('new-habit-name');
const newHabitDescEl = document.getElementById('new-habit-desc');
const newHabitEmojiEl = document.getElementById('new-habit-emoji');
const addHabitBtn = document.getElementById('add-habit');
const habitFilterBtns = document.querySelectorAll('[data-habit-filter]');
let habits = load('habits', []);
let habitFilter = 'all';

const habitColors = ['#FFD699', '#B3E5FC', '#F8BBD0', '#B2DFDB', '#C8E6C9', '#E1BEE7'];

habitFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        habitFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        habitFilter = btn.dataset.habitFilter;
        renderHabits();
    });
});

function renderHabits() {
    habitListEl.innerHTML = '';
    
    if (habits.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'text-align: center; padding: 2rem; color: #999;';
        empty.textContent = 'No habits yet. Add one to get started!';
        habitListEl.appendChild(empty);
        return;
    }
    
    habits.forEach((h, idx) => {
        const card = document.createElement('li');
        card.className = 'habit-list-item';
        card.style.background = habitColors[idx % habitColors.length];
        
        // Left side - emoji avatar
        const avatar = document.createElement('div');
        avatar.className = 'habit-avatar';
        avatar.textContent = h.emoji || '😊';
        
        // Middle - name and description
        const content = document.createElement('div');
        content.className = 'habit-content';
        
        const name = document.createElement('div');
        name.className = 'habit-list-name';
        name.textContent = h.name;
        
        const desc = document.createElement('div');
        desc.className = 'habit-list-desc';
        desc.textContent = h.description || 'No description';
        
        content.appendChild(name);
        content.appendChild(desc);
        
        // Right side - action buttons
        const actions = document.createElement('div');
        actions.className = 'habit-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'habit-edit-btn';
        editBtn.innerHTML = '✎';
        editBtn.addEventListener('click', () => editHabit(idx));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'habit-delete-btn';
        deleteBtn.innerHTML = '🗑';
        deleteBtn.addEventListener('click', () => {
            habits.splice(idx, 1);
            save('habits', habits);
            renderHabits();
            showToast('Habit deleted!');
        });
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        card.appendChild(avatar);
        card.appendChild(content);
        card.appendChild(actions);
        habitListEl.appendChild(card);
    });
}

function editHabit(idx) {
    const h = habits[idx];
    const newName = prompt('Edit habit name:', h.name);
    if (newName === null) return;
    const newDesc = prompt('Edit description:', h.description || '');
    if (newDesc === null) return;
    const newEmoji = prompt('Edit emoji:', h.emoji || '😊');
    if (newEmoji === null) return;
    
    h.name = newName.trim() || 'Untitled';
    h.description = newDesc.trim();
    h.emoji = newEmoji.trim().substring(0, 2);
    save('habits', habits);
    renderHabits();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #333; color: #fff; padding: 1rem 2rem; border-radius: 4px; z-index: 1001;';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
}

addHabitBtn.addEventListener('click', () => {
    const name = newHabitNameEl.value.trim();
    if (!name) {
        alert('Please enter a habit name');
        return;
    }
    const description = newHabitDescEl.value.trim();
    const emoji = newHabitEmojiEl.value.trim() || '😊';
    
    habits.push({ 
        name: name,
        description: description,
        emoji: emoji.substring(0, 2),
        completions: {}
    });
    save('habits', habits);
    renderHabits();
    newHabitNameEl.value = '';
    newHabitDescEl.value = '';
    newHabitEmojiEl.value = '😊';
});

renderHabits();
