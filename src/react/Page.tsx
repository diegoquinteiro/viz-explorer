import electronAPI from "../api/electron-api";
import * as React from "react";
import FileDescription from "../util/FileDescription";
import Explorer from "./Explorer";
import emptyFile from "../viz/empty-file";
import { ReactSortable } from "react-sortablejs";
import { stat } from "fs";

type PageState = {
   files: FileDescription[],
   selectedTab: number,
}
class Page extends React.Component<{}, PageState> {

    pageElement: React.RefObject<HTMLDivElement>;

    constructor(props: {}) {
        super(props);
        this.state = {
            files: [emptyFile],
            selectedTab: 0
        }
        this.pageElement = React.createRef();
    }

    componentDidMount = async () => {
        document.addEventListener('keydown', (e) => {
            if (e.key == "Shift") {
                this.pageElement.current.classList.add("modifier");
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.key == "Shift") {
                this.pageElement.current.classList.remove("modifier");
            }
        });
        document.addEventListener('drop', (e: DragEvent) => {
            for (const file of e.dataTransfer.files) {
                this.openFile(file.path);
            }
        });
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });


        electronAPI.onThemeUpdated(this.handleThemeChange);
        electronAPI.onCloseTabRequested(() => {
            this.closeTab(this.state.selectedTab);
        });
        electronAPI.onNextTabRequested(() => {
            this.handleSelectTab((this.state.selectedTab + 1) % this.state.files.length);
        });
        electronAPI.onPreviousTabRequested(() => {
            this.handleSelectTab((this.state.selectedTab + this.state.files.length - 1) % this.state.files.length);
        });
        electronAPI.onOpenRequested(this.openFile);
        electronAPI.onNewRequested(this.newFile);
        await this.handleThemeChange();
    }

    handleCloseTab = (tab:number, e:React.SyntheticEvent) => {
        this.closeTab(tab);
        e.stopPropagation();
    };

    closeTab = (tab:number) => {
        if (this.state.files[tab].changed) {
            let sure = false;
            if (this.state.files[tab].path)
                sure = confirm(`Discard changes to "${this.state.files[tab].path.replace(/^.*[\\\/]/, '')}?`);
            else
                sure = confirm(`Discard changes?`);

            if (!sure) return;
        }
        this.setState((state, props) => {
            let selectedTab = state.selectedTab;
            if (state.files.length == 1) {
                window.close();
            }
            if (selectedTab >= tab) {
              selectedTab--;
            }
            selectedTab = Math.max(selectedTab, 0);
            return {
                selectedTab: selectedTab,
                files: state.files.filter((f, i) => i !== tab),
            }
        });
    };

    handleSelectTab = (tab:number) => {
        this.setState({
            selectedTab: tab,
        }, () => {
            window.dispatchEvent(new Event('resize'));
        });
    };

    handleOpenFileClick = async (e: React.SyntheticEvent) => {
        await this.openFile();
    };

    openFile = async (filePath?:string) => {
        let file:FileDescription;
        if (filePath) {
            console.log(filePath);
            file = await electronAPI.openFile(filePath);
        }
        else {
            file = await electronAPI.openFile();
        }

        if (!file) return;
        if (this.state.files.find(f => f.path == file.path)) {
            this.setState((state) => ({
                selectedTab: state.files.indexOf(state.files.find(f => f.path == file.path))
            }));
            return;
        }
        if (this.state.files.length == 1 && this.state.files[0] == emptyFile) {
            this.setState((state, props) => ({
                selectedTab: 0,
                files: [file],
            }));
        }
        else {
            this.setState((state, props) => ({
                selectedTab: state.files.length,
                files: [...state.files, file],
            }));
        }
    };

    newFile = async () => {
        let newFile = structuredClone(emptyFile);
        newFile.id = "new" + Date.now();
        this.setState((state, props) => ({
            selectedTab: state.files.length,
            files: [...state.files, newFile],
        }));
    };

    async handleToggleTheme() {
        await electronAPI.toggleDarkMode();
    }

    async handleThemeChange() {
        let theme = await electronAPI.getNativeTheme();
        document.head.querySelector("meta[name='color-scheme']").setAttribute("content", theme);
    }

    handleFileChange = (file:FileDescription, code:string) => {
        this.setState((state, props) => ({
            files: state.files.map(f => {
                if (file == f) {
                    let clone = structuredClone(f);
                    if (clone.contents != code) {
                        clone.changed = true;
                    }
                    else {
                        clone.changed = false;
                    }
                    return clone;
                }
                return f;
            })
        }));
    };

    handleSave = async (file:FileDescription, code:string) => {
        // Save only current tab
        if (this.state.files[this.state.selectedTab] != file) return;
        const savedFile = await electronAPI.saveFile(file, code);
        if (!savedFile) return;
        this.setState((state, props) => ({
            files: state.files.map(f => {
                if (file == f) {
                    return savedFile;
                }
                return f;
            })
        }));
    };

    handleSaveAs = async (file:FileDescription, code:string) => {
        // Save only current tab
        if (this.state.files[this.state.selectedTab] != file) return;
        const savedFile = await electronAPI.saveFile(emptyFile, code);
        if (!savedFile) return;
        this.setState((state, props) => ({
            files: [...state.files, savedFile],
            selectedTab: state.files.length
        }));
    };


    render(): React.ReactNode {
        return <div className="page" ref={this.pageElement}>
            <button className="toggle-theme" onClick={this.handleToggleTheme}>
                <span className="dark-theme-only">☼</span>
                <span className="light-theme-only">☽</span>
            </button>
            <ReactSortable
                className="tabs"
                tag="ul"
                list={this.state.files}
                setList={(newFiles) => this.setState((state) => {
                    let newSelectedTab = newFiles.indexOf(newFiles.find(f => f.id == state.files[state.selectedTab].id));
                    return {
                        files: newFiles,
                        selectedTab: newSelectedTab,
                    }
                })}
            >
                {this.state.files.map((file, i) =>
                    <li key={file.id} className={[i == this.state.selectedTab ? "selected" : "", file.changed ? "changed" : ""].join(" ")} onClick={this.handleSelectTab.bind(this, i)}>
                        <span className="icon">{file.path.match(/\.[0-9a-z]+$/i) ? file.path.match(/\.[0-9a-z]+$/i)[0].slice(1).toUpperCase() :  "GV"}</span> <span className="filename">{file.path ? file.path.replace(/^.*[\\\/]/, '') : "(New file)"}</span>
                        <button className="close" onClick={this.handleCloseTab.bind(this, i)}>✚</button>
                    </li>
                )}
            </ReactSortable>
            {this.state.files.map((file, i) =>
                <div key={i} className={["tabContent", i == this.state.selectedTab ? "selected" : null].join(' ')}>
                    <Explorer key={file.path + ("" + file.id)} file={file}
                        onFileChange={this.handleFileChange.bind(this, file)}
                        onSave={this.handleSave.bind(this, file)}
                        onSaveAs={this.handleSaveAs.bind(this, file)} />

                </div>
            )}
            {this.state.files.length == 0 ? <div className="empty"><span>No graph open</span></div>: null}
        </div>;
    }
}
export default Page;
