import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SearchInput = z.object({
  city: z.string().min(1),
  category: z.string().min(1),
  minRating: z.number().min(0).max(5).default(0),
});

interface PlaceResult {
  business_name: string;
  category: string;
  city: string;
  phone: string;
  address: string;
  rating: number;
  review_count: number;
  has_website: boolean;
  osm_updated_at: string | null;
  lat: number | null;
  lng: number | null;
}

// Maps a free-text category into an OSM tag filter. Extend this map as you
// see what categories your users search for most.
function categoryToOsmTag(category: string): string {
  const c = category.toLowerCase();
  const map: Record<string, string> = {
    restaurant: '"amenity"="restaurant"',
    cafe: '"amenity"="cafe"',
    coffee: '"amenity"="cafe"',
    bakery: '"shop"="bakery"',
    salon: '"shop"="hairdresser"',
    "hair salon": '"shop"="hairdresser"',
    spa: '"shop"="beauty"',
    dental: '"amenity"="dentist"',
    dentist: '"amenity"="dentist"',
    doctor: '"amenity"="doctors"',
    clinic: '"amenity"="clinic"',
    gym: '"leisure"="fitness_centre"',
    fitness: '"leisure"="fitness_centre"',
    yoga: '"leisure"="fitness_centre"',
    plumber: '"craft"="plumber"',
    plumbing: '"craft"="plumber"',
    electrician: '"craft"="electrician"',
    florist: '"shop"="florist"',
    "pet grooming": '"shop"="pet_grooming"',
    "auto repair": '"shop"="car_repair"',
    mechanic: '"shop"="car_repair"',
    tattoo: '"shop"="tattoo"',
    hotel: '"tourism"="hotel"',
    lawyer: '"office"="lawyer"',
    "real estate": '"office"="estate_agent"',
    accountant: '"office"="accountant"',
    photography: '"shop"="photo"',
    bookstore: '"shop"="books"',
    bar: '"amenity"="bar"',
    pub: '"amenity"="pub"',
  };
  for (const key of Object.keys(map)) {
    if (c.includes(key)) return map[key];
  }
  // Generic fallback: any shop or office whose name/type text loosely matches.
  return '"shop"';
}

function formatOsmAddress(tags: Record<string, string>): string {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
  ].filter(Boolean);
  return parts.join(", ");
}

