import { toDot, fromDot, Node, RootGraphModel, RootGraph, GraphBaseModel, NodeRef } from "ts-graphviz"

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

const VizExplorer = {
    parse,
    toString,
    toSVG,
};

export default VizExplorer;
