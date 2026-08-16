console.log('Testing electron...');
const electron = require('electron');
console.log('Checking for app:', typeof electron.app);
console.log('Checking for BrowserWindow:', typeof electron.BrowserWindow);
if (electron.app) { console.log('App found:', !!electron.app); }
if (electron.BrowserWindow) { console.log('BrowserWindow found:', !!electron.BrowserWindow); }
