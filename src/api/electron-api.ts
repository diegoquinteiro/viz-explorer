import FileDescription from "../util/FileDescription"

declare const electronAPI: {
    openFile: () => Promise<FileDescription>,
    openFolder: (item:string) => void,
}

export default electronAPI;
