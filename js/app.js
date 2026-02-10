// Main Application Entry Point
class TaskManagerApp {
    constructor() {
        this.taskManager = null;
        this.uiController = null;
        this.storage = null;
        this.currentView = 'all';
        this.currentFilter = {};
        this.init();
    }

    async init() {
        try {
            // Initialize storage
            this.storage = new Storage();
            
            // Initialize task manager
            this.taskManager = new TaskManager(this.storage);
            
            // Initialize UI controller
            this.uiController = new UIController(this.taskManager);
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial view
            this.renderCurrentView();
            
            console.log('Task Manager App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showToast('Failed to initialize app', 'error');
        }
    }

    async loadInitialData() {
        try {
            await this.taskManager.loadTasks();
            await this.taskManager.loadProjects();
            await this.taskManager.loadLabels();
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        sidebarToggle?.addEventListener('click', () => this.toggleSidebar());

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Search
        const searchInput = document.getElementById('search-input');
        searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // View toggle buttons
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(link.dataset.view);
            });
        });

        // Project links
        const projectLinks = document.querySelectorAll('.project-link');
        projectLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByProject(link.dataset.project);
            });
        });

        // Label links
        const labelLinks = document.querySelectorAll('.label-link');
        labelLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByLabel(link.dataset.label);
            });
        });

        // Add task button
        const addTaskBtn = document.getElementById('add-task-btn');
        addTaskBtn?.addEventListener('click', () => this.uiController.openTaskModal());

        // Add project button
        const addProjectBtn = document.getElementById('add-project');
        addProjectBtn?.addEventListener('click', () => this.uiController.openProjectModal());

        // Filter controls
        const statusFilter = document.getElementById('status-filter');
        const priorityFilter = document.getElementById('priority-filter');
        const sortFilter = document.getElementById('sort-filter');

        statusFilter?.addEventListener('change', () => this.applyFilters());
        priorityFilter?.addEventListener('change', () => this.applyFilters());
        sortFilter?.addEventListener('change', () => this.applyFilters());

        // Modal close buttons
        const modalCloseBtns = document.querySelectorAll('.modal-close');
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.modal;
                this.uiController.closeModal(modalId);
            });
        });

        // Modal overlay click
        const modalOverlay = document.getElementById('modal-overlay');
        modalOverlay?.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.uiController.closeAllModals();
            }
        });

        // Form submissions
        const taskForm = document.getElementById('task-form');
        taskForm?.addEventListener('submit', (e) => this.handleTaskSubmit(e));

        const projectForm = document.getElementById('project-form');
        projectForm?.addEventListener('submit', (e) => this.handleProjectSubmit(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcut(e));
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar?.classList.toggle('collapsed');
        sidebar?.classList.toggle('open');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const themes = ['light', 'dark', 'high-contrast', 'sepia'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
        
        // Update theme icon
        const themeIcon = document.querySelector('#theme-toggle i');
        const iconMap = {
            'light': 'fa-moon',
            'dark': 'fa-sun',
            'high-contrast': 'fa-adjust',
            'sepia': fa-coffee'
        };
        
        if (themeIcon) {
            themeIcon.className = `fas ${iconMap[nextTheme]}`;
        }
    }

    handleSearch(query) {
        this.currentFilter.search = query.trim();
        this.renderCurrentView();
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active states
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-view="${view}"]`);
        activeLink?.classList.add('active');
        
        // Update page title
        const titleMap = {
            'all': 'All Tasks',
            'today': 'Today',
            'upcoming': 'Upcoming',
            'completed': 'Completed'
        };
        
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = titleMap[view] || 'Tasks';
        }
        
        this.renderCurrentView();
    }

    filterByProject(project) {
        this.currentFilter.project = project;
        this.renderCurrentView();
    }

    filterByLabel(label) {
        this.currentFilter.label = label;
        this.renderCurrentView();
    }

    applyFilters() {
        const statusFilter = document.getElementById('status-filter');
        const priorityFilter = document.getElementById('priority-filter');
        const sortFilter = document.getElementById('sort-filter');
        
        this.currentFilter.status = statusFilter?.value || '';
        this.currentFilter.priority = priorityFilter?.value || '';
        this.currentFilter.sort = sortFilter?.value || 'created';
        
        this.renderCurrentView();
    }

    renderCurrentView() {
        let tasks = this.taskManager.getTasks();
        
        // Apply filters
        tasks = this.filterTasks(tasks);
        
        // Sort tasks
        tasks = this.sortTasks(tasks);
        
        // Update counts
        this.updateCounts();
        
        // Render tasks
        this.uiController.renderTasks(tasks, this.currentView);
        
        // Update stats
        this.updateStats(tasks.length);
    }

    filterTasks(tasks) {
        const filter = this.currentFilter;
        
        return tasks.filter(task => {
            // View filter
            if (this.currentView === 'today') {
                const today = new Date().toDateString();
                const taskDate = task.dueDate ? new Date(task.dueDate).toDateString() : null;
                if (taskDate !== today) return false;
            } else if (this.currentView === 'upcoming') {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (taskDate < today) return false;
            } else if (this.currentView === 'completed') {
                if (task.status !== 'completed') return false;
            }
            
            // Search filter
            if (filter.search) {
                const searchLower = filter.search.toLowerCase();
                const titleMatch = task.title.toLowerCase().includes(searchLower);
                const descMatch = task.description?.toLowerCase().includes(searchLower);
                if (!titleMatch && !descMatch) return false;
            }
            
            // Status filter
            if (filter.status && task.status !== filter.status) return false;
            
            // Priority filter
            if (filter.priority && task.priority !== filter.priority) return false;
            
            // Project filter
            if (filter.project && task.project !== filter.project) return false;
            
            // Label filter
            if (filter.label && !task.labels?.includes(filter.label)) return false;
            
            return true;
        });
    }

    sortTasks(tasks) {
        const sortBy = this.currentFilter.sort || 'created';
        
        return tasks.sort((a, b) => {
            switch (sortBy) {
                case 'due-date':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                
                case 'priority':
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                
                case 'name':
                    return a.title.localeCompare(b.title);
                
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
    }

    updateCounts() {
        const tasks = this.taskManager.getTasks();
        const today = new Date().toDateString();
        
        const counts = {
            all: tasks.length,
            today: tasks.filter(task => {
                if (!task.dueDate) return false;
                return new Date(task.dueDate).toDateString() === today;
            }).length,
            upcoming: tasks.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return taskDate >= today;
            }).length,
            completed: tasks.filter(task => task.status === 'completed').length
        };
        
        // Update DOM
        Object.keys(counts).forEach(key => {
            const element = document.getElementById(`${key}-count`);
            if (element) {
                element.textContent = counts[key];
            }
        });
    }

    updateStats(taskCount) {
        const statsElement = document.getElementById('task-stats');
        if (statsElement) {
            const text = taskCount === 1 ? '1 task' : `${taskCount} tasks`;
            statsElement.textContent = text;
        }
    }

    async handleTaskSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            project: formData.get('project') || null,
            status: formData.get('status'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate') || null,
            labels: formData.getAll('labels')
        };
        
        try {
            await this.taskManager.createTask(taskData);
            this.uiController.closeModal('task-modal');
            this.renderCurrentView();
            this.showToast('Task created successfully', 'success');
            e.target.reset();
        } catch (error) {
            console.error('Failed to create task:', error);
            this.showToast('Failed to create task', 'error');
        }
    }

    async handleProjectSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const projectData = {
            name: formData.get('name'),
            color: formData.get('color')
        };
        
        try {
            await this.taskManager.createProject(projectData);
            this.uiController.closeModal('project-modal');
            this.uiController.updateProjectsList();
            this.showToast('Project created successfully', 'success');
            e.target.reset();
        } catch (error) {
            console.error('Failed to create project:', error);
            this.showToast('Failed to create project', 'error');
        }
    }

    handleKeyboardShortcut(e) {
        // Ignore if user is typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        // Common shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    document.getElementById('search-input')?.focus();
                    break;
                case 'n':
                    e.preventDefault();
                    this.uiController.openTaskModal();
                    break;
                case 'b':
                    e.preventDefault();
                    this.toggleSidebar();
                    break;
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            this.uiController.closeAllModals();
        }
    }

    showToast(message, type = 'info') {
        this.uiController.showToast(message, type);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TaskManagerApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskManagerApp;
}