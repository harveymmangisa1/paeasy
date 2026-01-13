const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Navigation
  onNavigate: (callback) => ipcRenderer.on('navigate-to', callback),
  
  // App info
  onAppVersion: (callback) => ipcRenderer.on('app-version', callback),
  
  // File operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
  
  // Printer operations
  printReceipt: (data) => ipcRenderer.invoke('printer:print', data),
  
  // System info
  platform: process.platform,
  version: process.version
});