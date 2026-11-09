export type PostStatusTab = "all" | "published" | "draft" | "scheduled";
export const POSTS_PER_PAGE = 20;

export interface ListPost {
  id: string;
  title: string;
  category: string | null;
  status: string;
}

export function countByStatus(posts: ListPost[]) {
  return {
    all: posts.length,
    published: posts.filter(p => p.status === "published").length,
    draft: posts.filter(p => p.status === "draft").length,
    scheduled: posts.filter(p => p.status === "scheduled").length,
  };
}

export function filterPosts<T extends ListPost>(posts: T[], tab: PostStatusTab, search: string, category: string) {
  const term = search.trim().toLowerCase();
  return posts.filter(p =>
    (tab === "all" || p.status === tab) &&
    (!term || p.title.toLowerCase().includes(term)) &&
    (category === "all" || (category === "none" ? !p.category : p.category === category)),
  );
}

export function paginate<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / POSTS_PER_PAGE));
  const current = Math.min(Math.max(1, page), totalPages);
  return { items: items.slice((current - 1) * POSTS_PER_PAGE, current * POSTS_PER_PAGE), page: current, totalPages };
}
