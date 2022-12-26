import * as React from "react";
import FileDescription from "../util/FileDescription";
import VizExplorer from "../viz/viz-explorer";
import Header from "./Header.react";

class Page extends React.Component<{}> {
    filePathElement: React.RefObject<HTMLElement>;
    fileContentsElement: React.RefObject<HTMLDivElement>;
    renderElement: React.RefObject<HTMLDivElement>;

    constructor(props: {}) {
        super(props);
        this.filePathElement = React.createRef();
        this.fileContentsElement = React.createRef();
        this.renderElement = React.createRef();
    }

    handleFileOpen = (fileDescription: FileDescription) => {
        const filePathElement = this.filePathElement.current;
        const fileContentsElement = this.fileContentsElement.current;
        const renderElement = this.renderElement.current;

        try {
            const fileDot = VizExplorer.parse(fileDescription.contents);
            VizExplorer.renderGraph(renderElement, filePathElement, fileDescription.contents, fileDescription.path);
            VizExplorer.renderEditor(fileDot, fileDot, fileContentsElement, fileContentsElement, fileDescription.path, renderElement, filePathElement);
        }
        catch (e) {
            fileContentsElement.innerText = "Invalid DOT file."
        }
    };

    render() {
        return <div className="page">
            <Header onFileOpen={this.handleFileOpen}/>

            <section id="main">
                <section id="editor">
                    <div id="fileContents" ref={this.fileContentsElement}></div>
                </section>
                <section id="viewer">
                    <div id="render" data-zoom-on-wheel="min-scale: 0.3; max-scale: 20;" data-pan-on-drag ref={this.renderElement}></div>
                </section>
            </section>

            <section id="status">
                File: <em id="filePath" ref={this.filePathElement}></em>
            </section>
        </div>;
    }
}
export default Page;
