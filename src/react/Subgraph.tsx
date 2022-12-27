import React, { SyntheticEvent } from "react";
import { GraphBaseModel } from "ts-graphviz";

type SubgraphProps = {
    graph: GraphBaseModel,
    filteredOut?: boolean,
    graphFilters: number[][],
    onFilter: (filter:number[], remove:boolean) => void,
    disabled?: boolean
};
export class Subgraph extends React.Component<SubgraphProps> {

    handleFilter = (i:number, filter:number[], remove:boolean) => {
        this.props.onFilter([i, ...filter], remove);
    };

    handleOnChange = (e:SyntheticEvent) => {
        this.props.onFilter([], (e.target as HTMLInputElement).checked);
    }

    render(): React.ReactNode {
        const className = this.props.graph.id ? this.props.graph.id.endsWith("Flow") ? "flow" : "entities" : "flow";

        return <li className={"subgraph" + (this.props.disabled ? " disabled" : "")}>
            <span className={className}>
                ➕ <input type="checkbox" checked={!this.props.filteredOut} onChange={this.handleOnChange} disabled={this.props.disabled} />
                {className == "flow" ? " ♾️ " : " 📁 "}
                <span className="label">{this.props.graph.get("label") || this.props.graph.id || "Root"}</span>
            </span>
            <ul>
                {this.props.graph.subgraphs
                    .map((graph, i) =>
                        <Subgraph
                            key={i}
                            graph={graph}
                            filteredOut={this.props.graphFilters.some(f => f[0] == i && f.length == 1)}
                            graphFilters={this.props.graphFilters.filter(f => f[0] == i && f.length > 1).map(f => f.slice(1))}
                            onFilter={this.handleFilter.bind(this, i)}
                            disabled={this.props.disabled || this.props.filteredOut}
                        />
                )}
            </ul>
        </li>;
    }
}
