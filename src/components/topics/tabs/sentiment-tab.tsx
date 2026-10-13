import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Chip,
  Link,
  Grid as Grid2,
  CardMedia,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  OpenInNew as OpenInNewIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import apiClient from 'src/services/apiService';

interface Post {
  id: number;
  title?: string;
  text_content?: string;
  user_name?: string;
  posted?: string;
  post_url?: string;
  image?: string;
  image_url?: string;
  top_image?: string;
  like_count?: number;
  comment?: number;
  view?: number;
  share?: number;
}

interface PaginatedResponse {
  message: string;
  posts: {
    current_page: number;
    data: Post[];
    next_page_url: string | null;
    last_page: number;
    total: number;
  };
}

interface SentimentTabProps {
  topicId: number;
  network: string;
}

type SentimentType = 'positive' | 'negative' | 'neutral';

export default function SentimentTab({ topicId, network }: SentimentTabProps) {
  const [posts, setPosts] = useState<{
    positive: Post[];
    negative: Post[];
    neutral: Post[];
  }>({
    positive: [],
    negative: [],
    neutral: [],
  });
  const [page, setPage] = useState<Record<SentimentType, number>>({
    positive: 1,
    negative: 1,
    neutral: 1,
  });
  const [hasMore, setHasMore] = useState<Record<SentimentType, boolean>>({
    positive: true,
    negative: true,
    neutral: true,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<Record<SentimentType, boolean>>({
    positive: false,
    negative: false,
    neutral: false,
  });

  const scrollRefs = {
    positive: useRef<HTMLDivElement>(null),
    negative: useRef<HTMLDivElement>(null),
    neutral: useRef<HTMLDivElement>(null),
  };

  const formatNumber = (num?: number): string => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchSentimentData = async (sentimentType: SentimentType, pageNum: number = 1) => {
      try {
        const res = await apiClient.get<PaginatedResponse>(
          `/topics/${topicId}/${network}/sentiments/${sentimentType}`,
          { params: { page: pageNum } }
        );
        return {
          posts: res.data.posts.data,
          next_page_url: res.data.posts.next_page_url,
        };
      } catch (error) {
        console.error(`Error fetching ${sentimentType} page ${pageNum}:`, error);
        return null;
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      const sentiments: SentimentType[] = ['positive', 'negative', 'neutral'];

      for (const sentiment of sentiments) {
        const res = await fetchSentimentData(sentiment, 1);
        if (res?.posts?.length) {
          setPosts((prev) => ({ ...prev, [sentiment]: res.posts }));
          setHasMore((prev) => ({ ...prev, [sentiment]: !!res.next_page_url }));
        } else {
          setHasMore((prev) => ({ ...prev, [sentiment]: false }));
        }
      }

      setPage({ positive: 1, negative: 1, neutral: 1 });
      setLoading(false);
    };

    if (topicId && network) {
      fetchAll();
    }
  }, [topicId, network]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>, sentimentType: SentimentType) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (
      scrollTop + clientHeight >= scrollHeight - 5 &&
      hasMore[sentimentType] &&
      !loadingMore[sentimentType]
    ) {
      setLoadingMore((prev) => ({ ...prev, [sentimentType]: true }));

      const nextPage = page[sentimentType] + 1;
      const res = await fetchSentimentData(sentimentType, nextPage);

      if (res?.posts?.length) {
        setPosts((prev) => ({
          ...prev,
          [sentimentType]: [...prev[sentimentType], ...res.posts],
        }));
        setPage((prev) => ({ ...prev, [sentimentType]: nextPage }));

        if (!res.next_page_url) {
          setHasMore((prev) => ({ ...prev, [sentimentType]: false }));
        }
      } else {
        setHasMore((prev) => ({ ...prev, [sentimentType]: false }));
      }

      setLoadingMore((prev) => ({ ...prev, [sentimentType]: false }));
    }
  };

  const fetchSentimentData = async (sentimentType: SentimentType, pageNum: number = 1) => {
    try {
      const res = await apiClient.get<PaginatedResponse>(
        `/topics/${topicId}/${network}/sentiments/${sentimentType}`,
        { params: { page: pageNum } }
      );
      return {
        posts: res.data.posts.data,
        next_page_url: res.data.posts.next_page_url,
      };
    } catch (error) {
      console.error(`Error fetching ${sentimentType} page ${pageNum}:`, error);
      return null;
    }
  };

  const getSentimentColor = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'positive':
        return { bg: 'success.lighter', color: 'success.dark', border: 'success.main' };
      case 'negative':
        return { bg: 'error.lighter', color: 'error.dark', border: 'error.main' };
      default:
        return { bg: 'warning.lighter', color: 'warning.dark', border: 'warning.main' };
    }
  };

  const renderWebPost = (post: Post, sentiment: SentimentType) => {
    const colors = getSentimentColor(sentiment);
    const imageUrl = post.image || post.top_image;

    return (
      <Card
        key={post.id}
        sx={{
          mb: 2,
          overflow: 'hidden',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s',
          },
        }}
      >
        {/* Image Thumbnail */}
        {imageUrl && (
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="160"
              image={imageUrl}
              alt={post.title}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = 'none';
              }}
              sx={{
                objectFit: 'cover',
                '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.3s' },
              }}
            />
            <Chip
              label={sentiment}
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: colors.bg,
                color: colors.color,
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            />
          </Box>
        )}

        <CardContent>
          {/* Title */}
          <Link
            href={post.post_url}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            sx={{
              display: 'block',
              mb: 1.5,
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.title || 'Tanpa Judul'}
            </Typography>
          </Link>

          {/* Meta Info */}
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
            <Box display="flex" alignItems="center" gap={0.5} minWidth={0}>
              <PersonIcon sx={{ fontSize: 12, color: 'text.secondary', flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 100 }}>
                {post.user_name || 'Unknown'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
              <CalendarIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.posted)}
              </Typography>
            </Box>
          </Box>

          {!imageUrl && (
            <Chip
              label={sentiment}
              size="small"
              sx={{
                mt: 1.5,
                bgcolor: colors.bg,
                color: colors.color,
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSocialPost = (post: Post, sentiment: SentimentType) => {
    const colors = getSentimentColor(sentiment);

    return (
      <Card
        key={post.id}
        sx={{
          mb: 2,
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-1px)',
            transition: 'all 0.2s',
          },
        }}
      >
        <CardContent>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar
                src={
                  post.image_url ||
                  `https://ui-avatars.com/api/?name=${post.user_name}&background=random`
                }
                sx={{ width: 32, height: 32 }}
              >
                {(post.user_name || 'U')[0].toUpperCase()}
              </Avatar>
              <Box minWidth={0}>
                <Typography variant="body2" fontWeight="medium" noWrap>
                  {post.user_name || 'Unknown'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(post.posted)}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={sentiment}
              size="small"
              sx={{
                bgcolor: colors.bg,
                color: colors.color,
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            />
          </Box>

          {/* Content */}
          <Link
            href={post.post_url}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            sx={{
              display: 'block',
              mb: 1.5,
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.text_content || 'Tidak ada konten'}
            </Typography>
          </Link>

          {/* Engagement Stats */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            pt={1}
            borderTop={1}
            borderColor="divider"
          >
            <Box display="flex" gap={2}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <ThumbUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption">{formatNumber(post.like_count)}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <CommentIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption">{formatNumber(post.comment)}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <VisibilityIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption">{formatNumber(post.view)}</Typography>
              </Box>
              {post.share && post.share > 0 && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ShareIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption">{formatNumber(post.share)}</Typography>
                </Box>
              )}
            </Box>
            <Link
              href={post.post_url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <OpenInNewIcon sx={{ fontSize: 14 }} />
            </Link>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderPost = (post: Post, sentiment: SentimentType) => {
    return network === 'web' ? renderWebPost(post, sentiment) : renderSocialPost(post, sentiment);
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={8}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading sentiment data...
        </Typography>
      </Box>
    );
  }

  return (
    <Grid2 container spacing={2}>
      {(Object.entries(posts) as [SentimentType, Post[]][]).map(([sentiment, postList]) => {
        const colors = getSentimentColor(sentiment);
        return (
          <Grid2 size={{ xs: 12, md: 4 }} key={sentiment}>
            <Box>
              {/* Header */}
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={2}
                pb={1.5}
                borderBottom={2}
                borderColor={colors.border}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: colors.border,
                  }}
                />
                <Typography variant="h6" fontWeight="bold" sx={{ color: colors.color }}>
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary" ml="auto">
                  {postList.length} posts
                </Typography>
              </Box>

              {/* Posts */}
              <Box
                ref={scrollRefs[sentiment]}
                onScroll={(e) => handleScroll(e, sentiment)}
                sx={{
                  maxHeight: 600,
                  minHeight: 500,
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'action.disabled',
                    borderRadius: 1.5,
                    '&:hover': {
                      bgcolor: 'action.disabledBackground',
                    },
                  },
                }}
              >
                {postList.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Typography variant="body2" color="text.secondary">
                      No {sentiment} posts found
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {postList.map((post) => renderPost(post, sentiment))}
                    {hasMore[sentiment] && loadingMore[sentiment] && (
                      <Box textAlign="center" py={2}>
                        <CircularProgress size={24} />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Grid2>
        );
      })}
    </Grid2>
  );
}
