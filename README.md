# Task Manager

A full-featured task management application similar to Notion and ClickUp, built with vanilla HTML, CSS, and JavaScript.

## Features

### Core Functionality
- ✅ **Task Management**: Create, edit, delete, and organize tasks
- 📋 **Multiple Views**: List, Board (Kanban), and Calendar views
- 🏷️ **Projects & Labels**: Organize tasks by projects and custom labels
- 🎯 **Priority Levels**: Set task priority (Low, Medium, High)
- 📅 **Due Dates**: Set and track due dates with overdue notifications
- 📊 **Task Statistics**: View task counts and completion rates

### User Interface
- 🎨 **Modern Design**: Clean, responsive interface with smooth animations
- 🌙 **Theme Support**: Light, Dark, High Contrast, and Sepia themes
- 📱 **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- 🔍 **Search & Filter**: Powerful search and filtering capabilities
- ⌨️ **Keyboard Shortcuts**: Productivity shortcuts for power users
- 🖱️ **Drag & Drop**: Intuitive drag-and-drop task management

### Data Management
- 💾 **Local Storage**: All data stored locally in browser
- 🔄 **Auto-save**: Automatic saving of all changes
- 📤 **Import/Export**: Backup and restore functionality
- 🗂️ **Data Persistence**: Reliable data storage with version management

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000`

## Usage Guide

### Creating Tasks
- Click the "Add Task" button or press `Ctrl+N`
- Fill in task details (title, description, project, priority, due date)
- Add labels for better organization
- Click "Save Task" to create

### Managing Tasks
- **Edit**: Click the edit icon on any task
- **Delete**: Click the trash icon to remove tasks
- **Complete**: Click the checkbox to mark tasks as complete
- **Status Flow**: Tasks flow through Todo → In Progress → Completed

### Organizing with Projects
- Create projects from the sidebar
- Assign tasks to projects for better organization
- Filter tasks by project

### Using Labels
- Create custom labels (Urgent, Important, etc.)
- Apply multiple labels to tasks
- Filter tasks by labels

### Different Views
- **List View**: Traditional task list with all details
- **Board View**: Kanban-style columns for status management
- **Calendar View**: Monthly calendar with due date visualization

### Search & Filter
- Use the search bar to find tasks quickly
- Filter by status, priority, project, or labels
- Sort by creation date, due date, priority, or name

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | Create new task |
| `Ctrl+K` | Focus search bar |
| `Ctrl+B` | Toggle sidebar |
| `Escape` | Close modals |

## Themes

The application supports multiple themes:
- **Light**: Clean, bright interface
- **Dark**: Easy on the eyes for night work
- **High Contrast**: Maximum visibility for accessibility
- **Sepia**: Warm, reading-friendly colors

Switch themes using the theme toggle button in the header.

## Data Storage

All data is stored locally in your browser using localStorage:
- Tasks, projects, and labels are automatically saved
- No server required - works completely offline
- Data persists between browser sessions
- Export/import functionality for backups

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Project Structure
```
task-manager/
├── index.html          # Main HTML file
├── styles/             # CSS stylesheets
│   ├── main.css        # Core styles
│   ├── components.css  # UI components
│   └── themes.css      # Theme variations
├── js/                 # JavaScript modules
│   ├── app.js          # Main application
│   ├── task-manager.js # Task management logic
│   ├── ui-controller.js # UI interactions
│   └── storage.js      # Data persistence
└── package.json        # Project configuration
```

### Architecture
- **Modular Design**: Separated concerns with distinct modules
- **Event-Driven**: Observer pattern for reactive updates
- **Component-Based**: Reusable UI components
- **Storage Layer**: Abstracted data management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Future Enhancements

- [ ] Team collaboration features
- [ ] Cloud synchronization
- [ ] Advanced reporting
- [ ] Mobile app version
- [ ] Integration with other tools
- [ ] Custom workflows
- [ ] Time tracking
- [ ] File attachments
- [ ] Comments and mentions
