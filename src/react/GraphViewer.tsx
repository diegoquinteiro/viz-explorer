import React, { ComponentType } from "react"
import VizExplorer from "../viz/viz-explorer"
import { RootGraphModel } from "ts-graphviz"
import Async from 'react-async';
import { pan, zoom, getScale, setScale, resetScale } from 'svg-pan-zoom-container';
import { getScaleAndOffset, setScaleAndOffset } from '../util/svg-pan-zoom-utils'

type GraphViewerProps = {
    graph: RootGraphModel
}

type GraphViewerState = {
    selectedNodes: Set<string>,
    modifier?: boolean,
}
type Snapshot = [number, number, number];

class GraphViewer extends React.Component<GraphViewerProps, GraphViewerState> {

    svgContainer: React.RefObject<HTMLDivElement>;
    selectedNodes: string[];
    snapshot?: Snapshot;

    constructor(props:GraphViewerProps) {
        super(props);
        this.svgContainer = React.createRef();
        this.state = {
            selectedNodes: new Set<string>()
        };
    }

    componentDidMount(): void {
        document.addEventListener('keydown', (e) => {
            if (e.key == "Shift") {
                this.setState({ modifier: true });
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.key == "Shift") {
                this.setState({ modifier: false });
            }
        });
    }

    makeInteractive = (): void => {
        if (this.snapshot) {
            setScaleAndOffset(this.svgContainer.current, this.svgContainer.current.firstChild as SVGSVGElement, ...this.snapshot);
        }
        this.handleCancelActions();
        this.highlightSelected();

        const svg = this.svgContainer.current?.firstChild as SVGSVGElement;

        svg.querySelectorAll(".node, .cluster").forEach((item) => {
            item.addEventListener("click", (e) => {
                let node = item.querySelector("title").textContent;
                if (!this.state.modifier) {
                    if (this.state.selectedNodes.has(node)) {
                        this.setState({
                            selectedNodes: new Set<string>()
                        }, this.highlightSelected);
                    }
                    else {
                        this.setState({
                            selectedNodes: new Set<string>([node])
                        }, this.highlightSelected);
                    }
                } else {
                    if (this.state.selectedNodes.has(node)) {
                        this.setState((state:GraphViewerState) => ({
                            selectedNodes: new Set<string>([...state.selectedNodes].filter(n => n != node))
                        }), this.highlightSelected);
                    }
                    else {
                        this.setState((state:GraphViewerState) => ({
                            selectedNodes: new Set<string>([...state.selectedNodes, node])
                        }), this.highlightSelected);
                    }
                }
            });
        });
    }

    handleCancelActions = () => {
        let continuousMouseY: number = null;
        let continuousMouseX: number = null;
        let mouseY: number = null;
        let mouseX: number = null;
        let movedSinceDown = false;
        let svgContainer = this.svgContainer.current;

        svgContainer.addEventListener("mousemove", (e) => {
            continuousMouseX = e.pageX;
            continuousMouseY = e.pageY;
            let moveX = continuousMouseX - mouseX;
            let moveY = continuousMouseY - mouseY;

            if (Math.sqrt(moveX * moveX + moveY * moveY) > 2) {
                movedSinceDown = true;
            }
        });
        svgContainer.addEventListener("mousedown", (e) => {
            movedSinceDown = false;
            mouseX = continuousMouseX;
            mouseY = continuousMouseY;
        });

        svgContainer.addEventListener("click", (e) => {
            if (["graph0", "render"].includes((e.target as SVGElement).parentElement.id) && !movedSinceDown) {
                this.setState({
                    selectedNodes: new Set<string>()
                }, this.highlightSelected);
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.setState({
                    selectedNodes: new Set<string>()
                }, this.highlightSelected);
            }
        });
    }


    highlightSelected = () => {
        const svg = this.svgContainer.current?.firstChild as SVGSVGElement;
        svg.querySelectorAll(".cluster, .node, .edge").forEach((i) => i.classList.remove("selected"));

        svg.querySelectorAll(".node, .cluster").forEach((i) => {
            let name = i.querySelector("title").textContent;
            if (this.state.selectedNodes.has(name)) {
                i.classList.toggle("selected", true);
            }
            else {
                i.classList.toggle("selected", false);
            }
        });

        svg.querySelectorAll(".edge").forEach((edge) => {
            let [from, to] = edge.querySelector("title").textContent.split("->");
            if (this.state.selectedNodes.has(from) && this.state.selectedNodes.has(to)) {
                edge.classList.toggle("selected", true);
                edge.classList.toggle("highlight", false);
            }
            else if (this.state.selectedNodes.has(from) || this.state.selectedNodes.has(to)) {
                edge.classList.toggle("highlight", true);
                edge.classList.toggle("selected", false);
            }
            else {
                edge.classList.toggle("highlight", false);
                edge.classList.toggle("selected", false);
            }
        });
    }

    componentDidUpdate(): void {
        this.highlightSelected();
    }

    shouldComponentUpdate(nextProps: Readonly<GraphViewerProps>, nextState: Readonly<GraphViewerState>, nextContext: any): boolean {
        this.snapshot = getScaleAndOffset(this.svgContainer.current, this.svgContainer.current.firstChild as SVGSVGElement);
        if (nextProps.graph != this.props.graph) return true;
        return false;
    }

    render(): React.ReactNode {
        const renderSVG = async (): Promise<SVGSVGElement> => {
            return await VizExplorer.toSVG(this.props.graph);
        };

        return (
            <section className="viewer">
                <Async fallback={<div>Loading...</div>} promiseFn={renderSVG} onResolve={this.makeInteractive}>
                    {({ data, error, isPending }) => {
                        if (isPending) return "Loading...";
                        if (error) return `Something went wrong: ${error.message}`;
                        if (data) return <div
                                className="render"
                                data-zoom-on-wheel="min-scale: 0.5; max-scale: 10;"
                                data-pan-on-drag
                                dangerouslySetInnerHTML={{"__html": data.outerHTML}}
                                ref={this.svgContainer}
                            />;
                        return null;
                    }}
                </Async>
            </section>
        );
    }
}

export default GraphViewer
