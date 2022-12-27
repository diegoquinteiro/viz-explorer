import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    openFolder: (item:string) => ipcRenderer.invoke('shell:openFolder', item),
    toggleDarkMode: ():Promise<string> => ipcRenderer.invoke('dark-mode:toggle'),
    getNativeTheme: ():Promise<string> => ipcRenderer.invoke('native-theme:get'),
    onThemeUpdated: (callback:() => void) => ipcRenderer.on('theme-updated', callback),
});
