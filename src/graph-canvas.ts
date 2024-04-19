import { DragScaleHelper } from "./drag-scale-helper";
import { Graph } from "./graph";
import { GraphNode } from "./graph-node";

const CLEAR_BG_COLOR = "#222";
const CANVAS_BORDER_COLOR = "#235";
const NODE_TEXT_SIZE = 14;
const NODE_SUBTEXT_SIZE = 12;
const NODE_TITLE_HEIGHT = 30;
const ROUND_RADIUS = 8;
const DOT_SIZE = 10;
const DEFAULT_SHADOW_COLOR = "#rgba(0, 0, 0, 0.5)";

const NODE_DEFAULT_COLOR = "#333";
const NODE_DEFAULT_BGCOLOR = "#353535";

const BACKGROUND_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQBJREFUeNrs1rEKwjAUhlETUkj3vP9rdmr1Ysammk2w5wdxuLgcMHyptfawuZX4pJSWZTnfnu/lnIe/jNNxHHGNn//HNbbv+4dr6V+11uF527arU7+u63qfa/bnmh8sWLBgwYJlqRf8MEptXPBXJXa37BSl3ixYsGDBMliwFLyCV/DeLIMFCxYsWLBMwSt4Be/NggXLYMGCBUvBK3iNruC9WbBgwYJlsGApeAWv4L1ZBgsWLFiwYJmCV/AK3psFC5bBggULloJX8BpdwXuzYMGCBctgwVLwCl7Be7MMFixYsGDBsu8FH1FaSmExVfAxBa/gvVmwYMGCZbBg/W4vAQYA5tRF9QYlv/QAAAAASUVORK5CYII=";

class Profiler {
  constructor(
    public elapsed = 0,
    public lastTick = 0,
    public frame = 0
  ) {}

  tick() {
    const now = performance.now();
    this.elapsed = now - this.lastTick;
    this.lastTick = now;
    this.frame++;
  }
}

export class GraphCanvas {
  private profiler: Profiler = new Profiler();

  private graph: Graph;

  private ctx: CanvasRenderingContext2D;

  private canvas: HTMLCanvasElement;
  private bgCanvas: HTMLCanvasElement;

  private pattern?: CanvasPattern;
  private bgImage?: HTMLImageElement;

  private dirtyBgCanvas = true;
  private dirtyFrontCanvas = true;

  private dragScaleHelper: DragScaleHelper;

  constructor(id: string, graph: Graph) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    canvas.tabIndex = 1;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    const bgCanvas = document.createElement("canvas");
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    this.bgCanvas = bgCanvas;

    this.dragScaleHelper = new DragScaleHelper(canvas);
    this.graph = graph;

    this.graph.attachCanvas(this);

