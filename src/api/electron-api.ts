import FileDescription from "../util/FileDescription"

declare const electronAPI: {
    openFile: (filePath?:string) => Promise<FileDescription>,
    saveFile: (file:FileDescription, contents:string) => Promise<FileDescription>,
    openFolder: (item:string) => void,
    toggleDarkMode: () => Promise<string>,
    getNativeTheme: () => Promise<string>,
    onThemeUpdated: (callback:() => void) => void,
    onSaveRequested: (callbacl:() => void) => void,
    onOpenRequested: (callbacl:(filePath:string) => void) => void,
    onNewRequested: (callbacl:() => void) => void,
    onSaveAsRequested: (callbacl:() => void) => void,
    onCloseTabRequested: (callbacl:() => void) => void,
    onExportRequested: (callbacl:() => void) => void,
    onNextTabRequested: (callbacl:() => void) => void,
    onPreviousTabRequested: (callbacl:() => void) => void,
}

export default electronAPI;
