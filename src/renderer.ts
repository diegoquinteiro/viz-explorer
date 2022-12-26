/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import VizExplorer from './viz/viz-explorer';
import 'svg-pan-zoom-container'
import { GraphBaseModel, NodeRef } from 'ts-graphviz';

const btn = document.getElementById('btn');
const filePathElement = document.getElementById('filePath');
const fileContentsElement = document.getElementById('fileContents');
const renderElement = document.getElementById('render');

let openPath = "/sample.dot";
let openDotString = "digraph {\n a\n b\n a -> b\n subgraph Sub {\n c\n d\n c -> d}\n}";
let renderedDot = null;

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

function renderGraph(dotString: string, path: string) {
  let dot = VizExplorer.parse(dotString);
  renderedDot = dot;
  VizExplorer.toSVG(dot).then((svg) => {
    renderElement.replaceChildren(svg);
    filePathElement.innerText = path;
    makeInteractive(svg);
  });
}


let allSelectedNodes:Set<string> = new Set();

function makeInteractive(svg:SVGSVGElement) {

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

function renderEditor(dot: GraphBaseModel, el: HTMLElement, path: string) {
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
      fileContentsElement.querySelectorAll("input").forEach((input) => { input.checked = false });
      checkbox.checked = true;
    }
    el.querySelectorAll("input").forEach((c:HTMLInputElement) => { c.checked = checkbox.checked });
    let parent = el.parentElement.parentElement;
    while (parent?.getElementsByTagName("input").length > 0 && checkbox.checked) {
      parent.getElementsByTagName("input")[0].checked = checkbox.checked;
      parent = parent.parentElement?.parentElement;
    }

    renderGraph(VizExplorer.toString(filterGraphByEditor(openDotString, fileContentsElement)), path);
  });

  let ul = el.getElementsByTagName("ul")[0] as HTMLUListElement;
  dot.subgraphs.forEach((subgraph) => {
    let li = document.createElement("li");
    li.classList.add("subgraph");
    li.setAttribute("data-dot-id", subgraph.id);
    renderEditor(subgraph, li, path);
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
  console.log(toBeRemoved);
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

renderGraph(openDotString, openPath);
renderEditor(VizExplorer.parse(openDotString), fileContentsElement, openPath);

btn.addEventListener('click', async () => {
  const fileDescription = await window.electronAPI.openFile();
  try {
    renderGraph(fileDescription.contents, fileDescription.path);
    renderEditor(VizExplorer.parse(fileDescription.contents), fileContentsElement, fileDescription.path);
    openDotString = fileDescription.contents;
    openPath = fileDescription.path;
  }
  catch (e) {
    fileContentsElement.innerText = "Invalid DOT file."
  }
});