    this.startRendering();
  }

  public setDirty(bgDirty: boolean, fgDirty: boolean): void {
    this.dirtyBgCanvas = bgDirty;
    this.dirtyFrontCanvas = fgDirty;
  }

  private startRendering() {
    const that = this;

    (function render() {
      that.profiler.tick();
      that.draw();
      requestAnimationFrame(render);
    })();
  }

  private draw() {
    const { dragScaleHelper: ds } = this;

    const lowQuality = ds.scale < 0.6;

    if (this.dirtyBgCanvas) {
      this.drawBackCanvas(lowQuality);
      // this.dirtyBgCanvas = false;
    }

    if (this.dirtyFrontCanvas) {
      this.drawFrontCanvas(lowQuality);
      // this.dirtyFrontCanvas = false;
    }
  }

  private drawBackCanvas(lowQuality: boolean) {
    const { bgCanvas: canvas, dragScaleHelper: ds } = this;

    const ctx = canvas.getContext("2d")!;

    ctx.save();
    ds.apply(ctx);

    const viewport = ds.computeViewport();

    ctx.fillStyle = CLEAR_BG_COLOR;
    ctx.fillRect(...viewport);

    if (ds.scale > 0.5) {
      this.drawPattern(viewport);
    }

    ctx.strokeStyle = CANVAS_BORDER_COLOR;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  }

  private drawFrontCanvas(lowQuality: boolean) {
    const { ctx, canvas, dragScaleHelper: ds } = this;

    ctx.save();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.bgCanvas, 0, 0);

    this.drawInfo();

    ds.apply(ctx);

    for (const node of this.graph.nodes) {
      this.drawNode(node, ctx, lowQuality);
    }

    ctx.restore();
  }

  private drawPattern(viewport: [number, number, number, number]) {
    const { bgCanvas: canvas } = this;

    const ctx = canvas.getContext("2d")!;

    if (!this.bgImage) {
      const bgImage = new Image();
      bgImage.src = BACKGROUND_IMAGE;

      bgImage.onload = () => {
        this.dirtyBgCanvas = true;
      };

      this.bgImage = bgImage;
    }

    if (!this.pattern && this.bgImage.width > 0) {
      this.pattern = ctx.createPattern(this.bgImage, "repeat")!;
    }

    if (this.pattern) {
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = this.pattern;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(...viewport);
      ctx.globalAlpha = 1;
    }
  }

  private drawInfo() {
    const { canvas, ctx, profiler } = this;

    ctx.save();
    ctx.translate(10, canvas.height - 80);

    ctx.font = `10xp Arial`;
    ctx.fillStyle = "#888";
    ctx.textAlign = "left";

    ctx.fillText(`FPS: ${(1000 / profiler.elapsed).toFixed(2)}`, 5, 13);

    ctx.restore();
  }

  private drawNode(
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    lowQuality: boolean
  ) {
    const { dragScaleHelper: ds } = this;

    ctx.save();
    ctx.translate(node.position[0], node.position[1]);

    const color =
      node.color ||
      (node.constructor as unknown as GraphNode).color ||
      NODE_DEFAULT_COLOR;

    const bgColor =
      node.bgColor ||
      (node.constructor as unknown as GraphNode).bgColor ||
      NODE_DEFAULT_BGCOLOR;

    if (!lowQuality) {
      ctx.shadowColor = DEFAULT_SHADOW_COLOR;
      ctx.shadowOffsetX = ds.scale * 2;
      ctx.shadowOffsetY = ds.scale * 2;
      ctx.shadowBlur = ds.scale * 3;
    } else {
      ctx.shadowColor = "transparent";
    }

    this.drawNodeShape(node, ctx, color, bgColor);

    ctx.restore();
  }

  private drawNodeShape(
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    color: string,
    bgColor: string
  ) {
    ctx.strokeStyle = color;
    ctx.fillStyle = bgColor;

    const renderTitle = !node.flags.collapsed;

    ctx.font = `${NODE_SUBTEXT_SIZE}px Arial`;
    const width = node.computeWidth(ctx);
    const height = 46; // TODO: 后续根据内容计算出来

    const area = [
      0,
      renderTitle ? -NODE_TITLE_HEIGHT : 0,
      width,
      renderTitle ? height + NODE_TITLE_HEIGHT : height,
    ] as const;

    // draw background
    ctx.beginPath();
    ctx.roundRect(...area, ROUND_RADIUS);
    ctx.fill();

    // draw separator
    if (!node.flags.collapsed) {
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, -1, area[2], 2);
    }

    const titleColor = (node.constructor as unknown as typeof GraphNode)
      .titleColor;

    // draw title bg
    if (titleColor) {
      ctx.fillStyle = titleColor;
      ctx.beginPath();
      ctx.roundRect(
        0,
        -NODE_TITLE_HEIGHT,
        area[2],
        NODE_TITLE_HEIGHT,
        node.flags.collapsed ? ROUND_RADIUS : [ROUND_RADIUS, ROUND_RADIUS, 0, 0]
      );
      ctx.fill();
    }

    // draw title dot
    ctx.beginPath();
    ctx.arc(
      NODE_TITLE_HEIGHT * 0.5,
      -NODE_TITLE_HEIGHT * 0.5,
      DOT_SIZE * 0.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}
