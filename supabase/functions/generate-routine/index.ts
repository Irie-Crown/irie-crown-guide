import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { hairProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!hairProfile) {
      throw new Error("Hair profile is required");
    }

    const systemPrompt = `You are an expert trichologist and hair care specialist with deep knowledge of textured hair (3A-4C curl patterns). You provide personalized, science-based hair care routines that are culturally affirming and avoid harmful ingredients.

Your recommendations should:
- Be specific to the user's hair type, porosity, density, and concerns
- Consider health conditions, allergies, and environmental factors
- Avoid ingredients that may cause buildup, dryness, or damage
- Be realistic and achievable based on their lifestyle
- Include education about WHY certain practices help
- Never make medical claims or diagnose conditions

Always format your response as valid JSON.`;

    const userPrompt = `Create a personalized hair care routine for someone with the following profile:

**Hair Characteristics:**
- Hair Type: ${hairProfile.hair_type}
- Texture: ${hairProfile.hair_texture}
- Porosity: ${hairProfile.hair_porosity}
- Density: ${hairProfile.hair_density}
- Length: ${hairProfile.hair_length}

**Concerns:** ${hairProfile.hair_concerns?.join(", ") || "None specified"}

**Scalp:**
- Condition: ${hairProfile.scalp_condition}
- Concerns: ${hairProfile.scalp_concerns?.join(", ") || "None"}

**Health Context:**
- Conditions: ${hairProfile.health_conditions?.join(", ") || "None"}
- Allergies: ${hairProfile.allergies?.join(", ") || "None"}
- Hormonal Status: ${hairProfile.hormonal_status || "Not specified"}

**Environment:**
- Climate: ${hairProfile.climate}
- Water Type: ${hairProfile.water_type}
- Sun Exposure: ${hairProfile.sun_exposure}

**Lifestyle:**
- Exercise: ${hairProfile.exercise_frequency}
- Heat Styling: ${hairProfile.heat_styling_frequency}
- Budget: ${hairProfile.budget_preference || "Not specified"}
- Preferences: ${hairProfile.product_preferences?.join(", ") || "None"}

Please provide a comprehensive routine in the following JSON format:
{
  "washDay": {
    "pre_wash": "Pre-wash treatment steps and product types",
    "cleanse": "Cleansing recommendations",
    "condition": "Conditioning steps",
    "style": "Styling techniques and products"
  },
  "weekly": {
    "deep_conditioning": "Weekly deep conditioning routine",
    "scalp_care": "Scalp treatment recommendations",
    "protective_styling": "Protective style suggestions"
  },
  "monthly": {
    "clarifying": "Monthly clarifying treatment",
    "protein_treatment": "Protein treatment if needed",
    "trim_maintenance": "Trim and maintenance tips"
  },
  "dos": ["List of 5-7 important do's for this hair type"],
  "donts": ["List of 5-7 important don'ts to avoid"],
  "ingredients": {
    "beneficial": ["List of beneficial ingredients to look for"],
    "avoid": ["List of ingredients to avoid"]
  },
  "tips": ["5-7 educational tips tailored to their specific needs"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate routine");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let routineData;
    try {
      routineData = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid routine format from AI");
    }

    console.log("Generated routine for hair type:", hairProfile.hair_type);

    return new Response(JSON.stringify(routineData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-routine error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
