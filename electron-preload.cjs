// Preload scripts for Electron
// We can expose safe APIs to the renderer process here

const { contextBridge, ipcRenderer } = require('electron')

// Example of exposing a safe API
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any IPC methods here as needed
})
