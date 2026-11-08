import { describe, expect, it } from "vitest";
import { countAudioPosts, getPopularPosts, type DashboardPost } from "@/pages/admin/dashboardData";

const post = (id: string, values: Partial<DashboardPost> = {}): DashboardPost => ({ id, title: id, slug: id, category: null, created_at: "2026-11-07", published_at: null, archive_item_id: null, playlist_embed_url: null, ...values });

describe("real dashboard metrics", () => {
  it("counts posts with existing audio sources once, excluding text-only posts", () => {
    expect(countAudioPosts([post("archive", { archive_item_id: "DoraTafseer2019" }), post("embed", { playlist_embed_url: "https://archive.org/embed/test" }), post("both", { archive_item_id: "test", playlist_embed_url: "https://archive.org/embed/test" }), post("text"), post("blank", { archive_item_id: " " })])).toBe(3);
  });
  it("ranks popular posts by actual recorded views rather than recent order", () => {
    expect(getPopularPosts([post("recent"), post("popular"), post("unviewed")], [{ post_id: "recent", total_views: 2 }, { post_id: "popular", total_views: 40 }]).map(p => [p.id, p.views])).toEqual([["popular", 40], ["recent", 2]]);
  });
});