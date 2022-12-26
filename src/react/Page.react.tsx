import { throws } from "assert";
import * as React from "react";
import sampleFile from "../viz/sample-file";
import FileDescription from "../util/FileDescription";
import Explorer from "./Explorer.react";
import Header from "./Header.react";
import { Int } from "ts-graphviz";

type PageState = {
   files: FileDescription[],
   selectedTab: Int,
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
        this.setState((state, props) => ({
            files: [...state.files, file],
            selectedTab: state.files.length
        }));
    };

    handleCloseTab = (tab:Int) => {
        this.setState((state, props) => ({
            files: state.files.filter((f, i) => i !== tab),
            selectedTab: state.selectedTab == tab ? 0: state.selectedTab,
        }));
    };

    handleSelectTab = (tab:Int) => {
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
                <div key={i} className={["tabContent", i == this.state.selectedTab ? "selected" : null].join(' ')}><Explorer file={file} /></div>
            )}
        </div>;
    }
}
export default Page;
