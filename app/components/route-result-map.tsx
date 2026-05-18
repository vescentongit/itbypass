"use client";

import { getPathPositions } from "@/app/data/campus-route-api";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const CENTER: [number, number] = [-6.9291, 107.7691];
const OSM_TILE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const routePath = {
  color: "#2563eb",
  weight: 5,
  opacity: 0.95,
};

const endpointPath = {
  color: "#020617",
  fillColor: "#14f1d9",
  fillOpacity: 1,
  weight: 3,
};

export function RouteResultMap({ path }: { path: string[] }) {
  const positions = getPathPositions(path);
  const center = positions[0] ?? CENTER;

  return (
    <MapContainer
      center={center}
      zoom={17}
      className="z-0 h-full w-full touch-pan-x touch-pan-y"
      scrollWheelZoom
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={OSM_TILE}
      />
      {positions.length > 1 && (
        <Polyline positions={positions} pathOptions={routePath} />
      )}
      {positions.map((position, index) => (
        <CircleMarker
          key={`${position[0]}-${position[1]}`}
          center={position}
          radius={index === 0 || index === positions.length - 1 ? 8 : 5}
          pathOptions={endpointPath}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
            {path[index]}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
