import { GraphCanvas } from "./graph-canvas";
import "./style.css";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const graph = new GraphCanvas("canvas");
// (window as any).graph = graph;

// document.body.appendChild(graph.bgCanvas);
