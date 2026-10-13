import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Pagination,
  Grid,
  Link as MuiLink,
  CardMedia,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Whatshot as FlameIcon,
  Favorite as HeartIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayIcon,
  Bookmark as BookmarkIcon,
  OpenInNew as ExternalLinkIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as VerifiedIcon,
} from '@mui/icons-material';
import apiClient from 'src/services/apiService';

interface ViralPost {
  id: string;
  code?: string;
  author: string;
  author_name?: string;
  author_image?: string;
  is_verified?: boolean;
  follower_count?: number;
  content: string;
  url: string | null;
  cover_url?: string;
  posted_at: string;
  metrics: {
    likes: number;
    comments: number;
    shares?: number;
    saves?: number;
    plays?: number;
    views?: number;
    retweets?: number;
    replies?: number;
    quotes?: number;
    bookmarks?: number;
  };
  engagement_score: number;
  platform: string;
}

interface SocialViralPostsViewProps {
  topicId: number;
  platform: 'facebook' | 'instagram' | 'tiktok';
}

const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

export function SocialViralPostsView({ topicId, platform }: SocialViralPostsViewProps) {
  const [viralPosts, setViralPosts] = useState<ViralPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const platformConfig = {
    facebook: { name: 'Facebook', icon: '👥', color: '#1877f2' },
    instagram: { name: 'Instagram', icon: '📷', color: '#e1306c' },
    tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
  };

  const config = platformConfig[platform];

  const fetchViralPosts = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();

      if (period === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else {
        startDate.setFullYear(endDate.getFullYear() - 1);
      }

      const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const res = await apiClient.get(`/social-analytics/viral-posts`, {
        params: {
          topic_id: topicId,
          platform: platform,
          from: formatDate(startDate),
          to: formatDate(endDate),
          limit: 50,
        },
      });

      const postsData = res.data?.data || [];
      setViralPosts(postsData);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching viral posts:', error);
      setViralPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topicId) {
      fetchViralPosts();
    }
  }, [topicId, period, platform]);

  const totalPages = Math.ceil(viralPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = viralPosts.slice(startIndex, endIndex);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEngagementTier = (score: number) => {
    if (score >= 10000) return { label: 'Mega Viral', color: 'secondary' };
    if (score >= 5000) return { label: 'Viral', color: 'error' };
    if (score >= 1000) return { label: 'Trending', color: 'warning' };
    return { label: 'Popular', color: 'info' };
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Finding {config.name} viral posts...</Typography>
      </Box>
    );
  }

  if (viralPosts.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <FlameIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No viral posts found
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Try adjusting the period or check back later
        </Typography>
      </Box>
    );
  }

  const totalEngagement = viralPosts.reduce((sum, p) => sum + p.engagement_score, 0);
  const totalLikes = viralPosts.reduce((sum, p) => sum + (p.metrics.likes || 0), 0);
  const totalComments = viralPosts.reduce((sum, p) => sum + (p.metrics.comments || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FlameIcon color="warning" /> {config.name} Viral Posts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Top {viralPosts.length} viral posts detected for this topic
          </Typography>
        </Box>

        {/* Controls */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            label="Period"
            onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'all')}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    Viral Posts
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {viralPosts.length}
                  </Typography>
                </Box>
                <FlameIcon sx={{ fontSize: 40, color: 'warning.light' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    Total Engagement
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {formatNumber(totalEngagement)}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    Total Likes
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {formatNumber(totalLikes)}
                  </Typography>
                </Box>
                <HeartIcon sx={{ fontSize: 40, color: 'error.light' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    Total Comments
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {formatNumber(totalComments)}
                  </Typography>
                </Box>
                <CommentIcon sx={{ fontSize: 40, color: 'info.light' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Posts List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {currentPosts.map((post, index) => {
          const globalRank = startIndex + index + 1;
          const tier = getEngagementTier(post.engagement_score);

          return (
            <Card key={post.id + index}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
                  {/* Rank & Author */}
                  <Box sx={{ display: 'flex', gap: 2, minWidth: { lg: 250 } }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'action.hover',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                      }}
                    >
                      #{globalRank}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Avatar src={post.author_image || undefined} sx={{ width: 40, height: 40 }}>
                          {post.author?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {post.author_name || post.author}
                            </Typography>
                            {post.is_verified && (
                              <VerifiedIcon color="primary" sx={{ fontSize: 14 }} />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            @{post.author}
                          </Typography>
                          {post.follower_count && post.follower_count > 0 && (
                            <Typography variant="caption" color="text.disabled" display="block">
                              {formatNumber(post.follower_count)} followers
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label={tier.label} color={tier.color as any} size="small" />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <CalendarIcon sx={{ fontSize: 12 }} />
                        {formatDate(post.posted_at)}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                      {truncateText(post.content, 200)}
                    </Typography>

                    {/* Cover image for TikTok */}
                    {platform === 'tiktok' && post.cover_url && (
                      <Box sx={{ mb: 2 }}>
                        <CardMedia
                          component="img"
                          image={post.cover_url}
                          alt="Video cover"
                          sx={{ width: 128, height: 192, borderRadius: 1, objectFit: 'cover' }}
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </Box>
                    )}

                    {/* Metrics */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HeartIcon sx={{ fontSize: 16, color: 'error.main' }} />
                        <Typography variant="body2">{formatNumber(post.metrics.likes)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CommentIcon sx={{ fontSize: 16, color: 'info.main' }} />
                        <Typography variant="body2">
                          {formatNumber(post.metrics.comments)}
                        </Typography>
                      </Box>
                      {(post.metrics.shares ?? 0) > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ShareIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2">
                            {formatNumber(post.metrics.shares)}
                          </Typography>
                        </Box>
                      )}
                      {(post.metrics.plays ?? 0) > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PlayIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                          <Typography variant="body2">
                            {formatNumber(post.metrics.plays)}
                          </Typography>
                        </Box>
                      )}
                      {(post.metrics.saves ?? 0) > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BookmarkIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="body2">
                            {formatNumber(post.metrics.saves)}
                          </Typography>
                        </Box>
                      )}
                      {(post.metrics.views ?? 0) > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {formatNumber(post.metrics.views)}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Engagement:{' '}
                          <Typography component="span" variant="caption" fontWeight="bold">
                            {formatNumber(post.engagement_score)}
                          </Typography>
                        </Typography>
                        {post.url && (
                          <IconButton
                            component={MuiLink}
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                          >
                            <ExternalLinkIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {startIndex + 1} to {Math.min(endIndex, viralPosts.length)} of{' '}
            {viralPosts.length} posts
          </Typography>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
