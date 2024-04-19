import { GraphCanvas } from "./graph-canvas";
import { GraphNode } from "./graph-node";

export class Graph {
  lastNodeId = 0;

  nodes: Array<GraphNode> = [];
  nodesById: Map<number, GraphNode> = new Map();

  private canvas?: GraphCanvas;

  public attachCanvas(canvas: GraphCanvas) {
    this.canvas = canvas;
  }

  public add(node: GraphNode) {
    this.lastNodeId++;
    node.id = this.lastNodeId;
    node._graph = this;
    this.nodes.push(node);
    this.nodesById.set(node.id, node);

    if (this.canvas) {
      this.canvas.setDirty(false, true);
    }
  }

  public setDirty(dirty: boolean) {
    this.canvas?.setDirty(dirty, false);
  }
}
