import React, { SyntheticEvent } from "react";
import electronAPI from "../api/electron-api";
// @ts-ignore
import { GraphBaseModel, RootGraph, RootGraphModel, EdgeTarget, Edge } from "ts-graphviz";
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
    showDisconnectedNodes: boolean,
}

class Explorer extends React.Component<ExplorerProps, ExplorerState> {
    rootElement: React.RefObject<HTMLDivElement>;

    constructor(props:ExplorerProps) {
        super(props);
        this.rootElement = React.createRef();
        this.state = {
            graphFilters: [],
            graphCode: props.file.contents,
            code: props.file.contents,
            showDisconnectedNodes: true,
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

    filterHiddenEdges = (subgraph:GraphBaseModel, hiddenNodeIds:string[]): void => {
        let edgesToCreate:Edge[] = [];
        subgraph.edges
            .forEach(edge => {
                // Gets all valid targets, those who doesn't point to a hiden node
                let targets = edge.targets.map(target => {
                    if (Array.isArray(target)) {
                        return target.filter(node => !hiddenNodeIds.some(id => id == node.id));
                    }
                    else if (hiddenNodeIds.some(id => id == target.id)) {
                        return [];
                    }
                    return target;
                });

                // The following algorithm will break the original edges
                // into several edges if they're discontinued by hidden nodes.
                //
                // By the previous loop, all hidden nodes will become an empty
                // array ([]).
                //
                // Example, the edge:
                // a -> b -> c -> d -> e
                //
                // if node c is hidden, will at this point be:
                // a -> b -> [] -> d -> e
                //
                // and will become two edges:
                // a -> b
                // d -> e
                let newEdgeTargets = [];
                targets.forEach((target, i) => {
                    if (Array.isArray(target) && target.length == 0) {
                        if (newEdgeTargets.length > 1) {
                            // @ts-ignore
                            edgesToCreate.push(new Edge([targets[0], targets[1], ...targets.slice(2)], edge.attributes.values));
                        }
                        newEdgeTargets = [];
                    }
                    else {
                        newEdgeTargets.push(target);
                    }
                });
                if (newEdgeTargets.length > 1) {
                    // @ts-ignore
                    edgesToCreate.push(new Edge([targets[0], targets[1], ...targets.slice(2)], edge.attributes.values));
                }
            });

        // Recreates all edges
        subgraph.edges.forEach(edge => subgraph.removeEdge(edge));
        edgesToCreate.forEach(edge => subgraph.addEdge(edge));

        subgraph.subgraphs.forEach((sub) => this.filterHiddenEdges(sub, hiddenNodeIds));
    }

    filterDisconnectedNodes = (subgraph:GraphBaseModel, connectedNodeIds:string[]):string[] => {
        const disconnectedNodes = subgraph.nodes
            .filter(node => !connectedNodeIds.some(id => id == node.id));

        const disconnectedNodesIds = disconnectedNodes.map(node => node.id);

        if (!this.state.showDisconnectedNodes) {
            disconnectedNodes.forEach(node => subgraph.removeNode(node));
        }
        return [...disconnectedNodesIds, ...subgraph.subgraphs.map(s => this.filterDisconnectedNodes(s, connectedNodeIds)).flat()];
    }

    getAllNodeIds = (subgraph:GraphBaseModel):string[] => {
        return [...subgraph.nodes.map(n => n.id), ...subgraph.subgraphs.map(s => this.getAllNodeIds(s)).flat()];
    }

    getAllConnectedNodeIds = (subgraph:GraphBaseModel):string[] => {
        return [...subgraph.edges.map(e => this.getTargetedNodeIds(e)).flat(), ...subgraph.subgraphs.map(s => this.getAllConnectedNodeIds(s)).flat()];
    }

    getTargetedNodeIds = (edge:Edge):string[] => {
        return edge.targets.map(target => {
            if (Array.isArray(target)) {
                return target.map(t => t.id);
            }
            else {
                return target.id;
            }
        }).flat();
    }

    getFilteredGraph = (): { graph:RootGraphModel, hiddenNodeIds:string[], disconnectedNodeIds:string[] } => {
        if (this.state.graphFilters.some(f => f[0] == "subgraph:graph" && f.length == 1)) {
            return { graph: VizExplorer.parse("strict digraph {}"),  hiddenNodeIds:[], disconnectedNodeIds: [] };
        }
        let graph;
        try {
            graph = VizExplorer.parse(this.state.graphCode);
        }
        catch (e) {
            graph = VizExplorer.parse("strict digraph {}");
        }

        const originalNodeIds = this.getAllNodeIds(graph);
        this.filterSubgraph(graph, ["subgraph:graph"]);
        const filteredNodeIds = this.getAllNodeIds(graph);

        let hiddenNodeIds = originalNodeIds.filter(node => !filteredNodeIds.find(n => n == node));
        this.filterHiddenEdges(graph, hiddenNodeIds);

        let disconnectedNodeIds:string[] = [];
        disconnectedNodeIds = this.filterDisconnectedNodes(graph, this.getAllConnectedNodeIds(graph));
        if (!this.state.showDisconnectedNodes) {
            hiddenNodeIds = [...hiddenNodeIds, ...disconnectedNodeIds];
        }

        return { graph, hiddenNodeIds, disconnectedNodeIds } ;
    }

    handleFilter = (newFilter:string[], remove:boolean):void => {
        let filter = ["subgraph:graph", ...newFilter];
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

    toggleshowDisconnectedNodes = (e:SyntheticEvent) => {
        this.setState({
            showDisconnectedNodes: (e.target as HTMLInputElement).checked,
        });
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
        let filteredGraph = this.getFilteredGraph();
        return (
            <div className={"explorer" + error} ref={this.rootElement}>
                <section className="main">
                    <Editor code={this.state.graphCode} onChange={this.handleCodeChange} />
                    <Gutter />
                    <GraphViewer graph={filteredGraph.graph} />
                    <Gutter right />
                    <section className="outline">
                        <ul>
                            <Outline
                                graph={graph}
                                filteredOut={this.state.graphFilters.some(f => f[0] == "subgraph:graph" && f.length == 1)}
                                graphFilters={this.state.graphFilters.filter(f => f[0] == "subgraph:graph" && f.length > 1).map(f => f.slice(1))}
                                hiddenNodeIds={filteredGraph.hiddenNodeIds}
                                onFilter={this.handleFilter}
                            />
                        </ul>
                        <div className="tools">
                            <span className="showDisconnectedNodes" data-has-disconnected-nodes={filteredGraph.disconnectedNodeIds.length > 0}>
                                <input type="checkbox" onChange={this.toggleshowDisconnectedNodes} checked={this.state.showDisconnectedNodes} />
                                <span>Show disconnected nodes</span>
                            </span>
                        </div>
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
