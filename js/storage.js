// Local Storage Management
class Storage {
    constructor() {
        this.prefix = 'taskmanager_';
        this.version = '1.0.0';
        this.init();
    }

    async init() {
        try {
            await this.checkVersion();
            await this.migrateData();
        } catch (error) {
            console.error('Storage initialization failed:', error);
        }
    }

    // Version management
    async checkVersion() {
        const storedVersion = localStorage.getItem(`${this.prefix}version`);
        if (storedVersion !== this.version) {
            console.log(`Storage version mismatch: stored=${storedVersion}, current=${this.version}`);
            await this.migrateData(storedVersion, this.version);
        }
    }

    async migrateData(fromVersion = null, toVersion = this.version) {
        try {
            // Add migration logic here for future versions
            if (fromVersion === '0.9.0' && toVersion === '1.0.0') {
                // Example migration
                await this.migrateFrom090To100();
            }

            localStorage.setItem(`${this.prefix}version`, toVersion);
            console.log(`Successfully migrated to version ${toVersion}`);
        } catch (error) {
            console.error('Data migration failed:', error);
            throw error;
        }
    }

    // Task operations
    async saveTasks(tasks) {
        try {
            const data = {
                tasks,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            localStorage.setItem(`${this.prefix}tasks`, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save tasks:', error);
            throw new Error('Failed to save tasks to storage');
        }
    }

    async getTasks() {
        try {
            const stored = localStorage.getItem(`${this.prefix}tasks`);
            if (!stored) return [];

            const data = JSON.parse(stored);
            return data.tasks || [];
        } catch (error) {
            console.error('Failed to load tasks:', error);
            return [];
        }
    }

    // Project operations
    async saveProjects(projects) {
        try {
            const data = {
                projects,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            localStorage.setItem(`${this.prefix}projects`, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save projects:', error);
            throw new Error('Failed to save projects to storage');
        }
    }

    async getProjects() {
        try {
            const stored = localStorage.getItem(`${this.prefix}projects`);
            if (!stored) return null;

            const data = JSON.parse(stored);
            return data.projects || null;
        } catch (error) {
            console.error('Failed to load projects:', error);
            return null;
        }
    }

    // Label operations
    async saveLabels(labels) {
        try {
            const data = {
                labels,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            localStorage.setItem(`${this.prefix}labels`, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save labels:', error);
            throw new Error('Failed to save labels to storage');
        }
    }

    async getLabels() {
        try {
            const stored = localStorage.getItem(`${this.prefix}labels`);
            if (!stored) return null;

            const data = JSON.parse(stored);
            return data.labels || null;
        } catch (error) {
            console.error('Failed to load labels:', error);
            return null;
        }
    }

    // Settings operations
    async saveSettings(settings) {
        try {
            const data = {
                settings,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            localStorage.setItem(`${this.prefix}settings`, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save settings:', error);
            throw new Error('Failed to save settings to storage');
        }
    }

    async getSettings() {
        try {
            const stored = localStorage.getItem(`${this.prefix}settings`);
            if (!stored) return this.getDefaultSettings();

            const data = JSON.parse(stored);
            return { ...this.getDefaultSettings(), ...data.settings };
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }

    // User preferences
    async saveUserPreferences(preferences) {
        try {
            const data = {
                preferences,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            localStorage.setItem(`${this.prefix}preferences`, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save user preferences:', error);
            throw new Error('Failed to save user preferences to storage');
        }
    }

    async getUserPreferences() {
        try {
            const stored = localStorage.getItem(`${this.prefix}preferences`);
            if (!stored) return this.getDefaultUserPreferences();

            const data = JSON.parse(stored);
            return { ...this.getDefaultUserPreferences(), ...data.preferences };
        } catch (error) {
            console.error('Failed to load user preferences:', error);
            return this.getDefaultUserPreferences();
        }
    }

    // Backup and restore
    async exportData() {
        try {
            const data = {
                version: this.version,
                exportDate: new Date().toISOString(),
                tasks: await this.getTasks(),
                projects: await this.getProjects(),
                labels: await this.getLabels(),
                settings: await this.getSettings(),
                preferences: await this.getUserPreferences()
            };
            return data;
        } catch (error) {
            console.error('Failed to export data:', error);
            throw new Error('Failed to export data');
        }
    }

    async importData(data) {
        try {
            // Validate data structure
            if (!this.validateImportData(data)) {
                throw new Error('Invalid data format');
            }

            // Create backup before import
            await this.createBackup();

            // Import data
            if (data.tasks) await this.saveTasks(data.tasks);
            if (data.projects) await this.saveProjects(data.projects);
            if (data.labels) await this.saveLabels(data.labels);
            if (data.settings) await this.saveSettings(data.settings);
            if (data.preferences) await this.saveUserPreferences(data.preferences);

            console.log('Data imported successfully');
        } catch (error) {
            console.error('Failed to import data:', error);
            throw error;
        }
    }

    // Backup operations
    async createBackup() {
        try {
            const backup = await this.exportData();
            const backupKey = `${this.prefix}backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(backup));
            
            // Keep only last 5 backups
            await this.cleanupOldBackups();
            
            return backupKey;
        } catch (error) {
            console.error('Failed to create backup:', error);
            throw error;
        }
    }

    async restoreBackup(backupKey) {
        try {
            const stored = localStorage.getItem(backupKey);
            if (!stored) {
                throw new Error('Backup not found');
            }

            const backup = JSON.parse(stored);
            await this.importData(backup);
            
            console.log('Backup restored successfully');
        } catch (error) {
            console.error('Failed to restore backup:', error);
            throw error;
        }
    }

    async getBackups() {
        try {
            const backups = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`${this.prefix}backup_`)) {
                    const stored = localStorage.getItem(key);
                    const backup = JSON.parse(stored);
                    backups.push({
                        key,
                        date: backup.exportDate,
                        version: backup.version,
                        taskCount: backup.tasks?.length || 0
                    });
                }
            }
            
            return backups.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Failed to get backups:', error);
            return [];
        }
    }

    async cleanupOldBackups() {
        try {
            const backups = await this.getBackups();
            const backupsToKeep = backups.slice(0, 5);
            const backupsToDelete = backups.slice(5);
            
            backupsToDelete.forEach(backup => {
                localStorage.removeItem(backup.key);
            });
            
            console.log(`Cleaned up ${backupsToDelete.length} old backups`);
        } catch (error) {
            console.error('Failed to cleanup old backups:', error);
        }
    }

    // Storage management
    async clearAllData() {
        try {
            // Create backup before clearing
            await this.createBackup();
            
            // Clear all data
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            console.log('All data cleared successfully');
        } catch (error) {
            console.error('Failed to clear data:', error);
            throw error;
        }
    }

    async getStorageInfo() {
        try {
            let totalSize = 0;
            let itemCount = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    const value = localStorage.getItem(key);
                    totalSize += key.length + value.length;
                    itemCount++;
                }
            }
            
            return {
                totalSize,
                itemCount,
                availableSpace: 5 * 1024 * 1024 - totalSize, // Estimated 5MB limit
                usagePercentage: Math.round((totalSize / (5 * 1024 * 1024)) * 100)
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return null;
        }
    }

    // Validation
    validateImportData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check required fields
        if (!data.version || !data.exportDate) {
            return false;
        }

        // Validate tasks array
        if (data.tasks && !Array.isArray(data.tasks)) {
            return false;
        }

        // Validate projects array
        if (data.projects && !Array.isArray(data.projects)) {
            return false;
        }

        // Validate labels array
        if (data.labels && !Array.isArray(data.labels)) {
            return false;
        }

        return true;
    }

    // Default values
    getDefaultSettings() {
        return {
            theme: 'light',
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            defaultView: 'list',
            autoSave: true,
            notifications: true,
            compactMode: false
        };
    }

    getDefaultUserPreferences() {
        return {
            sidebarCollapsed: false,
            showCompletedTasks: true,
            groupByProject: false,
            sortBy: 'created',
            sortOrder: 'desc',
            defaultPriority: 'medium',
            defaultProject: null,
            keyboardShortcuts: true,
            dragAndDrop: true,
            animations: true
        };
    }

    // Migration methods
    async migrateFrom090To100() {
        console.log('Migrating from v0.9.0 to v1.0.0');
        
        // Example migration logic
        const tasks = await this.getTasks();
        if (tasks) {
            // Add new fields to existing tasks
            const migratedTasks = tasks.map(task => ({
                ...task,
                labels: task.labels || [],
                createdAt: task.createdAt || new Date().toISOString(),
                updatedAt: task.updatedAt || task.createdAt || new Date().toISOString()
            }));
            
            await this.saveTasks(migratedTasks);
        }
    }

    // Error handling
    handleStorageError(error, operation) {
        console.error(`Storage error during ${operation}:`, error);
        
        // Check if it's a quota exceeded error
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            return {
                type: 'QUOTA_EXCEEDED',
                message: 'Storage quota exceeded. Please delete some data.',
                operation
            };
        }
        
        // Check if it's an access denied error
        if (error.name === 'SecurityError') {
            return {
                type: 'ACCESS_DENIED',
                message: 'Storage access denied. Please check your browser settings.',
                operation
            };
        }
        
        return {
            type: 'UNKNOWN_ERROR',
            message: `Storage error: ${error.message}`,
            operation
        };
    }

    // Utility methods
    generateKey(type) {
        return `${this.prefix}${type}_${Date.now()}`;
    }

    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    async optimizeStorage() {
        try {
            // Remove old backups
            await this.cleanupOldBackups();
            
            // Compress data if needed
            const storageInfo = await this.getStorageInfo();
            if (storageInfo && storageInfo.usagePercentage > 80) {
                console.warn('Storage usage is high, consider cleaning up old data');
            }
            
            return true;
        } catch (error) {
            console.error('Failed to optimize storage:', error);
            return false;
        }
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}