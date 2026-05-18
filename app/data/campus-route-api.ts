import {
  CAMPUS_LOCATIONS,
  type CampusLocation,
  getDistanceMeters,
} from "@/app/data/campus-locations";

export type RouteMode = "flat" | "fast";

export type RouteApiResult = {
  start: string;
  goal: string;
  mode: RouteMode;
  path: string[];
  totalCost: number;
  minutes: number;
};

type RouteNode = {
  id: number;
  name: string;
  x: number;
  y: number;
  elevation: number;
};

type RouteEdge = {
  from_idx: number;
  to_idx: number;
  has_roof: boolean;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

const ELEVATION_BY_NAME: Record<string, number> = {
  "Gerbang Utama ITB Jatinangor": 718,
  "Parkir Motor Mahasiswa": 724,
  "Gedung Kuliah Umum I": 736,
  "Gedung Kuliah Umum II": 739,
  "Labtek IB": 738,
  "GOR Futsal": 751,
  "Gedung Kuliah Umum 3": 748,
  Rektorat: 744,
  KOICA: 746,
  GSG: 752,
  "Gedung Kuliah A": 741,
  "Gedung Kuliah C": 743,
  "Gedung Kuliah D": 739,
  "Gedung Kuliah E": 740,
  "Asrama Mahasiswa ITB": 754,
  "Labtek IA": 738,
  "Labtek IIA": 746,
  "Labtek IIB": 744,
  "Gedung Kuliah SBM": 742,
};

function toMeters(position: [number, number]) {
  const origin = CAMPUS_LOCATIONS[0].position;
  const latMeters = (position[0] - origin[0]) * 111320;
  const lngMeters =
    (position[1] - origin[1]) *
    111320 *
    Math.cos((origin[0] * Math.PI) / 180);

  return { x: lngMeters, y: latMeters };
}

function buildNodes(): RouteNode[] {
  return CAMPUS_LOCATIONS.map((location, id) => {
    const { x, y } = toMeters(location.position);

    return {
      id,
      name: location.name,
      x,
      y,
      elevation: ELEVATION_BY_NAME[location.name] ?? 735,
    };
  });
}

function buildEdges() {
  const edges = new Map<string, RouteEdge>();

  CAMPUS_LOCATIONS.forEach((location, fromIdx) => {
    const nearest = CAMPUS_LOCATIONS.map((candidate, toIdx) => ({
      toIdx,
      meters:
        fromIdx === toIdx
          ? Number.POSITIVE_INFINITY
          : getDistanceMeters(location.position, candidate.position),
    }))
      .sort((a, b) => a.meters - b.meters)
      .slice(0, 4);

    nearest.forEach(({ toIdx }) => {
      edges.set(`${fromIdx}-${toIdx}`, {
        from_idx: fromIdx,
        to_idx: toIdx,
        has_roof: true,
      });
      edges.set(`${toIdx}-${fromIdx}`, {
        from_idx: toIdx,
        to_idx: fromIdx,
        has_roof: true,
      });
    });
  });

  return [...edges.values()];
}

function estimateMinutes(path: string[]) {
  if (path.length < 2) return 0;

  const totalMeters = path.slice(1).reduce((sum, name, index) => {
    const previous = CAMPUS_LOCATIONS.find(
      (location) => location.name === path[index],
    );
    const current = CAMPUS_LOCATIONS.find((location) => location.name === name);

    if (!previous || !current) return sum;
    return sum + getDistanceMeters(previous.position, current.position);
  }, 0);

  return Math.max(1, Math.round(totalMeters / 80));
}

export function getLocationByName(name: string) {
  return CAMPUS_LOCATIONS.find((location) => location.name === name);
}

export function getPathPositions(path: string[]) {
  return path
    .map((name) => getLocationByName(name)?.position)
    .filter((position): position is CampusLocation["position"] =>
      Boolean(position),
    );
}

export async function requestCampusRoute({
  start,
  goal,
  mode,
}: {
  start: string;
  goal: string;
  mode: RouteMode;
}): Promise<RouteApiResult> {
  const response = await fetch(`${BACKEND_URL}/route`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nodes: buildNodes(),
      edges: buildEdges(),
      start,
      goal,
      slope_weight: mode === "flat" ? 10 : 0,
      is_raining: false,
    }),
  });

  if (!response.ok) {
    throw new Error("Backend route request failed");
  }

  const data = (await response.json()) as {
    path: string[];
    total_cost: number;
  };

  if (data.path[0]?.startsWith("Error:")) {
    throw new Error(data.path[0]);
  }

  return {
    start,
    goal,
    mode,
    path: data.path,
    totalCost: data.total_cost,
    minutes: estimateMinutes(data.path),
  };
}