export const searchLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SearchInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Demo mode: unlimited searches — credit check disabled.
    const remaining = 999;


    let results: PlaceResult[] = [];
    let mock = false;

    // Overpass API (OpenStreetMap) — completely free, no API key, no billing
    // account required. Trade-off vs. Google Places: OSM has no star ratings
    // or review counts, so minRating filtering is skipped for real results.
    try {
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(data.city)}`,
        { headers: { "User-Agent": "Leadora/1.0 (lead-generation-app)" } },
      );
      const geoJson = (await geo.json()) as Array<{ lat: string; lon: string }>;
      const center = geoJson[0];

      if (center) {
        const lat = parseFloat(center.lat);
        const lon = parseFloat(center.lon);
        const radiusMeters = 8000;
        const tag = categoryToOsmTag(data.category);

        const overpassQuery = `
          [out:json][timeout:25];
          (
            node[${tag}](around:${radiusMeters},${lat},${lon});
            way[${tag}](around:${radiusMeters},${lat},${lon});
          );
          out center 50;
        `;

        const resp = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: overpassQuery,
        });

        if (!resp.ok) {
          const txt = await resp.text();
          console.error(`[searchLeads] Overpass API error ${resp.status}: ${txt.slice(0, 500)}`);
          throw new Error("upstream_error");
        }

        const json = (await resp.json()) as {
          elements?: Array<{
            tags?: Record<string, string>;
            lat?: number;
            lon?: number;
            center?: { lat?: number; lon?: number };
          }>;
        };

        results = (json.elements ?? [])
          .filter((el) => el.tags?.name)
          .map((el) => ({
            business_name: el.tags!.name!,
            category: data.category,
            city: data.city,
            phone: el.tags?.phone ?? el.tags?.["contact:phone"] ?? "",
            address: formatOsmAddress(el.tags ?? {}) || data.city,
            rating: 0,
            review_count: 0,
            has_website: Boolean(el.tags?.website ?? el.tags?.["contact:website"]),
            osm_updated_at: null,
            lat: el.lat ?? el.center?.lat ?? null,
            lng: el.lon ?? el.center?.lon ?? null,
          }));
      }
    } catch (e) {
      console.error("[searchLeads] Overpass lookup failed, falling back to mock data", e);
      results = [];
    }

    if (results.length === 0) {
      mock = true;
      const sample = [
        "Mario's Pizzeria", "Sunset Salon", "Bright Smile Dental", "Iron Forge Gym",
        "Quick Fix Plumbing", "Bloom Florist", "Pawsome Grooming", "Corner Bakery",
        "Speedy Auto Repair", "Green Leaf Yoga", "Stone Hearth Cafe", "Pixel Tattoo Studio",
      ];
      // Deterministic-ish city center: hash the city string into a lat/lng seed
      let hash = 0;
      for (let i = 0; i < data.city.length; i++) hash = (hash * 31 + data.city.charCodeAt(i)) | 0;
      const baseLat = 25 + ((Math.abs(hash) % 2000) / 100); // 25..45
      const baseLng = -120 + ((Math.abs(hash >> 3) % 6000) / 100); // -120..-60
      results = sample.map((name, i) => {
        const daysAgo = Math.random() < 0.4 ? Math.floor(Math.random() * 30) : 30 + Math.floor(Math.random() * 365);
        const osm = new Date(Date.now() - daysAgo * 86400000).toISOString();
        return {
          business_name: name,
          category: data.category,
          city: data.city,
          phone: `(555) 010-${String(1000 + i).slice(-4)}`,
          address: `${100 + i * 7} Main St, ${data.city}`,
          rating: Math.round((3.2 + Math.random() * 1.6) * 10) / 10,
          review_count: Math.floor(20 + Math.random() * 280),
          has_website: Math.random() > 0.55,
          osm_updated_at: osm,
          lat: baseLat + (Math.random() - 0.5) * 0.08,
          lng: baseLng + (Math.random() - 0.5) * 0.08,
        };
      }).filter((r) => r.rating >= data.minRating);
    }

    // Sort: no-website leads first, then by rating desc
    results.sort((a, b) => {
      if (a.has_website !== b.has_website) return a.has_website ? 1 : -1;
      return b.rating - a.rating;
    });

    return { results, mock, remainingCredits: remaining ?? 0 };
  });



const SaveLeadInput = z.object({
  business_name: z.string(),
  category: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  rating: z.number().optional(),
  review_count: z.number().optional(),
  has_website: z.boolean().default(false),
  osm_updated_at: z.string().nullable().optional(),
});

export const saveLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveLeadInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("leads")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) {
      console.error("[saveLead]", error);
      throw new Error("Failed to save lead. Please try again.");
    }
    return row;

  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("leads")
      .select("*")
      .order("saved_at", { ascending: false });
    if (error) {
      console.error("[listLeads]", error);
      throw new Error("Failed to load leads.");
    }

    return data ?? [];
  });

const UpdateTagsInput = z.object({
  id: z.string().uuid(),
  tags: z.array(z.string().min(1).max(40)).max(20),
});

export const updateLeadTags = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateTagsInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("leads")
      .update({ tags: data.tags })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) {
      console.error("[updateLeadTags]", error);
      throw new Error("Failed to update tags.");
    }
    return { ok: true };
  });

const BulkDeleteInput = z.object({ ids: z.array(z.string().uuid()).min(1).max(500) });

export const bulkDeleteLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BulkDeleteInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error, count } = await context.supabase
      .from("leads")
      .delete({ count: "exact" })
      .in("id", data.ids)
      .eq("user_id", context.userId);
    if (error) {
      console.error("[bulkDeleteLeads]", error);
      throw new Error("Failed to delete leads.");
    }
    return { deleted: count ?? 0 };
  });
