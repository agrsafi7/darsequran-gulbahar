export interface AdminPost {
  id: string; title: string; slug: string; content: string | null; excerpt: string | null;
  featured_image: string | null; category: string | null; status: string; comments_enabled: boolean;
  published_at: string | null; created_at: string; updated_at: string;
  playlist_embed_url: string | null; archive_item_id: string | null;
}
export type StatusTab = "all" | "published" | "draft" | "scheduled";
export const PAGE_SIZE = 20;

export interface PostForm {
  title: string; slug: string; content: string; excerpt: string; featured_image: string;
  playlist_embed_url: string; archive_item_id: string; category: string; status: string;
  comments_enabled: boolean; published_at: Date | null;
}
export const emptyForm = (): PostForm => ({ title: "", slug: "", content: "", excerpt: "", featured_image: "", playlist_embed_url: "", archive_item_id: "", category: "", status: "draft", comments_enabled: true, published_at: null });

export const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const formFromPost = (p: AdminPost): PostForm => ({
  title: p.title, slug: p.slug, content: p.content || "", excerpt: p.excerpt || "", featured_image: p.featured_image || "",
  playlist_embed_url: p.playlist_embed_url || "", archive_item_id: p.archive_item_id || "", category: p.category || "",
  status: p.status, comments_enabled: p.comments_enabled, published_at: p.published_at ? new Date(p.published_at) : null,
});

/** Same field mapping as the previous editor; scheduled posts also keep their date so auto-publish works. */
export function buildPostData(f: PostForm, existing: AdminPost | null, now = new Date()) {
  let published_at: string | null = null;
  if (f.status === "published" || f.status === "scheduled") {
    if (f.published_at) published_at = f.published_at.toISOString();
    else if (existing?.published_at) published_at = existing.published_at;
    else if (f.status === "published") published_at = now.toISOString();
  }
  return {
    title: f.title, slug: f.slug, content: f.content, excerpt: f.excerpt,
    featured_image: f.featured_image || null, playlist_embed_url: f.playlist_embed_url || null,
    archive_item_id: f.archive_item_id || null, category: f.category || null,
    status: f.status, comments_enabled: f.comments_enabled, published_at,
  };
}

export function countByStatus(posts: Pick<AdminPost, "status">[]) {
  return { all: posts.length, published: posts.filter(p => p.status === "published").length, draft: posts.filter(p => p.status === "draft").length, scheduled: posts.filter(p => p.status === "scheduled").length };
}

export function filterPosts<T extends Pick<AdminPost, "status" | "title" | "category">>(posts: T[], tab: StatusTab, search: string, category: string) {
  const q = search.trim().toLowerCase();
  return posts.filter(p => (tab === "all" || p.status === tab) && (!q || p.title.toLowerCase().includes(q)) && (category === "all" || (p.category || "") === category));
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { pages, current, items: items.slice((current - 1) * size, current * size) };
}
