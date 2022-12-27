import FileDescription from "../util/FileDescription"

declare const electronAPI: {
    openFile: () => Promise<FileDescription>,
    openFolder: (item:string) => void,
    toggleDarkMode: () => Promise<string>,
    getNativeTheme: () => Promise<string>,
    onThemeUpdated: (callback:() => void) => void,
}

export default electronAPI;
