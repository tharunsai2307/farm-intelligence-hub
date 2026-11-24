import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  color?: string;
};

// Kept for backwards compatibility with any existing imports.
// No API key is required — we use free OpenStreetMap tiles via Leaflet.
export function getMapboxToken(): string | null {
  return "openstreetmap";
}
export function setMapboxToken(_token: string) {
  /* no-op */
}

export function FarmLocationMap({
  center,
  markers,
  onPick,
  height = 420,
}: {
  center: { latitude: number; longitude: number } | null;
  markers: MapMarker[];
  onPick?: (coords: { latitude: number; longitude: number }) => void;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const [tileError, setTileError] = useState(false);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: center ? [center.latitude, center.longitude] : [20.5937, 78.9629],
      zoom: center ? 14 : 4,
      zoomControl: true,
    });

    // Satellite-style basemap (Esri World Imagery — no API key required, free for non-commercial use).
    const imagery = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Imagery © Esri, Maxar, Earthstar Geographics | © OpenStreetMap contributors",
        maxZoom: 19,
      },
    ).addTo(map);

    imagery.on("tileerror", () => setTileError(true));
    imagery.on("tileload", () => setTileError(false));

    markerLayerRef.current = L.layerGroup().addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => {
      onPickRef.current?.({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    });
    mapRef.current = map;

    // Ensure correct sizing after mount.
    setTimeout(() => map.invalidateSize(), 60);

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers + bounds
  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const coords: [number, number][] = [];
    for (const m of markers) {
      const color = m.color ?? "#10b981";
      const icon = L.divIcon({
        className: "agritwin-pin",
        html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;border:2px solid #fff;box-shadow:0 0 0 1px rgba(16,72,52,0.45);background:${color}"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const marker = L.marker([m.latitude, m.longitude], { icon }).addTo(layer);
      if (m.label) marker.bindPopup(m.label);
      coords.push([m.latitude, m.longitude]);
    }
    if (coords.length === 1) {
      map.flyTo(coords[0], 15, { duration: 0.6 });
    } else if (coords.length > 1) {
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 16 });
    } else if (center) {
      map.flyTo([center.latitude, center.longitude], 14, { duration: 0.4 });
    }
  }, [markers, center]);

  return (
    <div className="space-y-2">
      {tileError && <p role="alert" className="text-sm text-muted-foreground">Satellite tiles could not load. You can still enter or capture GPS coordinates.</p>}
      <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-xl border"
      style={{ height }}
    />
    </div>
  );
}
