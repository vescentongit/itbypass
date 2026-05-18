"use client";

import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { CampusLocation } from "@/app/data/campus-locations";

type LocationField = "start" | "destination";

const CENTER: [number, number] = [-6.9291, 107.7691];
const OSM_TILE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const startPath = {
  color: "#0f766e",
  fillColor: "#14b8a6",
  fillOpacity: 1,
  weight: 3,
};

const destinationPath = {
  color: "#b91c1c",
  fillColor: "#ef4444",
  fillOpacity: 1,
  weight: 3,
};

const locationPath = {
  color: "#1d4ed8",
  fillColor: "#60a5fa",
  fillOpacity: 0.92,
  weight: 2,
};

function MapClickHandler({
  onPick,
}: {
  onPick: (position: [number, number]) => void;
}) {
  useMapEvents({
    click(event) {
      onPick([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export function LocationPickerMap({
  activeField,
  locations,
  start,
  destination,
  onPick,
  onLocationPick,
}: {
  activeField: LocationField;
  locations: CampusLocation[];
  start: [number, number] | null;
  destination: [number, number] | null;
  onPick: (position: [number, number]) => void;
  onLocationPick: (location: CampusLocation) => void;
}) {
  return (
    <MapContainer
      center={start ?? destination ?? CENTER}
      zoom={16}
      className="z-0 h-full w-full touch-pan-x touch-pan-y"
      scrollWheelZoom
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={OSM_TILE}
      />
      <MapClickHandler onPick={onPick} />
      {locations.map((location) => (
        <CircleMarker
          key={location.name}
          center={location.position}
          radius={8}
          pathOptions={locationPath}
          eventHandlers={{
            click() {
              onLocationPick(location);
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
            {location.name}
          </Tooltip>
        </CircleMarker>
      ))}
      {start && (
        <CircleMarker center={start} radius={10} pathOptions={startPath} />
      )}
      {destination && (
        <CircleMarker
          center={destination}
          radius={10}
          pathOptions={destinationPath}
        />
      )}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-[500] -translate-x-1/2 rounded-full bg-[#061123]/80 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur">
        Tap untuk memilih {activeField === "start" ? "lokasi awal" : "tujuan"}
      </div>
    </MapContainer>
  );
}
