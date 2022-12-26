import * as React from "react";
import * as ReactDOM from "react-dom";
import VizExplorer from "../viz/viz-explorer";

let openDotString = "digraph {\n a\n b\n a -> b\n subgraph Sub {\n c\n d\n c -> d}\n}";
let openPath = "/sample.dot";

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

    componentDidMount(): void {
        let filePathElement = this.filePathElement.current;
        let fileContentsElement = this.fileContentsElement.current;
        let renderElement = this.renderElement.current;
        let dot = VizExplorer.parse(openDotString);

        VizExplorer.renderGraph(renderElement, filePathElement, openDotString, openPath);
        VizExplorer.renderEditor(dot, dot, fileContentsElement, fileContentsElement, openPath, renderElement, filePathElement);
        let btn = document.getElementById('btn');

        btn.addEventListener('click', async () => {
            const fileDescription = await window.electronAPI.openFile();
            try {
                const fileDot = VizExplorer.parse(fileDescription.contents);
                VizExplorer.renderGraph(renderElement, filePathElement, fileDescription.contents, fileDescription.path);
                VizExplorer.renderEditor(fileDot, fileDot, fileContentsElement, fileContentsElement, fileDescription.path, renderElement, filePathElement);
                openDotString = fileDescription.contents;
                openPath = fileDescription.path;
            }
            catch (e) {
                fileContentsElement.innerText = "Invalid DOT file."
            }
        });

    }
    render() {
        return <div className="page">
            <section id="header">
                <h1>📁 GraphViz Explorer</h1>
                <button type="button" id="btn">Open a File</button>
            </section>
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
