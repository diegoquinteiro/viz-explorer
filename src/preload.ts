import { contextBridge, ipcRenderer } from 'electron'
import FileDescription from './util/FileDescription';

contextBridge.exposeInMainWorld('electronAPI', {
    openFile: (filePath?:string) => ipcRenderer.invoke('dialog:openFile', filePath),
    saveFile: (file:FileDescription, contents:string) => ipcRenderer.invoke('dialog:saveFile', file, contents),
    openFolder: (item:string) => ipcRenderer.invoke('shell:openFolder', item),
    toggleDarkMode: ():Promise<string> => ipcRenderer.invoke('dark-mode:toggle'),
    getNativeTheme: ():Promise<string> => ipcRenderer.invoke('native-theme:get'),
    onThemeUpdated: (callback:() => void) => ipcRenderer.on('theme-updated', callback),
    onSaveRequested: (callback:() => void) => ipcRenderer.on('save-requested', callback),
    onSaveAsRequested: (callback:() => void) => ipcRenderer.on('save-as-requested', callback),
    onNewRequested: (callback:() => void) => ipcRenderer.on('new-requested', callback),
    onOpenRequested: (callback:() => void) => ipcRenderer.on('open-requested', callback),
    onCloseTabRequested: (callback:() => void) => ipcRenderer.on('close-tab-requested', callback),
    onExportRequested: (callback:() => void) => ipcRenderer.on('export-requested', callback),
    onNextTabRequested: (callback:() => void) => ipcRenderer.on('next-tab-requested', callback),
    onPreviousTabRequested: (callback:() => void) => ipcRenderer.on('previous-tab-requested', callback),
});
