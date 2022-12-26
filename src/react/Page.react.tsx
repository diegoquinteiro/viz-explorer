import { throws } from "assert";
import * as React from "react";
import sampleFile from "../viz/sample-file";
import FileDescription from "../util/FileDescription";
import Explorer from "./Explorer.react";
import Header from "./Header.react";

type PageState = {
   files: FileDescription[],
}
class Page extends React.Component<{}, PageState> {


    constructor(props: {}) {
        super(props);
        this.state = {
            files: [sampleFile],
        }
    }

    handleFileOpen = (file: FileDescription) => {
        this.setState((state, props) => ({
            files: [file]
        }));
    };

    render(): React.ReactNode {
        return <div className="page">
            <Header onFileOpen={this.handleFileOpen}/>
            <Explorer file={this.state.files[0]} />
        </div>;
    }
}
export default Page;
