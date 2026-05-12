"use client";

import { MapContainer, CircleMarker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const CENTER: [number, number] = [-6.9355, 107.7725];

const SAMPLE_MARKERS: [number, number][] = [
  [-6.9354, 107.7724],
  [-6.9412, 107.781],
];

/** OSMF tile server — follow https://operations.osmfoundation.org/policies/tiles/ (fair use). */
const OSM_TILE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const markerPath = {
  color: "#b91c1c",
  fillColor: "#dc2626",
  fillOpacity: 1,
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
      {SAMPLE_MARKERS.map((position, i) => (
        <CircleMarker
          key={i}
          center={position}
          radius={9}
          pathOptions={markerPath}
        />
      ))}
    </MapContainer>
  );
}
