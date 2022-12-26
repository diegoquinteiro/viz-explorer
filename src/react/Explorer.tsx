import React from "react";
import { RootGraphModel } from "ts-graphviz";
import FileDescription from "../util/FileDescription";
import VizExplorer from "../viz/viz-explorer";
import Outline from "./Outline";

type ExplorerProps = {
    file: FileDescription,
}

class Explorer extends React.Component<ExplorerProps> {
    filePathElement: React.RefObject<HTMLElement>;
    fileContentsElement: React.RefObject<HTMLDivElement>;
    renderElement: React.RefObject<HTMLDivElement>;

    constructor(props:ExplorerProps) {
        super(props);
        this.filePathElement = React.createRef();
        this.fileContentsElement = React.createRef();
        this.renderElement = React.createRef();
    }

    componentDidMount(): void {
        this.renderGraph();
    }

    componentDidUpdate(): void {
        this.renderGraph();
    }

    renderGraph = () => {
        const filePathElement = this.filePathElement.current;
        const renderElement = this.renderElement.current;

        let rootGraph: RootGraphModel = null;
        try {
            rootGraph = VizExplorer.parse(this.props.file.contents);
        }
        catch {
            alert("Invalid GraphViz DOT file.");
        }

        VizExplorer.renderGraph(renderElement, filePathElement, this.props.file.contents, this.props.file.path);
        //VizExplorer.renderEditor(rootGraph, rootGraph, fileContentsElement, fileContentsElement, this.props.file.path, renderElement, filePathElement);
    };

    render(): React.ReactNode {
        return (
            <div className="explorer">
                <section className="main">
                    <Outline file={this.props.file} />
                    <section className="viewer">
                        <div className="render" data-zoom-on-wheel="min-scale: 0.3; max-scale: 20;" data-pan-on-drag ref={this.renderElement}></div>
                    </section>
                </section>
                <section className="status">
                    File: <em ref={this.filePathElement}>{this.props.file.path}</em>
                </section>
            </div>
        );
    }
}

export default Explorer;
