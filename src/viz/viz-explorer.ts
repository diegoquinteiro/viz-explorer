import { toDot, fromDot, Node, RootGraphModel, RootGraph, GraphBaseModel, NodeRefGroup, NodeRef, Edge } from "ts-graphviz"

function parse(dot: string): RootGraphModel {
    return fromDot(dot);
}

function toString(root: RootGraphModel): string {
    return toDot(root);
}

async function toSVG(root: RootGraphModel): Promise<SVGSVGElement> {
    const GraphvizModule = await import("@hpcc-js/wasm/graphviz");
    const graphviz = await GraphvizModule.Graphviz.load();

    const dotString = toString(root);
    const svgString = graphviz.dot(dotString);

    const parser = new DOMParser();
    return parser.parseFromString(svgString, "image/svg+xml").documentElement as unknown as SVGSVGElement;
}

function getEdgeId(edge:Edge) {
    return edge.targets.map(target => {
        if (Array.isArray(target)) {
            return `{ ${target.map(node => formatNodeId(node.id)).join(", ")} }`;
        }
        else {
            return formatNodeId(target.id);
        }
    }).join(" ⇾ ");
}

function formatNodeId(id:string) {
    if (/\s/g.test(id)) return `"${id}"`;
    return id;
}

const VizExplorer = {
    parse,
    toString,
    toSVG,
    getEdgeId,
    formatNodeId,
};

export default VizExplorer;
