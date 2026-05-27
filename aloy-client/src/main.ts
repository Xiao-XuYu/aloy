import { app, BrowserWindow } from 'electron';
// import * as path from 'path';
const path = require("path")

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 602, 
    webPreferences: {
      // 预加载脚本，如果需要的话
      // preload: path.join(__dirname, 'preload.js'), 
    }
  });

  // 加载页面
  mainWindow.loadURL('https://html5test.com'); 
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});