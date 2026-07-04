import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

export type MapLead = {
  business_name: string;
  rating: number;
  has_website: boolean;
  address: string;
  lat: number | null;
  lng: number | null;
};

type LeafletMod = typeof import("leaflet");
type RLMod = typeof import("react-leaflet");

export function LeadsMap({ leads }: { leads: MapLead[] }) {
  const [mods, setMods] = useState<{ L: LeafletMod; RL: RLMod } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import("leaflet"), import("react-leaflet")]).then(([L, RL]) => {
      if (cancelled) return;
      // Fix default icon paths (Leaflet's bundler quirk)
      // We use custom divIcons below, so this is just defensive.
      setMods({ L: L.default ?? L, RL });
    });
    return () => { cancelled = true; };
  }, []);

  const points = useMemo(
    () => leads.filter((l): l is MapLead & { lat: number; lng: number } =>
      typeof l.lat === "number" && typeof l.lng === "number"),
    [leads],
  );

  const center = useMemo<[number, number]>(() => {
    if (!points.length) return [39.5, -98.35];
    const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
    return [lat, lng];
  }, [points]);

  if (!mods) {
    return (
      <div className="h-[520px] grid place-items-center rounded-xl border border-ls-border bg-ls-surface-elevated text-ls-text-muted text-sm">
        Loading map…
      </div>
    );
  }

  if (!points.length) {
    return (
      <div className="h-[520px] grid place-items-center rounded-xl border border-dashed border-ls-border bg-ls-surface-elevated text-ls-text-muted text-sm">
        No mappable results yet — run a search first.
      </div>
    );
  }

  const { L, RL } = mods;
  const { MapContainer, TileLayer, Marker, Popup } = RL;

  const makeIcon = (color: string) =>
    L.divIcon({
      className: "leadora-pin",
      html: `<div style="width:18px;height:18px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,0.45),0 2px 6px rgba(0,0,0,0.5)"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -10],
    });

  const orangeIcon = makeIcon("#F97316");
  const grayIcon = makeIcon("#9CA3AF");

  return (
    <div className="h-[520px] rounded-xl overflow-hidden border border-ls-border">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p, i) => {
          const highValue = !p.has_website;
          return (
            <Marker key={i} position={[p.lat, p.lng]} icon={highValue ? orangeIcon : grayIcon}>
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-semibold text-sm mb-1">{p.business_name}</div>
                  <div className="text-xs text-neutral-600 mb-1">
                    ★ {p.rating.toFixed(1)} {highValue && <span className="ml-1 text-orange-600 font-medium">· No website</span>}
                  </div>
                  <div className="text-xs text-neutral-500 mb-2">{p.address}</div>
                  <Link
                    to="/leads"
                    className="inline-block text-xs font-medium text-ls-text bg-[#7621B0] hover:bg-[#8a2bcc] px-2.5 py-1 rounded-md no-underline"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="flex items-center gap-4 px-3 py-2 text-xs text-ls-text-muted bg-ls-surface/40 border-t border-ls-border">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#F97316]" /> No Website — High Value
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#9CA3AF]" /> Has Website
        </span>
      </div>
    </div>
  );
}
