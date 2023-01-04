import { app, Menu, BrowserWindow, ipcMain, dialog, shell, nativeTheme, screen, globalShortcut } from 'electron';
import { readFileSync } from 'fs';
import * as fs from 'fs';
import path from 'path';
import FileDescription from './util/FileDescription';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const gotTheLock = app.requestSingleInstanceLock();

app.name = "GraphViz Explorer";

require('update-electron-app')();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

async function handleOpenFile(e:any, filePath?:string): Promise<FileDescription> {
  if (!filePath) {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'DOT files', extensions: ['dot', 'gv'] },
        { name: 'All Files', extensions: ['*'] },
    ]});
    if (canceled) {
      return
    }
    filePath = filePaths[0];
  }

  return {
    path: filePath,
    id: filePath,
    contents: readFileSync(filePath).toString()
  }
}

async function handleSaveFile(e:any, file:FileDescription, contents:string): Promise<FileDescription> {
  let path = file.path;

  if (!path) {
    const { canceled, filePath } = await dialog.showSaveDialog({
      filters: [
        { name: 'DOT files', extensions: ['dot', 'gv'] },
        { name: 'All Files', extensions: ['*'] },
    ]});
    if (canceled) return;
    path = filePath;
  }

  fs.writeFileSync(path, contents);
  return {
    path: path,
    contents: contents,
    id: path,
    changed: false,
  }
}

async function handleOpenFolder(e:any, item:string): Promise<string> {
  return shell.openPath(path.dirname(item));
}

const createWindow = (filePath?:string): void => {
  // Create the browser window.
  const display = screen.getPrimaryDisplay();
  const width = Math.round(display.bounds.width * 0.8);
  const height = Math.round(display.bounds.height * 0.8);
  const mainWindow = new BrowserWindow({
    height: height,
    width: width,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY).then(() => {
    if (filePath) {
      mainWindow.webContents.send("open-requested", filePath);
    }
    app.on('open-file', (event:Electron.Event, path:string) => {
      event.preventDefault();
      mainWindow.webContents.send("open-requested", path);
    });
  });

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  nativeTheme.addListener("updated", () => {
    mainWindow.webContents.send("theme-updated");
  });

  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CommandOrControl+N',
          click() {
            mainWindow.webContents.send("new-requested");
          }
        },
        {
          type: "separator"
        },
        {
          label: 'Open...',
          accelerator: 'CommandOrControl+O',
          click() {
            mainWindow.webContents.send("open-requested");
          }
        },
        {
          type: "separator"
        },
        {
          label: 'Save',
          accelerator: 'CommandOrControl+S',
          click() {
            mainWindow.webContents.send("save-requested");
          }
        },
        {
          label: 'Save As..',
          accelerator: 'CommandOrControl+Shift+S',
          click() {
            mainWindow.webContents.send("save-as-requested");
          }
        },
        {
          type: "separator"
        },
        {
          label: 'Export as PNG...',
          accelerator: 'CommandOrControl+E',
          click() {
            mainWindow.webContents.send("export-requested");
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Close File',
          accelerator: 'CommandOrControl+W',
          click() {
            mainWindow.webContents.send("close-tab-requested");
          }
        }
      ]
    },
    { role: "editMenu" },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Next Tab',
          accelerator: 'Control+Tab',
          click() {
            mainWindow.webContents.send("next-tab-requested");
          }
        },
        {
          label: 'Previous Tab',
          accelerator: 'Control+Shift+Tab',
          click() {
            mainWindow.webContents.send("previous-tab-requested");
          }
        },
        {
          type: "separator"
        },
        {
          label: 'Open DevTools',
          accelerator: 'CommandOrControl+Alt+I',
          click() {
            mainWindow.webContents.openDevTools();
          }
        }
      ]
    }
  ];

  // @ts-ignore
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

if (!gotTheLock) {
  app.quit();
}
else {
  let openFilePath:string = null;
  app.on('open-file', (event:Electron.Event, path:string) => {
    event.preventDefault();
    openFilePath = path;
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    ipcMain.handle('dialog:openFile', handleOpenFile);
    ipcMain.handle('dialog:saveFile', handleSaveFile);
    ipcMain.handle('shell:openFolder', handleOpenFolder);
    ipcMain.handle('dark-mode:toggle', () => {
      if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'light'
      } else {
        nativeTheme.themeSource = 'dark'
      }
      return nativeTheme.shouldUseDarkColors ? "dark" : "light";
    });
    ipcMain.handle('native-theme:get', () => {
      return nativeTheme.shouldUseDarkColors ? "dark" : "light";
    });
    createWindow(openFilePath);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
      app.quit();
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
