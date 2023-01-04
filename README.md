# <img src="assets/icon.png" width=32 height=32 /> GraphViz Explorer
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/diegoquinteiro/viz-explorer)](/releases/latest)
[![Download](https://img.shields.io/github/downloads/diegoquinteiro/viz-explorer/total.svg?style=flat)](/releases/latest)
[![Open issues](https://img.shields.io/github/issues-raw/diegoquinteiro/viz-explorer)](/issues)

A [GraphViz DOT language](https://graphviz.org/doc/info/lang.html) editor and visualizer.

<img width="1012" alt="screenshot" src="https://user-images.githubusercontent.com/1878108/210617895-67e38dd7-d150-462a-82e1-68cc0291e2bc.png">

## Installing

Download the [latest release](/releases/lastest) and drop it on your `📁/Applications` folder.


## Usage

Open a [DOT](https://graphviz.org/doc/info/lang.html) file (`.gv`) through `File` → `Open` (or `⌘ + O`), or start writing your own file.

### Features

- Hold `Shift` and click to select multiple nodes on the graph and highlight their edges.
- Export a `PNG` of the graph with the highlighted nodes and edges for use in presentations.
- You can use the outline in the right panel to hide and show nodes, edges and subgraphs.
  - For complex graphs, you can disable showing disconnected nodes (those not connected to any other node).
- You can resize or hide the editor and outline.

## Basic DOT language

DOT is a language to describe graphs.

You can have either a `digraph` (directional graphs, where edges have an arrow) or a simple `graph`.

```dot
digraph { a -> b }
```
![digraph](https://user-images.githubusercontent.com/1878108/210628864-d6b24a3d-8831-43f2-a6a6-3b2bd5082460.png)

or


```dot
graph { a -- b }
```
![graph](https://user-images.githubusercontent.com/1878108/210628914-52feb83a-5bdc-4686-a02b-b6afa39be932.png)


Nodes can be a single `word` or `"multiple words in quotes"`:


```dot
digraph {
  "South America"
  Brazil
  
  "South America" -> Brazil
}
```
![brazil](https://user-images.githubusercontent.com/1878108/210628926-e2447e5b-1729-42b0-be5e-61497eb22db0.png)


You can also have subgraphs to organize your graph:

```dot
digraph {
  subgraph Continents {
    "North America"
    "South America"
  }
  
  subgraph Countries {
    Mexico
    USA
    Brazil
    Argentina
  }
  
  "North America" -> { Mexico, USA }
  "South America" -> { Brazil, Argentina }
}
```
![americas](https://user-images.githubusercontent.com/1878108/210628966-0e7ccc3d-2a6f-4114-8c1c-4781b7603823.png)


Subgraphs can be rendered as their own container boxes (clusters):


```dot
digraph {
  subgraph Continents {
    label="List of continents"
    cluster=true
    
    America
    Europe
    Asia
    Africa
    Oceania
    Antartica
  }
}
```
![continents](https://user-images.githubusercontent.com/1878108/210629002-fcf2f8c7-dc04-4caf-b825-2327241f60e1.png)

DOT is a very flexible language, and you can check the full documentation here: [https://graphviz.org/doc/info/lang.html](https://graphviz.org/doc/info/lang.html)



