import { throws } from "assert";
import * as React from "react";
import sampleFile from "../viz/sample-file";
import FileDescription from "../util/FileDescription";
import Explorer from "./Explorer";
import Header from "./Header";
import VizExplorer from "../viz/viz-explorer";

type PageState = {
   files: FileDescription[],
   selectedTab: number,
}
class Page extends React.Component<{}, PageState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            files: [sampleFile, sampleFile],
            selectedTab: 0,
        }
    }

    handleFileOpen = (file: FileDescription) => {
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

    handleCloseTab = (tab:number, e:React.SyntheticEvent) => {
        this.setState((state, props):PageState => {
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

    render(): React.ReactNode {
        return <div className="page">
            <Header onFileOpen={this.handleFileOpen}/>
            <ul className="tabs">
                {this.state.files.map((file, i) =>
                    <li key={i} className={i == this.state.selectedTab ? "selected" : null} onClick={this.handleSelectTab.bind(this, i)}>
                        📄 {file.path.replace(/^.*[\\\/]/, '')}
                        <button onClick={this.handleCloseTab.bind(this, i)}>✚</button>
                    </li>
                )}
            </ul>
            {this.state.files.map((file, i) =>
                <div key={i} className={["tabContent", i == this.state.selectedTab ? "selected" : null].join(' ')}>
                    <Explorer graph={VizExplorer.parse(file.contents)} name={file.path.replace(/^.*[\\\/]/, '')} />
                </div>
            )}
        </div>;
    }
}
export default Page;