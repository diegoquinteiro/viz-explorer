import React from "react";
import { GraphBaseModel } from "ts-graphviz";

type SubgraphProps = {
    graph: GraphBaseModel;
};
export class Subgraph extends React.Component<SubgraphProps> {
    render(): React.ReactNode {
        const className = this.props.graph.id.endsWith("Flow") ? "flow" : "entities";

        return <li className="subgraph">
            <span className={className}>
                ➕ <input type="checkbox" checked />
                {className == "flow" ? " ♾️ " : " 📁 "}
                {this.props.graph.get("label") || this.props.graph.id}
            </span>
            <ul>
                {this.props.graph.subgraphs.map((graph, i) => <Subgraph key={i} graph={graph} />)}
            </ul>
        </li>;
    }
}
