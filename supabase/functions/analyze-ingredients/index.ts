import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // === Auth middleware ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("Auth validation failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);
    // === End auth middleware ===

    const { productName, ingredients } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!ingredients) {
      throw new Error("Ingredients list is required");
    }

    const systemPrompt = `You are an expert cosmetic chemist specializing in hair care products for textured hair (3A-4C curl patterns). You analyze ingredient lists and identify:

1. **Safe ingredients** - Generally beneficial or neutral for textured hair
2. **Caution ingredients** - May cause issues for some people or need proper use
3. **Avoid ingredients** - Commonly problematic for textured hair (harsh sulfates, drying alcohols, heavy silicones that cause buildup, etc.)

Consider that textured hair is often:
- More prone to dryness
- Sensitive to harsh sulfates
- Prone to buildup from heavy silicones if not properly cleansed
- Affected by certain alcohols differently than straight hair

Always provide educational context for WHY an ingredient is flagged. Never make medical claims.

Respond in valid JSON format only.`;

    const userPrompt = `Analyze this ingredient list for a hair product called "${productName || 'Unknown Product'}":

${ingredients}

Please analyze each significant ingredient and categorize them. Focus on the most important ones (first 15-20 ingredients typically have the most impact).

Respond in this JSON format:
{
  "summary": "A 2-3 sentence overall assessment of this product for textured hair",
  "overallRating": "good" | "fair" | "poor",
  "ingredients": [
    {
      "name": "Ingredient name",
      "status": "safe" | "caution" | "avoid",
      "reason": "Brief explanation of why this ingredient is rated this way",
      "alternatives": ["Alternative ingredient suggestions if status is caution or avoid"]
    }
  ]
}

Focus on the most impactful ingredients. Include at least the first 10 ingredients and any notable ones further in the list.`;

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
      throw new Error("Failed to analyze ingredients");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid analysis format from AI");
    }

    console.log("Analyzed product:", productName || "Unknown", "- Rating:", analysisResult.overallRating);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-ingredients error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
