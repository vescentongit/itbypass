export type CampusLocation = {
  distance: string;
  name: string;
  address: string;
  position: [number, number];
};

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    distance: "0",
    name: "Gerbang Utama ITB Jatinangor",
    address: "[Alamat]",
    position: [-6.933582, 107.7683275],
  },
  {
    distance: "0,3",
    name: "Parkiran Motor",
    address: "[Alamat]",
    position: [-6.9310512, 107.7682313],
  },
  {
    distance: "1",
    name: "Gedung Kuliah Umum I",
    address: "[Alamat]",
    position: [-6.9289472, 107.7696789],
  },
  {
    distance: "1,2",
    name: "Gedung Kuliah Umum II",
    address: "[Alamat]",
    position: [-6.9296537, 107.7688913],
  },
  {
    distance: "1,1",
    name: "Labtek IB",
    address: "[Alamat]",
    position: [-6.9291308, 107.768789],
  },
  {
    distance: "1,5",
    name: "GOR Futsal",
    address: "[Alamat]",
    position: [-6.9259237, 107.7690724],
  },
  {
    distance: "1,6",
    name: "GOR Tenis Meja",
    address: "[Alamat]",
    position: [-6.9252373, 107.7687362],
  },
  {
    distance: "1,7",
    name: "Lapangan Sepak Bola",
    address: "[Alamat]",
    position: [-6.9255779, 107.7678078],
  },
  {
    distance: "1,4",
    name: "Gedung Kuliah Umum 3",
    address: "[Alamat]",
    position: [-6.927154, 107.7702549],
  },
  {
    distance: "1,3",
    name: "Amphiteater",
    address: "[Alamat]",
    position: [-6.9272237, 107.7689357],
  },
  {
    distance: "1",
    name: "Rektorat",
    address: "[Alamat]",
    position: [-6.9281129, 107.7703643],
  },
  {
    distance: "1,2",
    name: "KOICA",
    address: "[Alamat]",
    position: [-6.9276975, 107.7700508],
  },
  {
    distance: "1,5",
    name: "GSG",
    address: "[Alamat]",
    position: [-6.9264096, 107.7695639],
  },
  {
    distance: "1,2",
    name: "Gedung Kuliah A",
    address: "[Alamat]",
    position: [-6.9276658, 107.7690989],
  },
  {
    distance: "1,2",
    name: "Gedung Kuliah C",
    address: "[Alamat]",
    position: [-6.927959, 107.7693687],
  },
  {
    distance: "1,2",
    name: "Gedung Kuliah D",
    address: "[Alamat]",
    position: [-6.9284453, 107.7694765],
  },
  {
    distance: "1,3",
    name: "Gedung Kuliah E",
    address: "[Alamat]",
    position: [-6.9287269, 107.7691785],
  },
  {
    distance: "1,6",
    name: "Asrama Mahasiswa ITB",
    address: "[Alamat]",
    position: [-6.9265977, 107.7686256],
  },
  {
    distance: "1,1",
    name: "Labtek IA",
    address: "[Alamat]",
    position: [-6.9286345, 107.7684132],
  },
  {
    distance: "1,3",
    name: "Labtek IIA",
    address: "[Alamat]",
    position: [-6.92745, 107.7678999],
  },
  {
    distance: "1,3",
    name: "Labtek IIB",
    address: "[Alamat]",
    position: [-6.9277078, 107.7681162],
  },
  {
    distance: "1,2",
    name: "Gedung Kuliah SBM",
    address: "[Alamat]",
    position: [-6.9275341, 107.7686298],
  },
];

export function getDistanceMeters(a: [number, number], b: [number, number]) {
  const earthRadiusMeters = 6371000;
  const toRadians = (degree: number) => (degree * Math.PI) / 180;
  const deltaLat = toRadians(b[0] - a[0]);
  const deltaLng = toRadians(b[1] - a[1]);
  const lat1 = toRadians(a[0]);
  const lat2 = toRadians(b[0]);
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(h));
}

export function findNearestCampusLocation(position: [number, number]) {
  return CAMPUS_LOCATIONS.reduce((nearest, location) => {
    const currentDistance = getDistanceMeters(position, location.position);
    const nearestDistance = getDistanceMeters(position, nearest.position);

    return currentDistance < nearestDistance ? location : nearest;
  });
}
