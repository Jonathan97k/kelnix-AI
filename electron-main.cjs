const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const { spawn } = require('node:child_process')

let serverProcess = null

function startServer() {
  // Start the Express server
  serverProcess = spawn('node', [path.join(__dirname, 'dist', 'server.cjs')], {
    stdio: 'inherit' // Share stdio with parent process
  })

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err)
  })

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`)
  })
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.cjs')
    }
  })

  // Load the local server
  win.loadURL('http://localhost:3000')

  // Open DevTools for development
  // win.webContents.openDevTools()
}

app.whenReady().then(() => {
  // Start the server first
  startServer()

  // Give the server a moment to start, then create the window
  setTimeout(() => {
    createWindow()
  }, 2000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  // Stop the server process when quitting
  if (serverProcess) {
    serverProcess.kill()
  }
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle app quit on macOS when clicking dock icon with no open windows
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill()
  }
})
