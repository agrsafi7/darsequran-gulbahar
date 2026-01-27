import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    // Find all scheduled posts where published_at has passed
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from("posts")
      .select("id, title, published_at")
      .eq("status", "scheduled")
      .lte("published_at", now);

    if (fetchError) {
      console.error("Error fetching scheduled posts:", fetchError);
      throw fetchError;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log("No scheduled posts to publish");
      return new Response(
        JSON.stringify({ message: "No scheduled posts to publish", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update all found posts to published
    const postIds = scheduledPosts.map((post) => post.id);
    
    const { error: updateError } = await supabase
      .from("posts")
      .update({ status: "published" })
      .in("id", postIds);

    if (updateError) {
      console.error("Error updating posts:", updateError);
      throw updateError;
    }

    console.log(`Published ${scheduledPosts.length} scheduled posts:`, scheduledPosts.map(p => p.title));

    return new Response(
      JSON.stringify({
        message: `Published ${scheduledPosts.length} scheduled post(s)`,
        count: scheduledPosts.length,
        posts: scheduledPosts.map((p) => ({ id: p.id, title: p.title })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in publish-scheduled-posts:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
