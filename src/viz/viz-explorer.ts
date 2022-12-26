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

let allSelectedNodes:Set<string> = new Set();

document.addEventListener('keydown', (e) => {
  if (e.key == "Shift") {
    document.body.classList.add('modifier');
  }
});
document.addEventListener('keyup', (e) => {
  if (e.key == "Shift") {
    document.body.classList.remove('modifier');
  }
});

function renderGraph(renderElement: HTMLElement, filePathElement:HTMLElement, dotString: string, path: string) {
  let dot = VizExplorer.parse(dotString);
  VizExplorer.toSVG(dot).then((svg) => {
    renderElement.replaceChildren(svg);
    filePathElement.innerText = path;
    makeInteractive(renderElement, svg);
  });
}




function makeInteractive(renderElement: HTMLElement, svg:SVGSVGElement) {

  let continuousMouseY:number = null;
  let continuousMouseX:number = null;
  let mouseY:number = null;
  let mouseX:number = null;
  let movedSinceDown = false;

  renderElement.addEventListener("mousemove", (e) => {
    continuousMouseX = e.pageX;
    continuousMouseY = e.pageY;
    let moveX = continuousMouseX - mouseX;
    let moveY = continuousMouseY - mouseY;

    if (Math.sqrt(moveX*moveX + moveY*moveY) > 2) {
      movedSinceDown = true;
    }
  });
  renderElement.addEventListener("mousedown", (e) => {
    movedSinceDown = false;
    mouseX = continuousMouseX;
    mouseY = continuousMouseY;
  });

  renderElement.addEventListener("click", (e) => {
    if (["graph0", "render"].includes((<SVGElement>e.target).parentElement.id) && !movedSinceDown) {
      allSelectedNodes = new Set();
      highlightSelected(svg);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      allSelectedNodes = new Set();
      highlightSelected(svg);
    }
  });

  svg.querySelectorAll(".node, .cluster").forEach((item) => {
    item.addEventListener("click", (e) => {
      let node = item.querySelector("title").textContent;
      if (!document.body.classList.contains("modifier")) {
        if (allSelectedNodes.has(node)) {
          allSelectedNodes = new Set();
        }
        else {
          allSelectedNodes = new Set([node]);
        }
      } else {
        if (allSelectedNodes.has(node)) {
          allSelectedNodes.delete(node);
        }
        else {
          allSelectedNodes.add(node);
        }
      }

      highlightSelected(svg);
    });
  });

  highlightSelected(svg);
}

function highlightSelected(svg: SVGSVGElement) {
  svg.querySelectorAll(".cluster, .node, .edge").forEach((i) => i.classList.remove("selected"));

  svg.querySelectorAll(".node, .cluster").forEach((i) => {
    let name = i.querySelector("title").textContent;
    if (allSelectedNodes.has(name)) {
      i.classList.toggle("selected", true);
    }
    else {
      i.classList.toggle("selected", false);
    }
  });

  svg.querySelectorAll(".edge").forEach((edge) => {
    let [from, to] = edge.querySelector("title").textContent.split("->");
    if (allSelectedNodes.has(from) && allSelectedNodes.has(to)) {
      edge.classList.toggle("selected", true);
      edge.classList.toggle("highlight", false);
    }
    else if (allSelectedNodes.has(from) || allSelectedNodes.has(to)) {
      edge.classList.toggle("highlight", true);
      edge.classList.toggle("selected", false);
    }
    else {
      edge.classList.toggle("highlight", false);
      edge.classList.toggle("selected", false);
    }
  });
}

