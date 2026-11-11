import { describe, expect, it } from "vitest";
import { buildPostData, countByStatus, emptyForm, filterPosts, paginate } from "@/pages/admin/postModel";

const p = (title: string, status: string, category: string | null = null) => ({ title, status, category });
const posts = [p("Dora Tafseer 2019", "published", "Dora"), p("Weekly Dars", "draft", "Weekly"), p("Upcoming", "scheduled", "Dora"), p("Dora 2018", "published", "Dora")];

describe("admin posts list", () => {
  it("counts each status tab from real posts", () => {
    expect(countByStatus(posts)).toEqual({ all: 4, published: 2, draft: 1, scheduled: 1 });
  });
  it("searches titles case-insensitively and combines with status and category", () => {
    expect(filterPosts(posts, "all", "dora", "all").map(x => x.title)).toEqual(["Dora Tafseer 2019", "Dora 2018"]);
    expect(filterPosts(posts, "scheduled", "", "Dora").map(x => x.title)).toEqual(["Upcoming"]);
    expect(filterPosts(posts, "published", "", "Weekly")).toEqual([]);
  });
  it("shows 20 posts per page", () => {
    const r = paginate(Array.from({ length: 45 }, (_, i) => i), 3);
    expect([r.pages, r.items.length, r.items[0]]).toEqual([3, 5, 40]);
    expect(paginate(Array.from({ length: 45 }, (_, i) => i), 1).items.length).toBe(20);
  });
});

describe("post editor saving", () => {
  it("keeps both Archive.org audio fields and blanks become empty", () => {
    const d = buildPostData({ ...emptyForm(), title: "T", slug: "t", archive_item_id: "DoraTafseer2019", playlist_embed_url: "" }, null);
    expect(d.archive_item_id).toBe("DoraTafseer2019");
    expect(d.playlist_embed_url).toBeNull();
    expect(d.published_at).toBeNull();
  });
  it("gives a new published post today's date and keeps an existing post's date", () => {
    const now = new Date("2026-11-11T00:00:00Z");
    expect(buildPostData({ ...emptyForm(), status: "published" }, null, now).published_at).toBe(now.toISOString());
    expect(buildPostData({ ...emptyForm(), status: "published" }, { published_at: "2019-01-01T00:00:00.000Z" } as never, now).published_at).toBe("2019-01-01T00:00:00.000Z");
  });
});
