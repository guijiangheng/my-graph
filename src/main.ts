import { Graph } from "./graph";
import { GraphCanvas } from "./graph-canvas";
import { GraphNode } from "./graph-node";
import { registerNodeType } from "./lib";

import "./style.css";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class SumNode extends GraphNode {
  static title = "Sum";

  constructor() {
    super();

    this.addInput("A", "number");
    this.addInput("B", "number");
  }
}

registerNodeType("basic/sum", SumNode);

const graph = new Graph();

const node = new SumNode();
node.position = [200, 200];
graph.add(node);

const graphCanvas = new GraphCanvas("canvas", graph);
(window as any).graph = graphCanvas;

// document.body.appendChild(graph.bgCanvas);
