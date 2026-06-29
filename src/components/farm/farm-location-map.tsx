import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  color?: string;
};

const TOKEN_KEY = "agritwin.mapbox.token";

export function getMapboxToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setMapboxToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function MapboxConfigPrompt({ onSaved }: { onSaved?: () => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <KeyRound className="h-4 w-4 text-primary" />
        Mapbox API key required
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Paste your Mapbox public token (starts with <code className="rounded bg-muted px-1">pk.</code>) to enable the map.
        Get one free at{" "}
        <a
          href="https://account.mapbox.com/access-tokens/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          mapbox.com
        </a>
        . Stored only in your browser.
      </p>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!value.trim()) return;
          setMapboxToken(value.trim());
          onSaved?.();
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="pk.eyJ1Ijoi..."
          autoComplete="off"
        />
        <Button type="submit">Save token</Button>
      </form>
    </div>
  );
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
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerObjsRef = useRef<mapboxgl.Marker[]>([]);
  const [token, setToken] = useState<string | null>(getMapboxToken());

  // Init map once token + container ready
  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: center ? [center.longitude, center.latitude] : [78.9629, 20.5937],
      zoom: center ? 14 : 4,
    });
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    if (onPick) {
      map.on("click", (e) => {
        onPick({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
      });
    }
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Update markers + bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const m of markerObjsRef.current) m.remove();
    markerObjsRef.current = [];
    const coords: [number, number][] = [];
    for (const m of markers) {
      const el = document.createElement("div");
      el.style.cssText = `width:18px;height:18px;border-radius:9999px;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.4);background:${m.color ?? "#10b981"}`;
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([m.longitude, m.latitude])
        .setPopup(m.label ? new mapboxgl.Popup({ offset: 12 }).setText(m.label) : undefined)
        .addTo(map);
      markerObjsRef.current.push(marker);
      coords.push([m.longitude, m.latitude]);
    }
    if (coords.length === 1) {
      map.flyTo({ center: coords[0], zoom: 15, essential: true });
    } else if (coords.length > 1) {
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0]),
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 600 });
    }
  }, [markers]);

  if (!token) {
    return <MapboxConfigPrompt onSaved={() => setToken(getMapboxToken())} />;
  }

  if (!center && markers.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="Farm location not set"
        description="Add latitude and longitude below to place your farm on the map."
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-xl border"
      style={{ height }}
    />
  );
}
