import type { Tables } from "@/integrations/supabase/types";

export type Post = Tables<"posts">;
export const POSTS_PER_PAGE = 20;
export interface PostForm {
  title: string; slug: string; content: string; excerpt: string;
  featured_image: string; playlist_embed_url: string; archive_item_id: string;
  category: string; status: string; comments_enabled: boolean; published_at: string | null;
}
export const emptyPostForm: PostForm = { title: "", slug: "", content: "", excerpt: "", featured_image: "", playlist_embed_url: "", archive_item_id: "", category: "", status: "draft", comments_enabled: true, published_at: null };
export function postToForm(post: Post): PostForm {
  return { title: post.title, slug: post.slug, content: post.content ?? "", excerpt: post.excerpt ?? "", featured_image: post.featured_image ?? "", playlist_embed_url: post.playlist_embed_url ?? "", archive_item_id: post.archive_item_id ?? "", category: post.category ?? "", status: post.status, comments_enabled: post.comments_enabled, published_at: post.published_at };
}
export function postPayload(form: PostForm, now = new Date().toISOString()) {
  return { ...form, featured_image: form.featured_image || null, playlist_embed_url: form.playlist_embed_url || null, archive_item_id: form.archive_item_id || null, category: form.category || null, published_at: form.published_at || (form.status === "published" ? now : null) };
}
export function generatePostSlug(title: string) { return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
export function filterPosts(posts: Post[], status: string, search: string, category: string) {
  const needle = search.trim().toLocaleLowerCase();
  return posts.filter(post => (status === "all" || post.status === status) && (!needle || post.title.toLocaleLowerCase().includes(needle)) && (category === "all" || (category === "uncategorized" ? !post.category : post.category === category)));
}
export function postCounts(posts: Post[]) {
  return { all: posts.length, published: posts.filter(p => p.status === "published").length, draft: posts.filter(p => p.status === "draft").length, scheduled: posts.filter(p => p.status === "scheduled").length };
}
export function paginatePosts(posts: Post[], page: number) {
  const pages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const current = Math.max(1, Math.min(page, pages));
  return { pages, current, rows: posts.slice((current - 1) * POSTS_PER_PAGE, current * POSTS_PER_PAGE) };
}