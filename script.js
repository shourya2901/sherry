// Get DOM elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const prioritySelect = document.getElementById('prioritySelect');
const categorySelect = document.getElementById('categorySelect');
const clearBtn = document.getElementById('clearBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

// Stats elements
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');
const highPriorityCount = document.getElementById('highPriorityCount');

// State
let tasks = [];
let currentFilter = 'all';

// Load tasks from localStorage
function loadTasks() {
    const saved = localStorage.getItem('sherryTasks');
    tasks = saved ? JSON.parse(saved) : [];
    render();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('sherryTasks', JSON.stringify(tasks));
}

// Add new task
function addTask(e) {
    e.preventDefault();
    
    const text = taskInput.value.trim();
    if (!text) {
        taskInput.focus();
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: prioritySelect.value,
        category: categorySelect.value,
        createdAt: new Date().toLocaleString()
    };

    tasks.unshift(task);
    saveTasks();
    render();
    
    taskInput.value = '';
    taskInput.focus();
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

// Delete task
function deleteTask(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index > -1) {
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        taskElement.classList.add('deleting');
        
        setTimeout(() => {
            tasks.splice(index, 1);
            saveTasks();
            render();
        }, 300);
    }
}

// Clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
}

// Filter tasks
function getFilteredTasks() {
    switch(currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        case 'high':
            return tasks.filter(t => t.priority === 'high');
        default:
            return tasks;
    }
}

// Update stats
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(t => t.priority === 'high').length;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
    highPriorityCount.textContent = highPriority;
}

// Render tasks
function render() {
    updateStats();
    
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    taskList.innerHTML = filteredTasks.map(task => `
        <li class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-meta">
                    <span class="task-badge badge-priority-${task.priority}">
                        <i class="fas fa-flag"></i> ${task.priority}
                    </span>
                    <span class="task-badge badge-category">
                        <i class="fas fa-tag"></i> ${task.category}
                    </span>
                    <span class="task-badge" style="background: #f0f0f0; color: #999; font-size: 0.7em;">
                        ${task.createdAt}
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn" title="Delete" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask(e);
});

clearBtn.addEventListener('click', clearCompleted);

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && document.activeElement === taskInput) {
        addTask(e);
    }
});

// Initialize
loadTasks();
