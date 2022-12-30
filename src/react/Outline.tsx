import React, { SyntheticEvent } from "react";
import VizExplorer from "../viz/viz-explorer";
import { GraphBaseModel, Edge, NodeRef } from "ts-graphviz";

type OutlineProps = {
    graph: GraphBaseModel,
    filteredOut?: boolean,
    graphFilters: string[][],
    onFilter: (filter:string[], remove:boolean) => void,
    disabled?: boolean
};
type OutlineState = {
    collapsed?: boolean,
}
export class Outline extends React.Component<OutlineProps, OutlineState> {

    constructor(props:OutlineProps, state:OutlineState) {
        super(props);
        this.state = {
            collapsed: props.graph.id ? true : false,
        }
    }

    handleFilter = (id:string, filter:string[], remove:boolean) => {
        this.props.onFilter([id, ...filter], remove);
    };

    handleChange = (items:string[]=[], e:SyntheticEvent) => {
        this.props.onFilter([...items], (e.target as HTMLInputElement).checked);
    }

    toggle = () => {
        this.setState((state) => ({
            collapsed: !state.collapsed
        }));
    }


    getEdgeRepresentation(edge:Edge) {
        return edge.targets.map(target => {
            if (Array.isArray(target)) {
                return <span className="edge-side">
                    <span className="brackets">
                        {target.map(node => <span className="edge-node">{this.getNodeRepresentation(node)}</span>)}
                     </span>
                </span>
            }
            else {
                return <span className="edge-side"><span className="edge-node">{this.getNodeRepresentation(target)}</span></span>;
            }
        });
    }
    getNodeRepresentation(node:NodeRef) {
        if (/\s/g.test(node.id)) return <span className="node-representation multi-word">"{node.id}"</span>;
        return <span className="node-representation single-word">{node.id}</span>;
    }

    render(): React.ReactNode {
        return <li className={"subgraph" + (this.props.disabled ? " disabled" : "") + (this.state.collapsed ? " collapsed" : "")}>
            <span>
                <span className="toggle" onClick={this.toggle}>▾</span>
                <input type="checkbox" checked={!this.props.filteredOut} onChange={this.handleChange.bind(this, [])} disabled={this.props.disabled} />
                <span className="glyph" onClick={this.toggle}>{ this.state.collapsed ? "📁" : "📂" }</span>
                <span className="label" onClick={this.toggle}>{this.props.graph.get("label") || this.props.graph.id || "Graph"}</span>
            </span>
            <ul>
                {this.props.graph.subgraphs
                    .map((graph, i) =>
                        <Outline
                            key={i}
                            graph={graph}
                            filteredOut={this.props.graphFilters.some(f => f[0] == "subgraph:" + graph.id && f.length == 1)}
                            graphFilters={this.props.graphFilters.filter(f => f[0] == "subgraph:" + graph.id && f.length > 1).map(f => f.slice(1))}
                            onFilter={this.handleFilter.bind(this, "subgraph:" + graph.id)}
                            disabled={this.props.disabled || this.props.filteredOut}
                        />
                )}
                {this.props.graph.edges
                    .map((edge, i) =>
                    <li key={"edge-outline" + i + VizExplorer.getEdgeId(edge)} className={"edge" + (this.props.disabled ? " disabled" : "")}>
                        <span>
                            <input
                                type="checkbox"
                                checked={!this.props.graphFilters.some(f => f[0] == "edge:" + VizExplorer.getEdgeId(edge) && f.length == 1)}
                                disabled={this.props.disabled || this.props.filteredOut}
                                onChange={this.handleChange.bind(this, ["edge:" + VizExplorer.getEdgeId(edge)])}
                            />
                            <span className="glyph">⎌</span>
                            <span className="label" title={VizExplorer.getEdgeId(edge)}>{this.getEdgeRepresentation(edge)}</span>
                        </span>
                    </li>
                )}
                {this.props.graph.nodes
                    .map((node, i) =>
                    <li key={"node-outline" + i + node.id} className={"node" + (this.props.disabled ? " disabled" : "")}>
                        <span>
                            <input
                                type="checkbox"
                                checked={!this.props.graphFilters.some(f => f[0] == "node:" + node.id && f.length == 1)}
                                disabled={this.props.disabled || this.props.filteredOut}
                                onChange={this.handleChange.bind(this, ["node:" + node.id])}
                            />
                            <span className="glyph">✪</span>
                            <span className="label">{this.getNodeRepresentation(node)}</span>
                        </span>
                    </li>
                )}
            </ul>
        </li>;
    }
}
