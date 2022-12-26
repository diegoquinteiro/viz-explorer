import FileDescription from "../util/FileDescription"

declare const electronAPI: {
    openFile: () => Promise<FileDescription>
}

export default electronAPI;
