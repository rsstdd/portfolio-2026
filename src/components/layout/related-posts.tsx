import { PostList } from "@/components/content/post-list";
import { getBlogPosts, type LoadedBlogPost } from "@/lib/content";

/**
 * Where to go after finishing a post.
 *
 * Blog posts are the only pages on this site strangers arrive on from search,
 * and they were the pages with the least to do next: posts link to each other
 * between zero and three times, and nothing else pointed anywhere. A reader who
 * liked the CORS post had to go back to the nav and guess.
 *
 * Server Component, no interactivity, so the client budget in REPO_LAYOUT.md 4
 * stays empty and /colophon's zero-island claim holds.
 *
 * WHY THE HEADING CHANGES
 *
 * Relatedness is shared tags. When a post shares none, this falls back to the
 * most recent posts rather than rendering nothing, because an empty block is a
 * dead end and the point is to offer a next step. What it does not do is call
 * those "related", because they are not, and quietly relabelling recency as
 * relevance is the sort of small dishonesty this site spends its time removing.
 * The heading says which one the reader is looking at.
 */
function rank(current: LoadedBlogPost, posts: LoadedBlogPost[], limit: number) {
  const tags = new Set(current.tags);

  const scored = posts
    .filter((post) => post.slug !== current.slug)
    .map((post) => ({ post, shared: post.tags.filter((tag) => tags.has(tag)).length }))
    .filter(({ shared }) => shared > 0)
    /*
     * Most shared tags first, then newest. Date breaks the tie rather than
     * `featured`, because this is a reading suggestion rather than a shop
     * window: what a reader wants next is the closest thing, not the thing the
     * site most wants shown.
     */
    .sort((a, b) => b.shared - a.shared || b.post.date.getTime() - a.post.date.getTime());

  if (scored.length > 0) {
    return { related: true, posts: scored.slice(0, limit).map(({ post }) => post) };
  }

  const recent = posts
    .filter((post) => post.slug !== current.slug)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);

  return { related: false, posts: recent };
}

export function RelatedPosts({ current, limit = 3 }: { current: LoadedBlogPost; limit?: number }) {
  const { related, posts } = rank(current, getBlogPosts(), limit);

  if (posts.length === 0) return null;

  return (
    <section className="mt-24 border-t border-line pt-8 md:mt-32">
      <h2 className="text-overline uppercase text-muted">
        {related ? "Related notes" : "Recent notes"}
      </h2>

      <div className="mt-6">
        <PostList posts={posts} />
      </div>
    </section>
  );
}
