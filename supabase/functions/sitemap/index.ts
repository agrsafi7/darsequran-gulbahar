import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.darsequrangulbahar.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published posts
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    // Fetch all categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id, slug, parent_id, updated_at")
      .order("sort_order", { ascending: true });

    // Fetch all published pages
    const { data: pages } = await supabase
      .from("pages")
      .select("slug, updated_at")
      .eq("status", "published");

    // Build category hierarchy for proper URLs
    const categoryMap = new Map(categories?.map(c => [c.id, c]) || []);
    
    const getCategoryUrl = (category: any): string => {
      if (!category.parent_id) {
        return `/${category.slug}`;
      }
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        return `${getCategoryUrl(parent)}/${category.slug}`;
      }
      return `/${category.slug}`;
    };

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/about", priority: "0.8", changefreq: "monthly" },
      { url: "/contact", priority: "0.8", changefreq: "monthly" },
      { url: "/dars-e-quran", priority: "0.9", changefreq: "weekly" },
    ];

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add dynamic pages
    if (pages) {
      for (const page of pages) {
        const lastmod = page.updated_at ? new Date(page.updated_at).toISOString().split("T")[0] : "";
        xml += `  <url>
    <loc>${SITE_URL}/page/${page.slug}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    // Add categories
    if (categories) {
      for (const category of categories) {
        const url = getCategoryUrl(category);
        const lastmod = category.updated_at ? new Date(category.updated_at).toISOString().split("T")[0] : "";
        xml += `  <url>
    <loc>${SITE_URL}${url}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    // Add posts
    if (posts) {
      for (const post of posts) {
        const lastmod = post.updated_at ? new Date(post.updated_at).toISOString().split("T")[0] : "";
        xml += `  <url>
    <loc>${SITE_URL}/post/${post.slug}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
