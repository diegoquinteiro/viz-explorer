import electronAPI from "../api/electron-api";
import * as React from "react";
import FileDescription from "../util/FileDescription";
import Explorer from "./Explorer";
import VizExplorer from "../viz/viz-explorer";
import sampleFile from "../viz/sample-file";

type PageState = {
   files: FileDescription[],
   selectedTab: number,
}
class Page extends React.Component<{}, PageState> {

    pageElement: React.RefObject<HTMLDivElement>;

    constructor(props: {}) {
        super(props);
        this.state = {
            files: [sampleFile],
            selectedTab: 0
        }
        this.pageElement = React.createRef();
    }

    componentDidMount(): void {
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
    }

    handleCloseTab = (tab:number, e:React.SyntheticEvent) => {
        this.setState((state, props) => {
            let selectedTab = state.selectedTab;
            if (selectedTab >= tab) {
              selectedTab--;
            }
            selectedTab = Math.max(selectedTab, 0);
            return {
                selectedTab: selectedTab,
                files: state.files.filter((f, i) => i !== tab),
            }
        });
        e.stopPropagation();
    };

    handleSelectTab = (tab:number) => {
        this.setState({
            selectedTab: tab,
        });
    };

    handleOpenFileClick = async (e: React.SyntheticEvent) => {
        const file = await electronAPI.openFile();
        try {
            VizExplorer.parse(file.contents);
            this.setState((state, props) => ({
                selectedTab: state.files.length,
                files: [...state.files, file],
            }));
        }
        catch (e) {
            alert("Invalid DOT file, please check the file.");
        }
    };


    render(): React.ReactNode {
        return <div className={["page", this.state.modifier ? "modifier" : ""].join(" ")} ref={this.pageElement}>
            <ul className="tabs">
                {this.state.files.map((file, i) =>
                    <li key={i} className={i == this.state.selectedTab ? "selected" : null} onClick={this.handleSelectTab.bind(this, i)}>
                        ❖ &nbsp;{file.path.replace(/^.*[\\\/]/, '')}
                        <button className="close" onClick={this.handleCloseTab.bind(this, i)}>✚</button>
                    </li>
                )}
                <li>
                    <button className="open" type="button" onClick={this.handleOpenFileClick}>📂 Open a file</button>
                </li>
            </ul>
            {this.state.files.map((file, i) =>
                <div key={i} className={["tabContent", i == this.state.selectedTab ? "selected" : null].join(' ')}>
                    <Explorer graph={VizExplorer.parse(file.contents)} path={file.path} />
                </div>
            )}
            {this.state.files.length == 0 ? <div className="empty"><span>No graph open</span></div>: null}
        </div>;
    }
}
export default Page;
