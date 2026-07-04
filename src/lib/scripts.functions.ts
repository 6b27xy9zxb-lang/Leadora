import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  businessName: z.string().min(1),
  category: z.string().optional().default(""),
  city: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  rating: z.number().optional().default(0),
  type: z.enum(["cold_call", "ai_prompt"]),
  leadId: z.string().uuid().optional(),
});

export const generateScript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Demo mode: unlimited script generation — credit check disabled.
    const remaining = 999;


    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) throw new Error("AI service unavailable");


    const systemPrompt =
      "You are an expert sales copywriter specializing in cold outreach for web design agencies.";

    const userPrompt = data.type === "cold_call"
      ? `Write a natural, persuasive cold call script for a web designer reaching out to ${data.businessName}, a ${data.category} business in ${data.city} with a ${data.rating || "high"} star rating. They have no website. The script should:
- Be under 90 seconds when spoken
- Open with a specific observation about their business
- Mention you already have a draft website for them
- Handle the objection "we don't need a website"
- End with a soft close asking for 5 minutes to share a preview

Format: Opening | Value Pitch | Objection Handler | Close`
      : `Write a detailed AI website builder prompt for ${data.businessName}, a ${data.category} in ${data.city}.
The prompt should specify:
- Design style and color palette for this business type
- Hero section with relevant imagery description
- Services section structure
- CTA button text
- Overall tone and personality

Format it to work perfectly with Framer, v0, or any AI website builder.`;

    // Groq's Chat Completions API is OpenAI-compatible and has a free tier —
    // get a key at https://console.groq.com/keys. Swap GROQ_MODEL below if
    // your account has a different model enabled (see console.groq.com/docs/models).
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        max_tokens: 500,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (resp.status === 429) throw new Error("Rate limit hit — try again in a moment.");
    if (resp.status === 401) throw new Error("AI service misconfigured (invalid GROQ_API_KEY).");
    if (!resp.ok) throw new Error(`AI error: ${resp.status}`);

    const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content?.trim() ?? "";

    const { data: row } = await supabase.from("scripts").insert({
      user_id: userId,
      lead_id: data.leadId ?? null,
      business_name: data.businessName,
      type: data.type,
      content,
    }).select().single();

    return { content, id: row?.id, remainingCredits: remaining ?? 0 };

  });
