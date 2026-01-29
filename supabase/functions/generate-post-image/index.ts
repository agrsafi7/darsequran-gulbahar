import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const IMGBB_API_KEY = Deno.env.get("IMGBB_API_KEY");
    if (!IMGBB_API_KEY) {
      throw new Error("IMGBB_API_KEY is not configured. Please add your ImgBB API key.");
    }

    // Create an Islamic-themed prompt based on the post title
    const imagePrompt = `Create a beautiful, elegant Islamic-themed featured image for a blog post titled "${title}". 
The image should feature:
- Elegant Islamic geometric patterns or arabesque designs
- Soft, calming colors like deep blues, golds, emerald greens, or warm earth tones
- Subtle calligraphy-inspired decorative elements
- A peaceful, spiritual atmosphere
- Professional blog header composition suitable for a 16:9 aspect ratio
- No text or words in the image
- High quality, modern and clean design
Ultra high resolution, professional quality.`;

    console.log("Generating image with prompt:", imagePrompt);

    // Call Lovable AI Gateway for image generation
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: imagePrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    // Extract the base64 image from the response
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageData) {
      throw new Error("No image generated from AI");
    }

    // Parse base64 data - extract just the base64 content without the data URL prefix
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image data format");
    }

    const base64Content = base64Match[2];

    // Upload to ImgBB
    const formData = new FormData();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", base64Content);
    
    // Generate a name for the image
    const slugifiedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 50);
    formData.append("name", `${slugifiedTitle}-${Date.now()}`);

    console.log("Uploading to ImgBB...");

    const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const imgbbData = await imgbbResponse.json();

    if (!imgbbResponse.ok || !imgbbData.success) {
      console.error("ImgBB upload error:", imgbbData);
      throw new Error(imgbbData.error?.message || "Failed to upload image to ImgBB");
    }

    const imageUrl = imgbbData.data.url;
    console.log("Image uploaded successfully to ImgBB:", imageUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: imageUrl 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
