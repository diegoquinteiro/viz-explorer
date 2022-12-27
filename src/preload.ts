import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    openFolder: (item:string) => ipcRenderer.invoke('shell:openFolder', item)
});
