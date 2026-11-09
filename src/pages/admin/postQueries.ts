import { supabase } from "@/integrations/supabase/client";
import type { Post } from "./postModel";

export async function fetchAdminPosts() {
  const posts: Post[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await supabase.from("posts").select("*").order("created_at", { ascending: false }).order("id").range(offset, offset + 999);
    if (result.error) throw result.error;
    posts.push(...result.data);
    if (result.data.length < 1000) return posts;
  }
}
export async function fetchPostCategories() {
  const [categories, scholars] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("dars_categories").select("id, title").order("sort_order"),
  ]);
  if (categories.error) throw categories.error;
  if (scholars.error) throw scholars.error;
  return { categories: categories.data, scholars: scholars.data };
}