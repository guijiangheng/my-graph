import { GraphNode } from "./graph-node";

export type ConstructorType<T> = new (...args: any[]) => T;

const slotTypes = new Set<string>();
const inSlotNodeTypes = new Map<string, string>();
const outSlotNodeTypes = new Map<string, string>();

const typeToNodeConstructors = new Map<string, ConstructorType<GraphNode>>();
const nodeConstructorToTypes = new Map<ConstructorType<GraphNode>, string>();

export const registerNodeType = <T extends ConstructorType<GraphNode>>(
  type: string,
  nodeConstructor: T
) => {
  typeToNodeConstructors.set(type, nodeConstructor);
  nodeConstructorToTypes.set(nodeConstructor, type);
};

export const getNodeType = <T extends ConstructorType<GraphNode>>(
  nodeConstructor: T
): string | undefined => {
  return nodeConstructorToTypes.get(nodeConstructor);
};

export const registerSlot = (
  nodeType: string,
  slotType: string,
  isInput = true
) => {
  slotTypes.add(slotType);

  if (isInput) {
    inSlotNodeTypes.set(slotType, nodeType);
  } else {
    outSlotNodeTypes.set(slotType, nodeType);
  }
};
