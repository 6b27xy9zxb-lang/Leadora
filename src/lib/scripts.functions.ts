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

    const groqKey =
      process.env.GROQ_API_KEY ||
      process.env.VITE_GROQ_API_KEY;

    if (!groqKey) {
      throw new Error(
        "Groq API key is missing. Add GROQ_API_KEY to your environment variables."
      );
    }

    const systemPrompt = `
You are an expert B2B sales copywriter and website conversion strategist.

You help web designers and digital agencies sell websites to local businesses.

Create practical, personalized, high-converting content.
Use the actual business name, category, city and rating provided.
Do not use generic placeholders.
`;

    let userPrompt: string;

    if (data.type === "cold_call") {
      userPrompt = `
Create a natural and persuasive cold-call script for a web designer contacting this business.

Business name: ${data.businessName}
Category: ${data.category || "local business"}
City: ${data.city || "local area"}
Rating: ${data.rating || "not available"} stars
Phone: ${data.phone || "not available"}

The business appears to have no website.

Requirements:
- Keep it under 90 seconds.
- Start naturally and confidently.
- Mention a relevant observation about the business.
- Explain how a professional website could help get more customers.
- Mention that we already prepared a website preview.
- Handle: "We don't need a website."
- Handle: "We already get customers through Google/Instagram."
- Do not sound pushy.
- End by asking for 5 minutes to show the preview.

Structure:

OPENING

VALUE PITCH

OBJECTION HANDLER

SOFT CLOSE

Return only the finished script.
`;
    } else {
      userPrompt = `
Create a detailed AI website-builder prompt for:

Business: ${data.businessName}
Category: ${data.category || "local business"}
City: ${data.city || "local area"}
Rating: ${data.rating || "not available"} stars

The website is a premium sales preview.

Include:

1. Brand direction
2. Color palette
3. Typography
4. Hero section
5. Hero headline and subtitle
6. CTA buttons
7. About section
8. Services section with 4-6 services
9. Why choose us section
10. Reviews/testimonials
11. Gallery
12. Contact section
13. Footer
14. Mobile responsiveness
15. Modern animations
16. SEO-friendly structure
17. Conversion-focused UX

Make the prompt detailed enough for an AI website builder to directly generate the complete website.

Return ONLY the website-builder prompt.
`;
    }

    // ------------------------------------------------------------
    // FIND A MODEL AVAILABLE TO THIS GROQ API KEY
    // ------------------------------------------------------------

    const modelsResponse = await fetch(
      "https://api.groq.com/openai/v1/models",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${groqKey}`,
        },
      }
    );

    if (!modelsResponse.ok) {
      const errorText = await modelsResponse.text();

      console.error(
        "[Groq models]",
        modelsResponse.status,
        errorText
      );

      throw new Error(
        `Unable to access Groq models (${modelsResponse.status}).`
      );
    }

    const modelsJson = (await modelsResponse.json()) as {
      data?: Array<{
        id?: string;
        active?: boolean;
      }>;
    };

    const availableModels =
      modelsJson.data
        ?.filter((model) => model.active !== false)
        .map((model) => model.id)
        .filter(Boolean) ?? [];

    console.log(
      "[Groq] Available models:",
      availableModels
    );

    // Prefer these models in this order.
    const preferredModels = [
      "llama-3.1-8b-instant",
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
      "llama-3.3-70b-versatile",
    ];

    const selectedModel =
      preferredModels.find((model) =>
        availableModels.includes(model)
      ) ?? availableModels[0];

    if (!selectedModel) {
      throw new Error(
        "No usable Groq chat model is available for this API key."
      );
    }

    console.log(
      "[Groq] Using model:",
      selectedModel
    );

    // ------------------------------------------------------------
    // GENERATE CONTENT
    // ------------------------------------------------------------

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          temperature: 0.7,
          max_tokens:
            data.type === "cold_call"
              ? 700
              : 1400,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "[Groq generation error]",
        response.status,
        errorText
      );

      let message = errorText;

      try {
        const parsed = JSON.parse(errorText);

        message =
          parsed?.error?.message ||
          errorText;
      } catch {
        // Keep original response
      }

      throw new Error(
        `Groq API error (${response.status}): ${message}`
      );
    }

    const json = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const content =
      json.choices?.[0]?.message?.content?.trim() ?? "";

    if (!content) {
      throw new Error(
        "Groq returned an empty response."
      );
    }

    // ------------------------------------------------------------
    // SAVE GENERATED CONTENT
    // ------------------------------------------------------------

    try {
      const { error } = await supabase
        .from("scripts")
        .insert({
          user_id: userId,
          lead_id: data.leadId ?? null,
          business_name: data.businessName,
          type: data.type,
          content,
        });

      if (error) {
        console.error(
          "[scripts insert]",
          error
        );
      }
    } catch (error) {
      console.error(
        "[scripts save]",
        error
      );
    }

    return {
      content,
      id: undefined,
      remainingCredits: 999,
    };
  });