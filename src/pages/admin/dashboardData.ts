export interface DashboardPost {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  created_at: string;
  published_at: string | null;
  archive_item_id: string | null;
  playlist_embed_url: string | null;
}

export function getPopularPosts(posts: DashboardPost[], counts: { post_id: string | null; total_views: number | null }[]) {
  const views = new Map(counts.map(row => [row.post_id, row.total_views ?? 0]));
  return posts.map(post => ({ ...post, views: views.get(post.id) ?? 0 })).filter(post => post.views > 0).sort((a, b) => b.views - a.views).slice(0, 5);
}

export function countAudioPosts(posts: DashboardPost[]) {
  return posts.filter(post => Boolean(post.archive_item_id?.trim() || post.playlist_embed_url?.trim())).length;
}