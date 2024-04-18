import { DragScaleHelper } from "./drag-scale-helper";
const CLEAR_BG_COLOR = "#222";
const CANVAS_BORDER_COLOR = "#235";
const TEXT_SIZE = 14;
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
  profiler: Profiler = new Profiler();

  ctx: CanvasRenderingContext2D;

  canvas: HTMLCanvasElement;
  bgCanvas: HTMLCanvasElement;

  pattern?: CanvasPattern;
  bgImage?: HTMLImageElement;

  dirtyBgCanvas = true;
  dirtyFrontCanvas = true;

  dragScaleHelper: DragScaleHelper;

  constructor(id: string) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    canvas.tabIndex = 1;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    const bgCanvas = document.createElement("canvas");
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    this.bgCanvas = bgCanvas;

    this.dragScaleHelper = new DragScaleHelper(canvas);

    this.startRendering();
  }

  startRendering() {
    const that = this;

    (function render() {
      that.profiler.tick();
      that.draw();
      requestAnimationFrame(render);
    })();
  }

  draw() {
    if (this.dirtyBgCanvas) {
      this.drawBackCanvas();
      // this.dirtyBgCanvas = false;
    }

    if (this.dirtyFrontCanvas) {
      this.drawFrontCanvas();
      // this.dirtyFrontCanvas = false;
    }
  }

  drawBackCanvas() {
    const { bgCanvas: canvas, dragScaleHelper: ds } = this;

    const ctx = canvas.getContext("2d")!;

    ctx.save();
    ds.apply(ctx);

    const viewport = ds.computeViewport();

    ctx.fillStyle = CLEAR_BG_COLOR;
    ctx.fillRect(...viewport);

    ctx.strokeStyle = CANVAS_BORDER_COLOR;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    if (ds.scale > 0.5) {
      this.drawPattern(viewport);
    }

    ctx.restore();
  }

  drawFrontCanvas() {
    const { ctx, canvas } = this;

    ctx.save();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.bgCanvas, 0, 0);

    ctx.restore();
  }

  drawPattern(viewport: [number, number, number, number]) {
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
      ctx.fillRect(...viewport);
    }
  }
}
