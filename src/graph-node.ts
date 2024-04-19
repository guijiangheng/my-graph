import { Vector2 } from "./drag-scale-helper";
import { Graph } from "./graph";
import { ConstructorType, getNodeType, registerSlot } from "./lib";

const NODE_WIDTH = 140;
const NODE_TITLE_HEIGHT = 30;

interface Slot {
  name: string;
  type: string;
  extra?: Object;
}

export class GraphNode {
  static color?: string;
  static bgColor?: string;
  static titleColor?: string;

  public id = 0;
  public position: Vector2 = [0, 0];
  public title?: string;
  public description?: string;
  public color?: string;
  public bgColor?: string;
  public flags: { [key: string]: boolean } = {};

  // typescript不支持friend，只好用public+下划线了，包内部可以访问，但是用户不允许访问
  public _graph?: Graph;
  private inputs: Slot[] = [];
  private outputs: Slot[] = [];

  public getTitle(): string {
    return this.title ?? this.constructor.name;
  }

  public addInput(name: string, type: string, extra?: Object) {
    this.inputs.push({ name, type, extra });
    registerSlot(
      type,
      getNodeType(this.constructor as ConstructorType<GraphNode>)!
    );
    this._graph?.setDirty(true);
  }

  public addOutput(name: string, type: string, extra?: Object) {
    this.outputs.push({ name, type, extra });
    registerSlot(
      type,
      getNodeType(this.constructor as ConstructorType<GraphNode>)!,
      false
    );
    this._graph?.setDirty(true);
  }

  computeWidth(ctx: CanvasRenderingContext2D): number {
    if (!this.flags.collapsed) return NODE_WIDTH;

    const title = this.getTitle();

    return Math.min(
      ctx.measureText(title).width + NODE_TITLE_HEIGHT * 2,
      NODE_WIDTH
    );
  }
}
