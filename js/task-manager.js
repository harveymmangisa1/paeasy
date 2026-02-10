// Task Management System
class TaskManager {
    constructor(storage) {
        this.storage = storage;
        this.tasks = [];
        this.projects = [];
        this.labels = [];
        this.observers = [];
    }

    // Observer pattern for UI updates
    subscribe(observer) {
        this.observers.push(observer);
    }

    unsubscribe(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(event, data) {
        this.observers.forEach(observer => {
            if (observer[event]) {
                observer[event](data);
            }
        });
    }

    // Task CRUD operations
    async createTask(taskData) {
        const task = {
            id: this.generateId(),
            title: taskData.title,
            description: taskData.description || '',
            project: taskData.project || null,
            status: taskData.status || 'todo',
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate || null,
            labels: taskData.labels || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tasks.push(task);
        await this.saveTasks();
        this.notify('taskCreated', task);
        return task;
    }

    async updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            throw new Error('Task not found');
        }

        this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await this.saveTasks();
        this.notify('taskUpdated', this.tasks[taskIndex]);
        return this.tasks[taskIndex];
    }

    async deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            throw new Error('Task not found');
        }

        const deletedTask = this.tasks.splice(taskIndex, 1)[0];
        await this.saveTasks();
        this.notify('taskDeleted', deletedTask);
        return deletedTask;
    }

    async toggleTaskStatus(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        const statusFlow = {
            'todo': 'in-progress',
            'in-progress': 'completed',
            'completed': 'todo'
        };

        const newStatus = statusFlow[task.status] || 'todo';
        return await this.updateTask(taskId, { status: newStatus });
    }

    // Project CRUD operations
    async createProject(projectData) {
        const project = {
            id: this.generateId(),
            name: projectData.name,
            color: projectData.color || '#3b82f6',
            createdAt: new Date().toISOString()
        };

        this.projects.push(project);
        await this.saveProjects();
        this.notify('projectCreated', project);
        return project;
    }

    async updateProject(projectId, updates) {
        const projectIndex = this.projects.findIndex(project => project.id === projectId);
        if (projectIndex === -1) {
            throw new Error('Project not found');
        }

        this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            ...updates
        };

        await this.saveProjects();
        this.notify('projectUpdated', this.projects[projectIndex]);
        return this.projects[projectIndex];
    }

    async deleteProject(projectId) {
        const projectIndex = this.projects.findIndex(project => project.id === projectId);
        if (projectIndex === -1) {
            throw new Error('Project not found');
        }

        // Remove project from tasks
        this.tasks.forEach(task => {
            if (task.project === projectId) {
                task.project = null;
            }
        });

        const deletedProject = this.projects.splice(projectIndex, 1)[0];
        await this.saveProjects();
        await this.saveTasks();
        this.notify('projectDeleted', deletedProject);
        return deletedProject;
    }

    // Label CRUD operations
    async createLabel(labelData) {
        const label = {
            id: this.generateId(),
            name: labelData.name,
            color: labelData.color || '#ef4444',
            createdAt: new Date().toISOString()
        };

        this.labels.push(label);
        await this.saveLabels();
        this.notify('labelCreated', label);
        return label;
    }

    async updateLabel(labelId, updates) {
        const labelIndex = this.labels.findIndex(label => label.id === labelId);
        if (labelIndex === -1) {
            throw new Error('Label not found');
        }

        this.labels[labelIndex] = {
            ...this.labels[labelIndex],
            ...updates
        };

        await this.saveLabels();
        this.notify('labelUpdated', this.labels[labelIndex]);
        return this.labels[labelIndex];
    }

    async deleteLabel(labelId) {
        const labelIndex = this.labels.findIndex(label => label.id === labelId);
        if (labelIndex === -1) {
            throw new Error('Label not found');
        }

        // Remove label from tasks
        this.tasks.forEach(task => {
            if (task.labels) {
                task.labels = task.labels.filter(labelId => labelId !== labelId);
            }
        });

        const deletedLabel = this.labels.splice(labelIndex, 1)[0];
        await this.saveLabels();
        await this.saveTasks();
        this.notify('labelDeleted', deletedLabel);
        return deletedLabel;
    }

    // Query methods
    getTasks() {
        return [...this.tasks];
    }

    getTask(taskId) {
        return this.tasks.find(task => task.id === taskId);
    }

    getProjects() {
        return [...this.projects];
    }

    getProject(projectId) {
        return this.projects.find(project => project.id === projectId);
    }

    getLabels() {
        return [...this.labels];
    }

    getLabel(labelId) {
        return this.labels.find(label => label.id === labelId);
    }

    // Filter methods
    getTasksByStatus(status) {
        return this.tasks.filter(task => task.status === status);
    }

    getTasksByProject(projectId) {
        return this.tasks.filter(task => task.project === projectId);
    }

    getTasksByLabel(labelId) {
        return this.tasks.filter(task => task.labels?.includes(labelId));
    }

    getTasksByPriority(priority) {
        return this.tasks.filter(task => task.priority === priority);
    }

    getTasksDueToday() {
        const today = new Date().toDateString();
        return this.tasks.filter(task => {
            if (!task.dueDate) return false;
            return new Date(task.dueDate).toDateString() === today;
        });
    }

    getTasksDueThisWeek() {
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        return this.tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate >= today && taskDate <= weekFromNow;
        });
    }

    getOverdueTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.tasks.filter(task => {
            if (!task.dueDate || task.status === 'completed') return false;
            return new Date(task.dueDate) < today;
        });
    }

    // Statistics
    getTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.status === 'completed').length;
        const inProgress = this.tasks.filter(task => task.status === 'in-progress').length;
        const todo = this.tasks.filter(task => task.status === 'todo').length;
        const overdue = this.getOverdueTasks().length;

        return {
            total,
            completed,
            inProgress,
            todo,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    getProjectStats(projectId) {
        const projectTasks = this.getTasksByProject(projectId);
        const total = projectTasks.length;
        const completed = projectTasks.filter(task => task.status === 'completed').length;

        return {
            total,
            completed,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    // Bulk operations
    async bulkUpdateTasks(taskIds, updates) {
        const updatedTasks = [];
        
        for (const taskId of taskIds) {
            try {
                const updatedTask = await this.updateTask(taskId, updates);
                updatedTasks.push(updatedTask);
            } catch (error) {
                console.error(`Failed to update task ${taskId}:`, error);
            }
        }

        this.notify('tasksBulkUpdated', updatedTasks);
        return updatedTasks;
    }

    async bulkDeleteTasks(taskIds) {
        const deletedTasks = [];
        
        for (const taskId of taskIds) {
            try {
                const deletedTask = await this.deleteTask(taskId);
                deletedTasks.push(deletedTask);
            } catch (error) {
                console.error(`Failed to delete task ${taskId}:`, error);
            }
        }

        this.notify('tasksBulkDeleted', deletedTasks);
        return deletedTasks;
    }

    // Data persistence
    async loadTasks() {
        try {
            const tasks = await this.storage.getTasks();
            this.tasks = tasks || [];
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.tasks = [];
        }
    }

    async loadProjects() {
        try {
            const projects = await this.storage.getProjects();
            this.projects = projects || this.getDefaultProjects();
        } catch (error) {
            console.error('Failed to load projects:', error);
            this.projects = this.getDefaultProjects();
        }
    }

    async loadLabels() {
        try {
            const labels = await this.storage.getLabels();
            this.labels = labels || this.getDefaultLabels();
        } catch (error) {
            console.error('Failed to load labels:', error);
            this.labels = this.getDefaultLabels();
        }
    }

    async saveTasks() {
        try {
            await this.storage.saveTasks(this.tasks);
        } catch (error) {
            console.error('Failed to save tasks:', error);
            throw error;
        }
    }

    async saveProjects() {
        try {
            await this.storage.saveProjects(this.projects);
        } catch (error) {
            console.error('Failed to save projects:', error);
            throw error;
        }
    }

    async saveLabels() {
        try {
            await this.storage.saveLabels(this.labels);
        } catch (error) {
            console.error('Failed to save labels:', error);
            throw error;
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getDefaultProjects() {
        return [
            {
                id: 'personal',
                name: 'Personal',
                color: '#3b82f6',
                createdAt: new Date().toISOString()
            },
            {
                id: 'work',
                name: 'Work',
                color: '#10b981',
                createdAt: new Date().toISOString()
            }
        ];
    }

    getDefaultLabels() {
        return [
            {
                id: 'urgent',
                name: 'Urgent',
                color: '#ef4444',
                createdAt: new Date().toISOString()
            },
            {
                id: 'important',
                name: 'Important',
                color: '#f59e0b',
                createdAt: new Date().toISOString()
            }
        ];
    }

    // Validation
    validateTask(taskData) {
        const errors = [];

        if (!taskData.title || taskData.title.trim().length === 0) {
            errors.push('Title is required');
        }

        if (taskData.title && taskData.title.length > 200) {
            errors.push('Title must be less than 200 characters');
        }

        if (taskData.description && taskData.description.length > 1000) {
            errors.push('Description must be less than 1000 characters');
        }

        if (taskData.dueDate && !this.isValidDate(taskData.dueDate)) {
            errors.push('Invalid due date');
        }

        const validStatuses = ['todo', 'in-progress', 'completed'];
        if (taskData.status && !validStatuses.includes(taskData.status)) {
            errors.push('Invalid status');
        }

        const validPriorities = ['low', 'medium', 'high'];
        if (taskData.priority && !validPriorities.includes(taskData.priority)) {
            errors.push('Invalid priority');
        }

        return errors;
    }

    validateProject(projectData) {
        const errors = [];

        if (!projectData.name || projectData.name.trim().length === 0) {
            errors.push('Project name is required');
        }

        if (projectData.name && projectData.name.length > 50) {
            errors.push('Project name must be less than 50 characters');
        }

        return errors;
    }

    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskManager;
}