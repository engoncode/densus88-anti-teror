import type { PropamPost } from '../types';

import { Eye, Flame, Heart, MapPin, ExternalLink } from 'lucide-react';

import { formatNumber, formatDateTime } from '../format';
import { UrgencyBadge, KeywordChip, CategoryBadge } from './badges';

// ----------------------------------------------------------------------

export function PostCard({ post }: { post: PropamPost }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <header className="flex flex-wrap items-center gap-2">
        <UrgencyBadge level={post.urgency.level} />
        <CategoryBadge category={post.primary_category} />
        {post.is_viral && (
          <span className="inline-flex items-center gap-1 rounded-full border border-danger/40 bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
            <Flame strokeWidth={1.5} className="size-3" aria-hidden="true" />
            Viral
          </span>
        )}
        {post.unit && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-fg-muted">
            <MapPin strokeWidth={1.5} className="size-3" aria-hidden="true" />
            {post.unit}
          </span>
        )}
        <span className="ml-auto text-xs text-fg-muted">{formatDateTime(post.posted_at)}</span>
      </header>

      <p className="mt-3 text-sm leading-relaxed text-fg">{post.text}</p>

      {post.keywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.keywords.map((k) => (
            <KeywordChip key={k}>{k}</KeywordChip>
          ))}
        </div>
      )}

      <footer className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-fg-muted">
        <span className="font-medium text-fg">
          @{post.author.username ?? 'tanpa-nama'}
          {post.platform ? ` · ${post.platform}` : ''}
        </span>
        <span className="inline-flex items-center gap-1">
          <Heart strokeWidth={1.5} className="size-3" aria-hidden="true" />
          {formatNumber(post.engagement)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Eye strokeWidth={1.5} className="size-3" aria-hidden="true" />
          {formatNumber(post.reach)}
        </span>
        {post.velocity_per_hour !== undefined && <span>{post.velocity_per_hour}/jam</span>}
        {post.url && (
          <a
            href={post.url}
            target="_blank"
            rel="noreferrer noopener"
            className="ml-auto inline-flex items-center gap-1 font-medium text-brand hover:underline"
          >
            Buka sumber
            <ExternalLink strokeWidth={1.5} className="size-3" aria-hidden="true" />
          </a>
        )}
      </footer>
    </article>
  );
}

export function PostList({ posts }: { posts: PropamPost[] }) {
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
