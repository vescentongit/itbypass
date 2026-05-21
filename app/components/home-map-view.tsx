"use client";

import { CAMPUS_LOCATIONS } from "@/app/data/campus-locations";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const CENTER: [number, number] = [-6.9291, 107.7691];

/** OSMF tile server — follow https://operations.osmfoundation.org/policies/tiles/ (fair use). */
const OSM_TILE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const markerPath = {
  color: "#83a2f9",
  fillColor: "#ffffff",
  fillOpacity: 0.92,
  weight: 2,
};

export function HomeMapView() {
  return (
    <MapContainer
      center={CENTER}
      zoom={15}
      className="z-0 h-full w-full min-h-[240px] touch-pan-x touch-pan-y"
      scrollWheelZoom
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={OSM_TILE}
      />
      {CAMPUS_LOCATIONS.map((location) => (
        <CircleMarker
          key={location.name}
          center={location.position}
          radius={7}
          pathOptions={markerPath}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
            {location.name}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
