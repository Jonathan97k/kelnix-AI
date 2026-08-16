# Converting ReelMaker to a Standalone Desktop Application

## Overview
This guide explains how to convert the ReelMaker web application into a standalone desktop application using Electron.

## What We've Done
1. ✅ Examined the existing React + Express application
2. ✅ Built the production version using existing build scripts
3. ✅ Created Electron wrapper (`electron-main.js`) that:
   - Starts the Express server as a child process
   - Loads the web application in a BrowserWindow
   - Manages server lifecycle
4. ✅ Updated `package.json` with Electron scripts
5. ✅ Created Electron preload script (`electron-preload.js`)

## How to Run the Electron Application

### Prerequisites
- Node.js installed (v18+ recommended)
- The application dependencies already installed (run `npm install` if not done)

### Steps
1. **Build the application** (if not already built):
   ```bash
   npm run build
   ```

2. **Start the Electron application**:
   ```bash
   npm run electron
   ```
   
   Note: The first run will download the Electron binary (approximately 100-200MB), which may take some time depending on your internet connection.

### What Happens
- The Express server starts on `http://localhost:3000`
- Electron opens a window pointing to `http://localhost:3000`
- When you close the Electron window, the Express server stops automatically

## Files Created/Modified
- `electron-main.js` - Main Electron process
- `electron-preload.js` - Preload script for renderer process
- `package.json` - Added "electron" script and Electron dev dependency

## Future Improvements
For a more integrated standalone application, consider:

1. **Using Electron IPC** instead of localhost server:
   - Move API routes to Electron main process
   - Use `ipcMain`/`ipcRenderer` for communication
   - Eliminate the need for a separate Express server

2. **Packaging for distribution**:
   ```bash
   npm install --save-dev electron-builder
   ```
   Then add build scripts to create executables for Windows, macOS, and Linux.

3. **Optimizing build process**:
   - Create separate build configurations for Electron
   - Optimize assets for desktop use

## Troubleshooting
- If Electron fails to download, try setting a mirror:
  ```bash
  set ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/
  npm run electron
  ```
- Make sure to build the application first (`npm run build`) before running Electron
- Check that `dist/server.cjs` and `dist/` folder exist after building