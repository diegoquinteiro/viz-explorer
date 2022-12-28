import React from "react";
import electronAPI from "../api/electron-api";
import { graph, GraphBaseModel, RootGraph, RootGraphModel } from "ts-graphviz";
import VizExplorer from "../viz/viz-explorer";
import GraphViewer from "./GraphViewer";
import { Subgraph } from "./Subgraph";
import Editor from "./Editor";
import FileDescription from "../util/FileDescription";

type ExplorerProps = {
    file: FileDescription
}

type ExplorerState = {
    graphFilters: string[][],
    graphCode: string
}

class Explorer extends React.Component<ExplorerProps, ExplorerState> {
    filePathElement: React.RefObject<HTMLElement>;
    fileContentsElement: React.RefObject<HTMLDivElement>;
    renderElement: React.RefObject<HTMLDivElement>;

    constructor(props:ExplorerProps) {
        super(props);
        this.filePathElement = React.createRef();
        this.fileContentsElement = React.createRef();
        this.renderElement = React.createRef();

        this.state = {
            graphFilters: [],
            graphCode: props.file.contents,
        }
    }

    filterSubgraph = (subgraph:GraphBaseModel, path:string[]): GraphBaseModel => {
        console.log(path, this.state.graphFilters);
        subgraph.subgraphs.forEach((sub) => this.filterSubgraph(sub, [...path, sub.id]));

        this.state.graphFilters
            .filter((filter) => filter.length == path.length + 1 && filter.slice(0, path.length).every((val, i) => val == path[i]))
            .map(filter => subgraph.subgraphs.find(s => s.id == filter[filter.length - 1]))
            .forEach(filteredOut => subgraph.removeSubgraph(filteredOut));

        return subgraph;
    }

    getFilteredGraph = (): RootGraphModel => {
        if (this.state.graphFilters.some(f => f[0] == "root" && f.length == 1)) {
            return VizExplorer.parse("strict digraph {}");
        }
        let graph = VizExplorer.parse(this.state.graphCode);
        this.filterSubgraph(graph, ["root"]);
        return graph;
    }

    handleFilter = (newFilter:string[], remove:boolean):void => {
        let filter = ["root", ...newFilter];
        console.log(filter);
        if (remove) {
            this.setState((state, props) => ({
                graphFilters: state.graphFilters.filter(f => !f.every((val, i) => val == filter[i]))
            }));
        }
        else {
            this.setState((state, props) => ({
                graphFilters: [...state.graphFilters, filter]
            }));
        }
    }

    handleCodeChange = (code: string) => {
        try {
            VizExplorer.parse(code);
            this.setState({
                graphCode: code
            });
        }
        catch (e) {
            // Nothing
        }
    }

    render(): React.ReactNode {
        return (
            <div className="explorer">
                <section className="main">
                    <section className="editor">
                        <ul>
                            <Subgraph
                                graph={VizExplorer.parse(this.state.graphCode)}
                                filteredOut={this.state.graphFilters.some(f => f[0] == "root" && f.length == 1)}
                                graphFilters={this.state.graphFilters.filter(f => f[0] == "root" && f.length > 1).map(f => f.slice(1))}
                                onFilter={this.handleFilter}
                            />
                        </ul>
                        <Editor code={this.state.graphCode} onChange={this.handleCodeChange} />
                    </section>
                    <GraphViewer graph={this.getFilteredGraph()} />
                </section>
                <section className="status">
                    File: <em className="path" onClick={electronAPI.openFolder.bind(this, this.props.file.path)}>{this.props.file.path}</em>
                </section>
            </div>
        );
    }
}

export default Explorer;