function renderEditor(dot: GraphBaseModel, rootDot: RootGraphModel, el: HTMLElement, rootElement: HTMLElement, path: string, renderElement: HTMLElement, filePathElement: HTMLElement) {
  if (dot.id) {
    if (dot.id.endsWith("Flow")) {
      el.innerHTML = "<span class='flow'>➕ <input type='checkbox' checked /> ♾️ " + (dot.get("label") || dot.id) + "</span><ul></ul>";
    }
    else {
      el.innerHTML = "<span class='entities'>➕ <input type='checkbox' checked /> 📁 " + (dot.get("label") || dot.id) + "</span><ul></ul>";
    }

  }
  else {
    el.innerHTML = "<input type='checkbox' checked /> 📄 <strong>" + path.replace(/^.*[\\\/]/, '') + "</strong><ul></ul>";
  }

  let checkbox = el.getElementsByTagName("input")[0] as HTMLInputElement;

  checkbox.addEventListener("change", (e) => {
    if (document.body.classList.contains('modifier')) {
      rootElement.querySelectorAll("input").forEach((input) => { input.checked = false });
      checkbox.checked = true;
    }
    el.querySelectorAll("input").forEach((c:HTMLInputElement) => { c.checked = checkbox.checked });
    let parent = el.parentElement.parentElement;
    while (parent?.getElementsByTagName("input").length > 0 && checkbox.checked) {
      parent.getElementsByTagName("input")[0].checked = checkbox.checked;
      parent = parent.parentElement?.parentElement;
    }

    renderGraph(renderElement, filePathElement, VizExplorer.toString(filterGraphByEditor(VizExplorer.toString(rootDot), rootElement)), path);
  });

  let ul = el.getElementsByTagName("ul")[0] as HTMLUListElement;
  dot.subgraphs.forEach((subgraph) => {
    let li = document.createElement("li");
    li.classList.add("subgraph");
    li.setAttribute("data-dot-id", subgraph.id);
    renderEditor(subgraph, rootDot, li, rootElement, path, renderElement, filePathElement);
    ul.appendChild(li);
  });
}

function filterGraphByEditor (dotString: string, el:HTMLElement) {
  let dot = VizExplorer.parse(dotString);
  let toBeRemoved:string[] = [];
  let subgraphs = getAllSubgraphs(dot);
  el.querySelectorAll(".subgraph").forEach((subgraphElement) => {
    let checkbox = subgraphElement.querySelector("input[type='checkbox']") as HTMLInputElement;
    let dotId = subgraphElement.getAttribute("data-dot-id");
    let checked = checkbox.checked;

    if (!checked) {
      toBeRemoved.push(dotId);
    }
  });
  el.querySelectorAll(".subgraph").forEach((subgraphElement) => {
    let checkbox = subgraphElement.querySelector("input[type='checkbox']") as HTMLInputElement;
    let dotId = subgraphElement.getAttribute("data-dot-id");
    let checked = checkbox.checked;

    if (checked) {
      let edges = findSubgraph(dot, dotId).edges;
      edges.forEach((edge) => {
        subgraphs.forEach((subgraph) => {;
          edge.targets.forEach((target) => {
            let nodeRef = target as NodeRef;
            if ((getAllNodeIds(subgraph).indexOf(nodeRef.id) != -1)) {
              if (toBeRemoved.indexOf(subgraph.id) != -1) {
                toBeRemoved.splice(toBeRemoved.indexOf(subgraph.id), 1);
                let checkbox = el.querySelectorAll(".subgraph[data-dot-id='" + subgraph.id + "'] input")[0] as HTMLInputElement;
                checkbox.checked = true;
              }
            }
          });
        });
      });
    }
  });
  toBeRemoved.forEach((subgraph) => removeSubgraph(dot, subgraph));
  return dot;
}

function getAllNodeIds(dot: GraphBaseModel): string[] {
  let ids:string[] = [];
  dot.nodes.forEach((node) => ids.push(node.id));
  dot.subgraphs.forEach((subgraph) => {
    getAllNodeIds(subgraph).forEach((nodeId) => ids.push(nodeId));
  });
  return ids;
}

function getAllSubgraphs(dot: GraphBaseModel): GraphBaseModel[] {
  let subgraphs:GraphBaseModel[] = [];
  subgraphs.push(dot);
  dot.subgraphs.forEach((subgraph) => {
    getAllSubgraphs(subgraph).forEach((item) => subgraphs.push(item));
  });
  return subgraphs;
}

function findSubgraph(dot: GraphBaseModel, dotId: string) {
  if (dot.getSubgraph(dotId)) return dot.getSubgraph(dotId);
  let ret = null;
  dot.subgraphs.forEach((subgraph) => {
    let found = findSubgraph(subgraph, dotId);
    if (found) ret = found;
  });
  return ret;
}

function removeSubgraph(dot: GraphBaseModel, dotId: string) {
  dot.removeSubgraph(dot.getSubgraph(dotId));
  dot.subgraphs.forEach((subgraph) => removeSubgraph(subgraph, dotId));
}

const VizExplorer = {
    parse,
    toString,
    toSVG,
    renderGraph,
    renderEditor,
};

export default VizExplorer;
