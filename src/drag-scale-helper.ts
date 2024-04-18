const MAX_SCALE = 10;
const MIN_SCALE = 0.1;

export type Vector2 = [number, number];

export class DragScaleHelper {
  canvas: HTMLCanvasElement;

  scale = 1;
  offset = [0, 0];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bindEventListeners();
  }

  bindEventListeners() {
    const { canvas } = this;

    let lastMouseX = 0;
    let lastMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      console.log("mousemove");
      this.drag(e.clientX - lastMouseX, e.clientY - lastMouseY);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    canvas.addEventListener("mousedown", onMouseDown);
  }

  reset() {
    this.scale = 1;
    this.offset[0] = 0;
    this.offset[1] = 0;
  }

  computeViewport(): [number, number, number, number] {
    const { canvas } = this;

    const topLeft = this.toLocal(0, 0);
    const bottomRight = this.toLocal(canvas.width, canvas.height);

    return [
      topLeft[0],
      topLeft[1],
      bottomRight[0] - topLeft[0],
      bottomRight[1] - topLeft[1],
    ];
  }

  apply(ctx: CanvasRenderingContext2D) {
    ctx.scale(this.scale, this.scale);
    ctx.translate(this.offset[0], this.offset[1]);
  }

  toWorld(x: number, y: number): Vector2 {
    return [
      (x + this.offset[0]) * this.scale,
      (y + this.offset[1]) * this.scale,
    ];
  }

  toLocal(x: number, y: number): Vector2 {
    const inv = 1 / this.scale;
    return [x * inv - this.offset[0], y * inv - this.offset[1]];
  }

  drag(x: number, y: number) {
    const inv = 1 / this.scale;
    this.offset[0] += x * inv;
    this.offset[1] += y * inv;
  }

  zoom(scale: number, anchor?: Vector2) {
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

    if (Math.abs(scale - 1) < 0.05) {
      scale = 1;
    }

    anchor ||= [this.canvas.width / 2, this.canvas.height / 2];
    const anchorLocal = this.toLocal(anchor[0], anchor[1]);
    this.scale = scale;
    const newAnchorLocal = this.toLocal(anchor[0], anchor[1]);

    this.offset[0] += newAnchorLocal[0] - anchorLocal[0];
    this.offset[1] += newAnchorLocal[1] - anchorLocal[1];
  }
}
