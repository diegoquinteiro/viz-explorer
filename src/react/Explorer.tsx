import React from "react";
import { GraphBaseModel, RootGraph, RootGraphModel } from "ts-graphviz";
import VizExplorer from "../viz/viz-explorer";
import GraphViewer from "./GraphViewer";
import { Subgraph } from "./Subgraph";

type ExplorerProps = {
    graph: RootGraphModel,
    name: string,
}

type ExplorerState = {
    graphFilters: number[][]
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
        }
    }

    // componentDidMount(): void {
    //     this.renderGraph();
    // }

    // componentDidUpdate(): void {
    //     this.renderGraph();
    // }

    filterSubgraph = (subgraph:GraphBaseModel, path:number[]): GraphBaseModel => {
        subgraph.subgraphs.forEach((subgraph, i) => this.filterSubgraph(subgraph, [...path, i]));
        this.state.graphFilters
            .filter((filter) => filter.length == path.length + 1 && filter.slice(0, path.length).every((val, i) => val == path[i]))
            .map(filter => subgraph.subgraphs[filter[filter.length - 1]])
            .forEach(filteredOut => subgraph.removeSubgraph(filteredOut));
        return subgraph;
    }

    getFilteredGraph = (): RootGraphModel => {
        if (this.state.graphFilters.some(f => f[0] == 0 && f.length == 1)) {
            return VizExplorer.parse("strict digraph {}");
        }
        let graph = VizExplorer.parse(VizExplorer.toString(this.props.graph));
        this.filterSubgraph(graph, [0]);
        return graph;
    }

    // renderGraph = ():void => {
    //     const renderElement = this.renderElement.current;
    //     VizExplorer.renderGraph(renderElement, this.getFilteredGraph(), this.props.name);
    // };

    handleFilter = (newFilter:number[], remove:boolean):void => {
        let filter = [0, ...newFilter];
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

    render(): React.ReactNode {
        return (
            <div className="explorer">
                <section className="main">
                    <section className="editor">
                        <ul>
                            <Subgraph
                                graph={this.props.graph}
                                filteredOut={this.state.graphFilters.some(f => f[0] == 0 && f.length == 1)}
                                graphFilters={this.state.graphFilters.filter(f => f[0] == 0 && f.length > 1).map(f => f.slice(1))}
                                onFilter={this.handleFilter}
                            />
                        </ul>
                    </section>
                    {/* <section className="viewer">
                        <div className="render" data-zoom-on-wheel="min-scale: 0.3; max-scale: 20;" data-pan-on-drag ref={this.renderElement}></div>
                    </section> */}
                    <GraphViewer graph={this.getFilteredGraph()} />
                </section>
                <section className="status">
                    File: <em>{this.props.name}</em>
                </section>
            </div>
        );
    }
}

export default Explorer;
