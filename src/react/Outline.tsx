import React from "react";
import VizExplorer from "../viz/viz-explorer";
import { RootGraphModel } from "ts-graphviz";
import FileDescription from "../util/FileDescription";
import { Subgraph } from "./Subgraph";

type OutlineProps = {
    file: FileDescription
}

class Outline extends React.Component<OutlineProps> {
    fileContentsElement: React.RefObject<HTMLDivElement>;

    constructor(props: OutlineProps) {
        super(props);
        this.fileContentsElement = React.createRef();
    }

    getRootGraph = ():RootGraphModel => {
        return VizExplorer.parse(this.props.file.contents)
    };

    render(): React.ReactNode {
        const graph:RootGraphModel = this.getRootGraph();

        return <section className="editor">
            <div ref={this.fileContentsElement}>
            <input type='checkbox' checked /> 📄 <strong> { this.props.file.path.replace(/^.*[\\\/]/, '') } </strong>
            <ul>
                {graph.subgraphs.map((graph, i) => <Subgraph key={i} graph={graph} />)}
            </ul>
            </div>
        </section>
    }
}

export default Outline;
