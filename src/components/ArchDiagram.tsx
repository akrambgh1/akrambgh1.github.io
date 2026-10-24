import type { Project } from "../content";

const COL_W = 210;
const NODE_W = 170;
const NODE_H = 58;
const ROW_GAP = 26;
const PAD = 16;

/** Draws a project's architecture from its data: columns are layers, arrows are calls. */
export default function ArchDiagram({ project }: { project: Project }) {
  const { nodes, edges } = project.architecture;
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const perCol = Array.from({ length: cols }, (_, c) => nodes.filter((n) => n.col === c));
  const rows = Math.max(...perCol.map((c) => c.length));
  const height = PAD * 2 + rows * NODE_H + (rows - 1) * ROW_GAP;
  const width = PAD * 2 + (cols - 1) * COL_W + NODE_W;

  const pos = new Map<string, { x: number; y: number }>();
  perCol.forEach((col, c) => {
    const colH = col.length * NODE_H + (col.length - 1) * ROW_GAP;
    const top = (height - colH) / 2;
    col.forEach((n, r) => pos.set(n.id, { x: PAD + c * COL_W, y: top + r * (NODE_H + ROW_GAP) }));
  });

  return (
    <figure className="arch">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`arch-${project.slug}`}>
        <title id={`arch-${project.slug}`}>
          {`Architecture of ${project.title}: ${edges.map(([a, b, l]) => `${nodes.find((n) => n.id === a)?.label} to ${nodes.find((n) => n.id === b)?.label}${l ? ` (${l})` : ""}`).join("; ")}`}
        </title>
        <defs>
          <marker id={`head-${project.slug}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" className="arch-head" />
          </marker>
        </defs>

        {edges.map(([from, to, label]) => {
          const a = pos.get(from)!;
          const b = pos.get(to)!;
          const sameCol = a.x === b.x;
          let d: string;
          let lx: number;
          let ly: number;
          if (sameCol) {
            const x = a.x + NODE_W / 2;
            const [y1, y2] = a.y < b.y ? [a.y + NODE_H, b.y] : [a.y, b.y + NODE_H];
            d = `M${x},${y1} L${x},${y2}`;
            lx = x + 8;
            ly = (y1 + y2) / 2 + 4;
          } else {
            const forward = b.x > a.x;
            const x1 = forward ? a.x + NODE_W : a.x;
            const x2 = forward ? b.x : b.x + NODE_W;
            const y1 = a.y + NODE_H / 2;
            const y2 = b.y + NODE_H / 2;
            const mid = (x1 + x2) / 2;
            d = `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`;
            lx = mid;
            ly = (y1 + y2) / 2 - 7;
          }
          const span = Math.abs(b.x - a.x) > COL_W; // skips a layer, e.g. peer-to-peer audio
          return (
            <g key={`${from}-${to}`}>
              <path d={d} className={`arch-edge ${span ? "is-direct" : ""}`} markerEnd={`url(#head-${project.slug})`} />
              {label && (
                <text x={lx} y={ly} className="arch-edge-label" textAnchor={sameCol ? "start" : "middle"}>
                  {label}
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((n) => {
          const p = pos.get(n.id)!;
          return (
            <g key={n.id} transform={`translate(${p.x},${p.y})`}>
              <rect width={NODE_W} height={NODE_H} rx="2" className="arch-node" />
              <text x={14} y={n.note ? 25 : 34} className="arch-label">{n.label}</text>
              {n.note && <text x={14} y={43} className="arch-note">{n.note}</text>}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
