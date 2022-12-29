import React, { MouseEvent } from "react";

class Gutter extends React.Component<{ right?: boolean }, { elementWidth?: number }>{
    isDragging: boolean;
    element: React.RefObject<HTMLDivElement>

    constructor(props:{ right?: boolean }) {
        super(props);
        this.element = React.createRef();
        this.state = {};
    }

    componentDidMount(): void {
        window.addEventListener("mouseup", this.handleMouseUp);
        window.addEventListener("mousemove", this.handleMouseMove);
    }

    componentWillUnmount(): void {
        window.removeEventListener("mouseup", this.handleMouseUp);
        window.removeEventListener("mousemove", this.handleMouseMove)
    }

    handleMouseUp = (e: globalThis.MouseEvent) => {
        this.isDragging = false;
    }
    handleMouseMove = (e: globalThis.MouseEvent) => {
        if (this.isDragging) {
            let offset = e.movementX;
            let previous = (this.element.current.previousElementSibling as HTMLElement);
            let next = (this.element.current.nextElementSibling as HTMLElement);
            let previousWidth = previous.offsetWidth;
            let nextWidth = next.offsetWidth;

            if (this.props.right) this.setElementWidth(next, nextWidth - offset);
            else this.setElementWidth(previous, previousWidth + offset);
        }
    }

    setElementWidth = (element: HTMLElement, width:number) => {
        let setWidth = width;
        if (width < 20 && width < element.offsetWidth) setWidth = 0;
        element.style.minWidth = setWidth + "px";
        element.style.maxWidth = setWidth + "px";
        // element.style.width = setWidth + "px";
        // element.style.flexBasis = setWidth + "px";
        window.dispatchEvent(new Event('resize'));
        this.setState({
            elementWidth: setWidth
        });
    }

    handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        this.isDragging = true;
    };

    handleDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
        if (this.props.right) {
            if (this.element.current.nextElementSibling.getAttribute("style")) {
                this.element.current.nextElementSibling.removeAttribute("style");
            }
            else {
                this.setElementWidth(this.element.current.nextElementSibling as HTMLElement, 0);
            }
        }
        else {
            if (this.element.current.previousElementSibling.getAttribute("style")) {
                this.element.current.previousElementSibling.removeAttribute("style");
            }
            else {
                this.setElementWidth(this.element.current.previousElementSibling as HTMLElement, 0);
            }
        }
        window.dispatchEvent(new Event('resize'));
        this.setState({
            elementWidth: undefined
        })
    };


    render(): React.ReactNode {
        const state = (this.state.elementWidth === 0) ? "collapsed" : "normal";
        return <div
            className={["gutter", state].join(" ")}
            onMouseDown={this.handleMouseDown}
            onDoubleClick={this.handleDoubleClick}
            ref={this.element} />
    }
}

export default Gutter;
