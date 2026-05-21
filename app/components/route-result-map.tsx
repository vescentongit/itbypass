"use client";

import { useMemo } from "react";
import {
  getPathPositions,
  isCampusLocationName,
} from "@/app/data/campus-route-api";
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
  color: "#83a2f9",
  weight: 4,
  opacity: 0.95,
  lineCap: "round" as const,
  lineJoin: "round" as const,
};

const endpointPath = {
  color: "#83a2f9",
  fillColor: "#ffffff",
  fillOpacity: 1,
  weight: 3,
};

export function RouteResultMap({ path }: { path: string[] }) {
  const positions = useMemo(() => getPathPositions(path), [path]);
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
      {positions.map((position, index) => {
        const isEndpoint = index === 0 || index === positions.length - 1;
        const isNamedLocation = isCampusLocationName(path[index]);

        if (!isEndpoint && !isNamedLocation) return null;

        return (
          <CircleMarker
            key={`${position[0]}-${position[1]}`}
            center={position}
            radius={isEndpoint ? 8 : 5}
            pathOptions={endpointPath}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              {path[index]}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
