import { supabase } from "@/integrations/supabase/client";
import type { AdminPost } from "./postModel";

export async function fetchAllPosts(): Promise<AdminPost[]> {
  const all: AdminPost[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).range(from, from + 999);
    if (error) throw error;
    all.push(...((data || []) as AdminPost[]));
    if (!data || data.length < 1000) return all;
  }
}

export async function fetchCommentCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from("comments").select("post_id").range(from, from + 999);
    if (error) throw error;
    (data || []).forEach(c => { counts[c.post_id] = (counts[c.post_id] || 0) + 1; });
    if (!data || data.length < 1000) return counts;
  }
}

export async function fetchCategoryOptions() {
  const [c, d] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order", { ascending: true }),
    supabase.from("dars_categories").select("id, title").order("sort_order", { ascending: true }),
  ]);
  return { categories: c.data || [], darsCategories: d.data || [] };
}
