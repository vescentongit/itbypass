import { NextResponse } from "next/server";

interface Node {
  id: number;
  name: string;
  x: number;
  y: number;
  elevation: number;
}

interface Edge {
  from_idx: number;
  to_idx: number;
  has_roof: boolean;
}

interface RouteRequest {
  nodes: Node[];
  edges: Edge[];
  start: string;
  goal: string;
  slope_weight: number;
  is_raining: boolean;
}

// Highly performant Min-Heap implementation for Dijkstra
class MinHeap<T> {
  private heap: { cost: number; element: T }[] = [];

  push(cost: number, element: T) {
    this.heap.push({ cost, element });
    this.up(this.heap.length - 1);
  }

  pop(): { cost: number; element: T } | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.down(0);
    }
    return top;
  }

  private up(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[i].cost >= this.heap[p].cost) break;
      this.swap(i, p);
      i = p;
    }
  }

  private down(i: number) {
    const len = this.heap.length;
    while ((i << 1) + 1 < len) {
      let child = (i << 1) + 1;
      if (child + 1 < len && this.heap[child + 1].cost < this.heap[child].cost) {
        child++;
      }
      if (this.heap[i].cost <= this.heap[child].cost) break;
      this.swap(i, child);
      i = child;
    }
  }

  private swap(i: number, j: number) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  get size(): number {
    return this.heap.length;
  }
}

function hitungJarak(node1: Node, node2: Node): number {
  const dx = node2.x - node1.x;
  const dy = node2.y - node1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function hitungSlope(node1: Node, node2: Node): number {
  const jarak = hitungJarak(node1, node2);
  if (jarak === 0) return 0;
  const dElev = Math.abs(node2.elevation - node1.elevation);
  return (dElev / jarak) * 100;
}

function findNodeIndex(nodes: Node[], name: string): number {
  return nodes.findIndex((node) => node.name === name);
}

function dijkstra(
  nodes: Node[],
  edges: Edge[],
  startIdx: number,
  goalIdx: number,
  slopeWeight: number,
  isRaining: boolean
): { path: string[]; totalCost: number } {
  const n = nodes.length;

  const dist = Array(n).fill(Infinity);
  const prev = Array(n).fill(-1);
  dist[startIdx] = 0.0;

  const pq = new MinHeap<number>();
  pq.push(0.0, startIdx);

  const visited = new Set<number>();

  while (pq.size > 0) {
    const popped = pq.pop();
    if (!popped) break;

    const { cost: currentCost, element: currentIdx } = popped;

    if (visited.has(currentIdx)) continue;
    visited.add(currentIdx);

    if (currentIdx === goalIdx) break;

    if (currentCost > dist[currentIdx]) continue;

    // Check all edges from currentIdx
    for (const edge of edges) {
      if (edge.from_idx !== currentIdx) continue;

      const toIdx = edge.to_idx;
      if (visited.has(toIdx)) continue;

      const node1 = nodes[currentIdx];
      const node2 = nodes[toIdx];

      const jarak = hitungJarak(node1, node2);
      const slope = hitungSlope(node1, node2);

      const roofPenalty = isRaining && !edge.has_roof ? 99999 : 0;
      const cost = jarak + slopeWeight * slope + roofPenalty;
      const newDist = dist[currentIdx] + cost;

      if (newDist < dist[toIdx]) {
        dist[toIdx] = newDist;
        prev[toIdx] = currentIdx;
        pq.push(newDist, toIdx);
      }
    }
  }

  // Reconstruct path
  const pathIndices: number[] = [];
  let at = goalIdx;
  while (at !== -1) {
    pathIndices.push(at);
    at = prev[at];
  }

  pathIndices.reverse();
  const pathNames = pathIndices.map((idx) => nodes[idx].name);
  const totalCost = dist[goalIdx];

  if (!Number.isFinite(totalCost)) {
    return {
      path: ["Error: Rute tidak ditemukan"],
      totalCost: 0,
    };
  }

  return { path: pathNames, totalCost };
}

export async function POST(request: Request) {
  try {
    const body: RouteRequest = await request.json();

    const startIdx = findNodeIndex(body.nodes, body.start);
    const goalIdx = findNodeIndex(body.nodes, body.goal);

    if (startIdx === -1 || goalIdx === -1) {
      return NextResponse.json({
        path: ["Error: Node tidak ditemukan"],
        total_cost: 0,
      });
    }

    const { path, totalCost } = dijkstra(
      body.nodes,
      body.edges,
      startIdx,
      goalIdx,
      body.slope_weight,
      body.is_raining
    );

    return NextResponse.json({
      path,
      total_cost: totalCost,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
