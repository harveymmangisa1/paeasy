// UI Controller - Handles all UI interactions and rendering
class UIController {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.currentModal = null;
        this.toastContainer = null;
        this.draggedTask = null;
        this.init();
    }

    init() {
        this.createToastContainer();
        this.setupDragAndDrop();
        this.loadTheme();
    }

    createToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        this.toastContainer.id = 'toast-container';
        document.body.appendChild(this.toastContainer);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update theme icon
        const themeIcon = document.querySelector('#theme-toggle i');
        const iconMap = {
            'light': 'fa-moon',
            'dark': 'fa-sun',
            'high-contrast': 'fa-adjust',
            'sepia': 'fa-coffee'
        };
        
        if (themeIcon) {
            themeIcon.className = `fas ${iconMap[savedTheme]}`;
        }
    }

    // Modal management
    openTaskModal(taskId = null) {
        const modal = document.getElementById('task-modal');
        const overlay = document.getElementById('modal-overlay');
        const title = document.getElementById('task-modal-title');
        const form = document.getElementById('task-form');

        if (taskId) {
            const task = this.taskManager.getTask(taskId);
            if (task) {
                title.textContent = 'Edit Task';
                this.populateTaskForm(form, task);
            }
        } else {
            title.textContent = 'Add New Task';
            form.reset();
        }

        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
        this.currentModal = 'task-modal';

        // Focus on title input
        setTimeout(() => {
            document.getElementById('task-title')?.focus();
        }, 100);
    }

    openProjectModal() {
        const modal = document.getElementById('project-modal');
        const overlay = document.getElementById('modal-overlay');

        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
        this.currentModal = 'project-modal';

        // Focus on name input
        setTimeout(() => {
            document.getElementById('project-name')?.focus();
        }, 100);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modal-overlay');

        if (modal) {
            modal.classList.add('hidden');
        }

        if (overlay) {
            overlay.classList.add('hidden');
        }

        this.currentModal = null;
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        const overlay = document.getElementById('modal-overlay');

        modals.forEach(modal => modal.classList.add('hidden'));
        overlay.classList.add('hidden');
        this.currentModal = null;
    }

    // Form population
    populateTaskForm(form, task) {
        form.elements['title'].value = task.title;
        form.elements['description'].value = task.description || '';
        form.elements['project'].value = task.project || '';
        form.elements['status'].value = task.status;
        form.elements['priority'].value = task.priority;
        form.elements['dueDate'].value = task.dueDate || '';

        // Clear all label checkboxes
        const labelCheckboxes = form.querySelectorAll('input[name="labels"]');
        labelCheckboxes.forEach(checkbox => {
            checkbox.checked = task.labels?.includes(checkbox.value) || false;
        });
    }

    // Task rendering
    renderTasks(tasks, view = 'list') {
        const container = document.getElementById('task-container');
        
        if (tasks.length === 0) {
            this.renderEmptyState(container, view);
            return;
        }

        switch (view) {
            case 'board':
                this.renderBoardView(container, tasks);
                break;
            case 'calendar':
                this.renderCalendarView(container, tasks);
                break;
            case 'list':
            default:
                this.renderListView(container, tasks);
        }
    }

    renderListView(container, tasks) {
        container.innerHTML = '';
        container.className = 'task-container';

        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    renderBoardView(container, tasks) {
        container.innerHTML = '';
        container.className = 'task-container board-container';

        const columns = [
            { id: 'todo', title: 'To Do', status: 'todo' },
            { id: 'in-progress', title: 'In Progress', status: 'in-progress' },
            { id: 'completed', title: 'Completed', status: 'completed' }
        ];

        columns.forEach(column => {
            const columnElement = this.createBoardColumn(column, tasks);
            container.appendChild(columnElement);
        });
    }

    renderCalendarView(container, tasks) {
        container.innerHTML = '';
        container.className = 'task-container';

        const calendarElement = this.createCalendarElement(tasks);
        container.appendChild(calendarElement);
    }

    renderEmptyState(container, view) {
        const emptyMessages = {
            'all': 'No tasks yet',
            'today': 'No tasks for today',
            'upcoming': 'No upcoming tasks',
            'completed': 'No completed tasks'
        };

        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks empty-icon"></i>
                <h3>${emptyMessages[view] || 'No tasks found'}</h3>
                <p>Create your first task to get started</p>
                <button class="btn btn-primary" onclick="document.getElementById('add-task-btn').click()">
                    <i class="fas fa-plus"></i> Create Task
                </button>
            </div>
        `;
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;
        taskElement.dataset.taskId = task.id;
        taskElement.draggable = true;

        const project = task.project ? this.taskManager.getProject(task.project) : null;
        const isOverdue = this.isTaskOverdue(task);
        const isDueSoon = this.isTaskDueSoon(task);

        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-checkbox ${task.status === 'completed' ? 'checked' : ''}" 
                     onclick="app.uiController.toggleTaskStatus('${task.id}')"></div>
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    <div class="task-meta">
                        ${project ? `
                            <div class="task-project">
                                <span class="task-project-color" style="background: ${project.color}"></span>
                                <span>${project.name}</span>
                            </div>
                        ` : ''}
                        ${task.dueDate ? `
                            <div class="task-due-date ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}">
                                <i class="fas fa-calendar"></i>
                                <span>${this.formatDate(task.dueDate)}</span>
                            </div>
                        ` : ''}
                        <div class="task-priority priority-${task.priority}">
                            <i class="fas fa-flag"></i>
                            <span>${task.priority}</span>
                        </div>
                        ${task.labels && task.labels.length > 0 ? `
                            <div class="task-labels">
                                ${task.labels.map(labelId => {
                                    const label = this.taskManager.getLabel(labelId);
                                    return label ? `<span class="label-chip ${label.id}">${label.name}</span>` : '';
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn" onclick="app.uiController.openTaskModal('${task.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn" onclick="app.uiController.deleteTask('${task.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        // Add drag event listeners
        this.addTaskDragListeners(taskElement);

        return taskElement;
    }

    createBoardColumn(column, tasks) {
        const columnElement = document.createElement('div');
        columnElement.className = 'board-column';
        columnElement.dataset.status = column.status;

        const columnTasks = tasks.filter(task => task.status === column.status);

        columnElement.innerHTML = `
            <div class="board-column-header">
                <div class="board-column-title">
                    <span>${column.title}</span>
                    <span class="board-column-count">${columnTasks.length}</span>
                </div>
            </div>
            <div class="board-column-content" data-status="${column.status}">
                ${columnTasks.map(task => {
                    const taskElement = this.createTaskElement(task);
                    return taskElement.outerHTML;
                }).join('')}
            </div>
        `;

        // Add drop listeners to column content
        const columnContent = columnElement.querySelector('.board-column-content');
        this.addColumnDropListeners(columnContent);

        return columnElement;
    }

    createCalendarElement(tasks) {
        const calendarElement = document.createElement('div');
        calendarElement.className = 'calendar-view';

        // Simple calendar implementation
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const calendarHTML = this.generateCalendarHTML(currentMonth, currentYear, tasks);
        calendarElement.innerHTML = calendarHTML;

        return calendarElement;
    }

    // Drag and drop
    setupDragAndDrop() {
        document.addEventListener('dragstart', (e) => this.handleDragStart(e));
        document.addEventListener('dragend', (e) => this.handleDragEnd(e));
        document.addEventListener('dragover', (e) => this.handleDragOver(e));
        document.addEventListener('drop', (e) => this.handleDrop(e));
    }

    addTaskDragListeners(taskElement) {
        taskElement.addEventListener('dragstart', (e) => this.handleTaskDragStart(e));
        taskElement.addEventListener('dragend', (e) => this.handleTaskDragEnd(e));
    }

    addColumnDropListeners(columnElement) {
        columnElement.addEventListener('dragover', (e) => this.handleColumnDragOver(e));
        columnElement.addEventListener('drop', (e) => this.handleColumnDrop(e));
        columnElement.addEventListener('dragleave', (e) => this.handleColumnDragLeave(e));
    }

    handleTaskDragStart(e) {
        const taskElement = e.target.closest('.task-item');
        if (taskElement) {
            this.draggedTask = taskElement;
            taskElement.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', taskElement.innerHTML);
        }
    }

    handleTaskDragEnd(e) {
        const taskElement = e.target.closest('.task-item');
        if (taskElement) {
            taskElement.classList.remove('dragging');
        }
        this.draggedTask = null;
    }

    handleColumnDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    handleColumnDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        if (this.draggedTask) {
            const taskId = this.draggedTask.dataset.taskId;
            const newStatus = e.currentTarget.dataset.status;
            
            if (taskId && newStatus) {
                this.taskManager.updateTask(taskId, { status: newStatus });
                app.renderCurrentView();
            }
        }
    }

    handleColumnDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    // Task actions
    async toggleTaskStatus(taskId) {
        try {
            await this.taskManager.toggleTaskStatus(taskId);
            app.renderCurrentView();
        } catch (error) {
            console.error('Failed to toggle task status:', error);
            this.showToast('Failed to update task', 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await this.taskManager.deleteTask(taskId);
            app.renderCurrentView();
            this.showToast('Task deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete task:', error);
            this.showToast('Failed to delete task', 'error');
        }
    }

    // Project management
    updateProjectsList() {
        const projectList = document.getElementById('project-list');
        const projects = this.taskManager.getProjects();

        projectList.innerHTML = projects.map(project => `
            <li class="project-item">
                <a href="#" data-project="${project.id}" class="project-link">
                    <span class="project-color" style="background: ${project.color}"></span>
                    <span>${project.name}</span>
                </a>
            </li>
        `).join('');

        // Update task form project options
        const taskProjectSelect = document.getElementById('task-project');
        if (taskProjectSelect) {
            taskProjectSelect.innerHTML = `
                <option value="">No Project</option>
                ${projects.map(project => `
                    <option value="${project.id}">${project.name}</option>
                `).join('')}
            `;
        }
    }

    // Toast notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${iconMap[type]} toast-icon"></i>
            <span class="toast-message">${message}</span>
            <i class="fas fa-times toast-close" onclick="this.parentElement.remove()"></i>
        `;

        this.toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    isTaskOverdue(task) {
        if (!task.dueDate || task.status === 'completed') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(task.dueDate) < today;
    }

    isTaskDueSoon(task) {
        if (!task.dueDate || task.status === 'completed') return false;
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        
        return taskDate >= today && taskDate <= tomorrow;
    }

    generateCalendarHTML(month, year, tasks) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        let html = `
            <div class="calendar-header">
                <h3>${monthNames[month]} ${year}</h3>
            </div>
            <div class="calendar-grid">
                <div class="calendar-weekdays">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div class="calendar-days">
        `;

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const dayTasks = tasks.filter(task => task.dueDate === dateString);
            const isToday = date.toDateString() === new Date().toDateString();

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}">
                    <div class="calendar-day-number">${day}</div>
                    ${dayTasks.length > 0 ? `
                        <div class="calendar-day-tasks">
                            ${dayTasks.slice(0, 3).map(task => `
                                <div class="calendar-task" title="${this.escapeHtml(task.title)}">
                                    <span class="calendar-task-priority priority-${task.priority}"></span>
                                </div>
                            `).join('')}
                            ${dayTasks.length > 3 ? `<div class="calendar-more">+${dayTasks.length - 3}</div>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        html += '</div></div>';
        return html;
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}