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

type GraphPoint = {
  name: string;
  position: [number, number];
  elevation: number;
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

const ROAD_WAYPOINTS: GraphPoint[] = [
  { name: "Jalan Masuk Selatan", position: [-6.933582, 107.7683275], elevation: 718 },
  { name: "Bundaran ITB 1", position: [-6.9317353, 107.7688596], elevation: 726 },
  { name: "Jalan ITB 1 Tengah", position: [-6.9309454, 107.7686367], elevation: 731 },
  { name: "Jalan ITB 1 Utara", position: [-6.9294684, 107.7684375], elevation: 737 },
  { name: "Koridor Labtek I", position: [-6.9291308, 107.768789], elevation: 738 },
  { name: "Simpang GKU I-II", position: [-6.9293800, 107.7692650], elevation: 739 },
  { name: "Koridor GKU I", position: [-6.9289472, 107.7696789], elevation: 736 },
  { name: "Koridor Rektorat", position: [-6.9281129, 107.7703643], elevation: 744 },
  { name: "Koridor KOICA", position: [-6.9276975, 107.7700508], elevation: 746 },
  { name: "Koridor GKU 3", position: [-6.927154, 107.7702549], elevation: 748 },
  { name: "Koridor GSG", position: [-6.9264096, 107.7695639], elevation: 752 },
  { name: "Koridor GOR", position: [-6.9259237, 107.7690724], elevation: 751 },
  { name: "Koridor Asrama", position: [-6.9265977, 107.7686256], elevation: 754 },
  { name: "Koridor Labtek II", position: [-6.92755, 107.76802], elevation: 745 },
  { name: "Koridor SBM", position: [-6.9275341, 107.7686298], elevation: 742 },
  { name: "Koridor Gedung Kuliah A", position: [-6.9276658, 107.7690989], elevation: 741 },
  { name: "Koridor Gedung Kuliah C", position: [-6.927959, 107.7693687], elevation: 743 },
  { name: "Koridor Gedung Kuliah D-E", position: [-6.92855, 107.76932], elevation: 740 },
  { name: "Simpang Parkir", position: [-6.9314294, 107.7713424], elevation: 724 },
];

const LOCATION_ACCESS: Record<string, string> = {
  "Gerbang Utama ITB Jatinangor": "Jalan Masuk Selatan",
  "Parkir Motor Mahasiswa": "Simpang Parkir",
  "Gedung Kuliah Umum I": "Koridor GKU I",
  "Gedung Kuliah Umum II": "Simpang GKU I-II",
  "Labtek IB": "Koridor Labtek I",
  "GOR Futsal": "Koridor GOR",
  "Gedung Kuliah Umum 3": "Koridor GKU 3",
  Rektorat: "Koridor Rektorat",
  KOICA: "Koridor KOICA",
  GSG: "Koridor GSG",
  "Gedung Kuliah A": "Koridor Gedung Kuliah A",
  "Gedung Kuliah C": "Koridor Gedung Kuliah C",
  "Gedung Kuliah D": "Koridor Gedung Kuliah D-E",
  "Gedung Kuliah E": "Koridor Gedung Kuliah D-E",
  "Asrama Mahasiswa ITB": "Koridor Asrama",
  "Labtek IA": "Jalan ITB 1 Utara",
  "Labtek IIA": "Koridor Labtek II",
  "Labtek IIB": "Koridor Labtek II",
  "Gedung Kuliah SBM": "Koridor SBM",
};

const ROAD_EDGES: [string, string][] = [
  ["Jalan Masuk Selatan", "Bundaran ITB 1"],
  ["Bundaran ITB 1", "Jalan ITB 1 Tengah"],
  ["Bundaran ITB 1", "Simpang Parkir"],
  ["Jalan ITB 1 Tengah", "Jalan ITB 1 Utara"],
  ["Jalan ITB 1 Utara", "Koridor Labtek I"],
  ["Koridor Labtek I", "Simpang GKU I-II"],
  ["Simpang GKU I-II", "Koridor GKU I"],
  ["Koridor GKU I", "Koridor Rektorat"],
  ["Koridor Rektorat", "Koridor KOICA"],
  ["Koridor KOICA", "Koridor GKU 3"],
  ["Koridor GKU 3", "Koridor GSG"],
  ["Koridor GSG", "Koridor GOR"],
  ["Koridor GSG", "Koridor Asrama"],
  ["Koridor Labtek I", "Jalan ITB 1 Utara"],
  ["Jalan ITB 1 Utara", "Koridor Labtek II"],
  ["Koridor Labtek II", "Koridor SBM"],
  ["Koridor SBM", "Koridor Gedung Kuliah A"],
  ["Koridor Gedung Kuliah A", "Koridor Gedung Kuliah C"],
  ["Koridor Gedung Kuliah C", "Koridor Gedung Kuliah D-E"],
  ["Koridor Gedung Kuliah D-E", "Simpang GKU I-II"],
  ["Simpang Parkir", "Koridor Rektorat"],
];

const LOCATION_NAMES = new Set(CAMPUS_LOCATIONS.map((location) => location.name));

function toMeters(position: [number, number]) {
  const origin = CAMPUS_LOCATIONS[0].position;
  const latMeters = (position[0] - origin[0]) * 111320;
  const lngMeters =
    (position[1] - origin[1]) *
    111320 *
    Math.cos((origin[0] * Math.PI) / 180);

  return { x: lngMeters, y: latMeters };
}

const GRAPH_POINTS: GraphPoint[] = [
  ...CAMPUS_LOCATIONS.map((location) => ({
    name: location.name,
    position: location.position,
    elevation: ELEVATION_BY_NAME[location.name] ?? 735,
  })),
  ...ROAD_WAYPOINTS,
];

function buildNodes(): RouteNode[] {
  return GRAPH_POINTS.map((point, id) => {
    const { x, y } = toMeters(point.position);

    return {
      id,
      name: point.name,
      x,
      y,
      elevation: point.elevation,
    };
  });
}

function buildEdges() {
  const edges = new Map<string, RouteEdge>();
  const indexByName = new Map(
    GRAPH_POINTS.map((point, index) => [point.name, index]),
  );

  const connect = (from: string, to: string) => {
    const fromIdx = indexByName.get(from);
    const toIdx = indexByName.get(to);
    if (fromIdx === undefined || toIdx === undefined) return;

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
  };

  ROAD_EDGES.forEach(([from, to]) => connect(from, to));
  Object.entries(LOCATION_ACCESS).forEach(([location, access]) => {
    connect(location, access);
  });

  return [...edges.values()];
}

function estimateMinutes(path: string[]) {
  if (path.length < 2) return 0;

  const totalMeters = path.slice(1).reduce((sum, name, index) => {
    const previous = GRAPH_POINTS.find((point) => point.name === path[index]);
    const current = GRAPH_POINTS.find((point) => point.name === name);

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
    .map((name) => GRAPH_POINTS.find((point) => point.name === name)?.position)
    .filter((position): position is CampusLocation["position"] =>
      Boolean(position),
    );
}

export function isCampusLocationName(name: string) {
  return LOCATION_NAMES.has(name);
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
