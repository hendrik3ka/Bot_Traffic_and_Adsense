const {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} = require('electron');
const {
  main, stopProccess
} = require('./bot');
const path = require('path');
const fs = require('fs');
const { eventNames } = require('process');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 660,
    titleBarStyle: 'hidden', 
    titleBarOverlay: {
      color: '#000000',
      symbolColor: '#7FFF00'
    },
    // resizable: false,
    icon: path.join(__dirname, './assets/icon.ico'),
    webPreferences: {
      devTools: !app.isPackaged,
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  app.isPackaged && Menu.setApplicationMenu(null)
  mainWindow.loadFile('./src/index.html');
  // mainWindow.webContents.openDevTools();
  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update_progress', progress.percent);
  });

  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.on('update-available', () => {
    updateCheckInProgress = false;
    mainWindow.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
  });
}



app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('button-click', async (event, keywordFilePath, googleSearchs, directLinks, visitAdss, proxyC, proxys, desktops, androids, iphones, randoms, whoers, view, recentPosts, loops, scrollmins, scrollmaxs, scrollminAdss, scrollmaxAdss, captchaApiKeys, ipsayas, anchorTexts) => {
  const logs = [];

  const logToTextarea = (message) => {
    logs.push(message);
    event.sender.send('log', logs.join('\n'));
  };

  
  try {
    logToTextarea('Process started...');
    event.sender.send('run')
    await main(logToTextarea, keywordFilePath, googleSearchs, directLinks, visitAdss, proxyC, proxys, desktops, androids, iphones, randoms, whoers, view, recentPosts, loops, scrollmins, scrollmaxs, scrollminAdss, scrollmaxAdss, captchaApiKeys, ipsayas, anchorTexts);
    logToTextarea('Process completed successfully.');
    event.sender.send('foor')
  } catch (error) {
    logToTextarea(error)
  }
});

ipcMain.on('reload', () => {
  mainWindow.reload();
})

ipcMain.on('stop', (event) => {
  const logs = [];

  const logToTextarea = (message) => {
    logs.push(message);
    event.sender.send('log', logs.join('\n'));
  };

  stopProccess(logToTextarea);
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', {
      version: app.getVersion()
  });
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});