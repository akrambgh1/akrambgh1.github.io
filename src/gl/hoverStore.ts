// Tiny shared state between the DOM cards and the single WebGL hover layer.
// One canvas for every card keeps us at one WebGL context, no matter how many projects there are.

export interface HoverTarget {
  frame: HTMLElement; // the clipping box (what the visitor sees)
  img: HTMLImageElement; // the image inside it (may be larger, because of parallax)
}

type Listener = () => void;

export const hoverState = {
  target: null as HoverTarget | null,
  mouse: { x: 0.5, y: 0.5 }, // in the image's own UV space
};

const listeners = new Set<Listener>();

export function setHoverTarget(target: HoverTarget | null) {
  hoverState.target = target;
  listeners.forEach((l) => l());
}

export function setHoverMouse(clientX: number, clientY: number) {
  const img = hoverState.target?.img;
  if (!img) return;
  const r = img.getBoundingClientRect();
  hoverState.mouse.x = (clientX - r.left) / r.width;
  hoverState.mouse.y = 1 - (clientY - r.top) / r.height;
  listeners.forEach((l) => l());
}

export function subscribeHover(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
