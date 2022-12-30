import React from "react";
import electronAPI from "../api/electron-api";
import { graph, GraphBaseModel, RootGraph, RootGraphModel, EdgeTarget } from "ts-graphviz";
import VizExplorer from "../viz/viz-explorer";
import GraphViewer from "./GraphViewer";
import { Outline } from "./Outline";
import Editor from "./Editor";
import FileDescription from "../util/FileDescription";
import Gutter from "./Gutter";

type ExplorerProps = {
    file: FileDescription,
    onFileChange?: (code:string) => void,
    onSave?: (code:string) => void,
    onSaveAs?: (code:string) => void,
}

type ExplorerState = {
    graphFilters: string[][],
    graphCode: string,
    code: string,
}

class Explorer extends React.Component<ExplorerProps, ExplorerState> {
    rootElement: React.RefObject<HTMLElement>;

    constructor(props:ExplorerProps) {
        super(props);
        this.rootElement = React.createRef();
        this.state = {
            graphFilters: [],
            graphCode: props.file.contents,
            code: props.file.contents,
        }
    }

    componentDidMount = () => {
        electronAPI.onSaveRequested(() => {
            this.props.onSave(this.state.code);
        });
        electronAPI.onSaveAsRequested(() => {
            this.props.onSaveAs(this.state.code);
        });
    };


    filterSubgraph = (subgraph:GraphBaseModel, path:string[]): GraphBaseModel => {
        const applicableFilters =
            this.state.graphFilters
                .filter((graphFilter) =>
                    graphFilter.length == path.length + 1 // Filters applicable to this nesting level
                    && graphFilter
                        .slice(0, path.length)
                        .every((val, i) => val == path[i]) // Checks if graphFilter starts with path
                )
                .map(f => f[f.length - 1]); // extracts the last part of the filter path

        applicableFilters
            .filter(f => f.startsWith("node:"))
            .map(filter => subgraph.nodes.find(n => "node:" + n.id == filter))
            .forEach(filteredOut => subgraph.removeNode(filteredOut));

        applicableFilters
            .filter(f => f.startsWith("edge:"))
            .map(filter => subgraph.edges.filter(e => "edge:" + VizExplorer.getEdgeId(e) == filter))
            .forEach(filteredOut => filteredOut.forEach(item => subgraph.removeEdge(item)));

        applicableFilters
            .filter(f => f.startsWith("subgraph:"))
            .map(filter => subgraph.subgraphs.find(s => "subgraph:" + s.id == filter))
            .forEach(filteredOut => subgraph.removeSubgraph(filteredOut));

        subgraph.subgraphs.forEach((sub) => this.filterSubgraph(sub, [...path, "subgraph:" + sub.id]));

        return subgraph;
    }

    getFilteredGraph = (): RootGraphModel => {
        if (this.state.graphFilters.some(f => f[0] == "subgraph:root" && f.length == 1)) {
            return VizExplorer.parse("strict digraph {}");
        }
        let graph;
        try {
            graph = VizExplorer.parse(this.state.graphCode);
        }
        catch (e) {
            graph = VizExplorer.parse("strict digraph {}");
        }
        this.filterSubgraph(graph, ["subgraph:root"]);
        return graph;
    }

    handleFilter = (newFilter:string[], remove:boolean):void => {
        let filter = ["subgraph:root", ...newFilter];
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
                graphCode: code,
                code: code,
            });
            this.rootElement.current.classList.remove("error");
        }
        catch (e) {
            this.setState({
                code: code,
            });
            this.rootElement.current.classList.add("error");
        }
        this.props.onFileChange(code);
    }

    render(): React.ReactNode {
        let graph;
        let error = "";
        try {
            graph = VizExplorer.parse(this.state.graphCode);
        }
        catch (e) {
            graph = VizExplorer.parse("strict digraph {}");
            error = " error"
        }
        return (
            <div className={"explorer" + error} ref={this.rootElement}>
                <section className="main">
                    <Editor code={this.state.graphCode} onChange={this.handleCodeChange} />
                    <Gutter />
                    <GraphViewer graph={this.getFilteredGraph()} />
                    <Gutter right />
                    <section className="outline">
                        <ul>
                            <Outline
                                graph={graph}
                                filteredOut={this.state.graphFilters.some(f => f[0] == "subgraph:root" && f.length == 1)}
                                graphFilters={this.state.graphFilters.filter(f => f[0] == "subgraph:root" && f.length > 1).map(f => f.slice(1))}
                                onFilter={this.handleFilter}
                            />
                        </ul>
                    </section>
                </section>
                <section className="status">
                    File: <em className="path" onClick={electronAPI.openFolder.bind(this, this.props.file.path)}>{this.props.file.path ? this.props.file.path : "(unsaved file)"}</em>
                </section>
            </div>
        );
    }
}

export default Explorer;
