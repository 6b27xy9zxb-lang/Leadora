import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SearchInput = z.object({
  city: z.string().trim().min(1, "City is required"),
  category: z.string().trim().min(1, "Category is required"),
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

export const searchLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SearchInput.parse(d))
  .handler(async ({ data, context }) => {
    // Demo mode: unlimited searches
    const remaining = 999;

    // Use only the server-side Google Maps API key.
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;

    // Log only a safe portion of the key for debugging.
    // The full API key is NEVER logged.
    console.log(
      "[searchLeads] Google key loaded:",
      mapsKey
        ? `${mapsKey.slice(0, 6)}...${mapsKey.slice(-4)}`
        : "MISSING"
    );

    if (!mapsKey) {
      console.error(
        "[searchLeads] Missing GOOGLE_MAPS_API_KEY"
      );

      throw new Error(
        "Google Maps API key is not configured."
      );
    }

    const query = `${data.category} in ${data.city}`;

    try {
      const response = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": mapsKey,
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.location",
          },

          body: JSON.stringify({
            textQuery: query,
            pageSize: 20,
          }),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error(
          `[searchLeads] Google Places API error ${response.status}:`,
          responseText
        );

        let googleMessage = "";

        try {
          const errorJson = JSON.parse(responseText);

          googleMessage =
            errorJson?.error?.message || "";
        } catch {
          googleMessage = responseText;
        }

        throw new Error(
          `Google Places API error (${response.status})${
            googleMessage
              ? `: ${googleMessage}`
              : ""
          }`
        );
      }

      let json: {
        places?: Array<{
          displayName?: {
            text?: string;
          };

          formattedAddress?: string;

          nationalPhoneNumber?: string;

          internationalPhoneNumber?: string;

          rating?: number;

          userRatingCount?: number;

          websiteUri?: string;

          location?: {
            latitude?: number;
            longitude?: number;
          };
        }>;
      };

      try {
        json = JSON.parse(responseText);
      } catch (error) {
        console.error(
          "[searchLeads] Invalid Google response:",
          error
        );

        throw new Error(
          "Invalid response received from Google Places."
        );
      }

      const results: PlaceResult[] = (
        json.places ?? []
      )
        .filter(
          (place) =>
            (place.rating ?? 0) >= data.minRating
        )
        .map((place) => ({
          business_name:
            place.displayName?.text ??
            "Unknown Business",

          category: data.category,

          city: data.city,

          phone:
            place.nationalPhoneNumber ??
            place.internationalPhoneNumber ??
            "",

          address:
            place.formattedAddress ?? "",

          rating: place.rating ?? 0,

          review_count:
            place.userRatingCount ?? 0,

          has_website:
            Boolean(place.websiteUri),

          osm_updated_at: null,

          lat:
            place.location?.latitude ?? null,

          lng:
            place.location?.longitude ?? null,
        }));

      // Put businesses WITHOUT websites first,
      // because those are the best website-development leads.
      results.sort((a, b) => {
        if (
          a.has_website !==
          b.has_website
        ) {
          return a.has_website ? 1 : -1;
        }

        return b.rating - a.rating;
      });

      console.log(
        `[searchLeads] "${query}" → ${results.length} results`
      );

      return {
        results,
        mock: false,
        remainingCredits: remaining,
      };
    } catch (error) {
      console.error(
        "[searchLeads] Search failed:",
        error
      );

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error(
        "Google Places search failed. Please try again."
      );
    }
  });


// ============================================================
// SAVE LEAD
// ============================================================

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

export const saveLead = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    SaveLeadInput.parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error, data: row } =
      await context.supabase
        .from("leads")
        .insert({
          ...data,
          user_id: context.userId,
        })
        .select()
        .single();

    if (error) {
      console.error(
        "[saveLead]",
        error
      );

      throw new Error(
        "Failed to save lead. Please try again."
      );
    }

    return row;
  });


// ============================================================
// LIST SAVED LEADS
// ============================================================

export const listLeads = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } =
      await context.supabase
        .from("leads")
        .select("*")
        .eq(
          "user_id",
          context.userId
        )
        .order("saved_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "[listLeads]",
        error
      );

      throw new Error(
        "Failed to load leads."
      );
    }

    return data ?? [];
  });


// ============================================================
// UPDATE TAGS
// ============================================================

const UpdateTagsInput = z.object({
  id: z.string().uuid(),

  tags: z
    .array(
      z.string()
        .min(1)
        .max(40)
    )
    .max(20),
});

export const updateLeadTags = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    UpdateTagsInput.parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error } =
      await context.supabase
        .from("leads")
        .update({
          tags: data.tags,
        })
        .eq("id", data.id)
        .eq(
          "user_id",
          context.userId
        );

    if (error) {
      console.error(
        "[updateLeadTags]",
        error
      );

      throw new Error(
        "Failed to update tags."
      );
    }

    return {
      ok: true,
    };
  });


// ============================================================
// BULK DELETE
// ============================================================

const BulkDeleteInput = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1)
    .max(500),
});

export const bulkDeleteLeads = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    BulkDeleteInput.parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error, count } =
      await context.supabase
        .from("leads")
        .delete({
          count: "exact",
        })
        .in("id", data.ids)
        .eq(
          "user_id",
          context.userId
        );

    if (error) {
      console.error(
        "[bulkDeleteLeads]",
        error
      );

      throw new Error(
        "Failed to delete leads."
      );
    }

    return {
      deleted: count ?? 0,
    };
  });