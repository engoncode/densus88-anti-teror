import {
  Close as CloseIcon,
  ThumbUpAlt,
  Comment,
  Share,
  Visibility,
  OpenInNew,
} from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Typography,
  CircularProgress,
} from '@mui/material';
import dayjs from 'dayjs';

// ===========================|| INTERFACES ||=========================== //

interface TopPost {
  id: string;
  title?: string;
  text: string;
  post_type?: string;
  sentiment?: string;
  user_name?: string;
  posted?: string;
  post_url?: string;
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    total?: number;
  };
}

interface TopPostsModalProps {
  open: boolean;
  topPosts: TopPost[];
  onClose: () => void;
  loading?: boolean;
}

// ===========================|| HELPER FUNCTIONS ||=========================== //

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const getSentimentColor = (sentiment?: string): 'success' | 'error' | 'default' | 'warning' => {
  if (!sentiment) return 'default';
  const sent = sentiment.toLowerCase();
  if (sent === 'positive') return 'success';
  if (sent === 'negative') return 'error';
  if (sent === 'neutral') return 'default';
  return 'warning';
};

const getPostTypeColor = (postType?: string): 'primary' | 'secondary' | 'info' | 'default' => {
  if (!postType) return 'default';
  const type = postType.toLowerCase();
  if (type === 'post') return 'primary';
  if (type === 'retweet' || type === 'share') return 'secondary';
  if (type === 'reply' || type === 'comment') return 'info';
  return 'default';
};

// ===========================|| COMPONENT ||=========================== //

export default function TopPostsModal({
  open,
  topPosts,
  onClose,
  loading = false,
}: TopPostsModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
        }}
      >
        <Typography variant="h4" component="h2">
          Top Posts
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 12,
            }}
          >
            <CircularProgress />
          </Box>
        ) : topPosts.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 12,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No top posts available
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {topPosts.map((post, index) => (
              <Card
                key={post.id}
                sx={{
                  p: 3,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* Header with badges and link */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      #{index + 1}
                    </Typography>
                    <Chip
                      label={post.post_type ? post.post_type.toUpperCase() : 'UNKNOWN'}
                      size="small"
                      color={getPostTypeColor(post.post_type)}
                    />
                    <Chip
                      label={post.sentiment ? post.sentiment.toUpperCase() : 'NEUTRAL'}
                      size="small"
                      color={getSentimentColor(post.sentiment)}
                    />
                  </Box>
                  {post.post_url && (
                    <Link
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        typography: 'caption',
                        fontWeight: 'medium',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      View Post <OpenInNew sx={{ fontSize: 14 }} />
                    </Link>
                  )}
                </Box>

                {/* Title if exists */}
                {post.title && (
                  <Typography variant="h6" fontWeight="semibold" mb={1}>
                    {post.title}
                  </Typography>
                )}

                {/* Content Text */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={2}
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.text || 'No content available'}
                </Typography>

                {/* User and Date */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  {post.user_name && (
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      @{post.user_name}
                    </Typography>
                  )}
                  {post.user_name && post.posted && (
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                  )}
                  {post.posted && (
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(post.posted).format('MMM DD, YYYY HH:mm')}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Engagement Stats */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ThumbUpAlt sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Likes
                        </Typography>
                        <Typography variant="body2" fontWeight="semibold">
                          {formatNumber(post.engagement?.likes ?? 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Comment sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Comments
                        </Typography>
                        <Typography variant="body2" fontWeight="semibold">
                          {formatNumber(post.engagement?.comments ?? 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Share sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Shares
                        </Typography>
                        <Typography variant="body2" fontWeight="semibold">
                          {formatNumber(post.engagement?.shares ?? 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Visibility sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Views
                        </Typography>
                        <Typography variant="body2" fontWeight="semibold">
                          {formatNumber(post.engagement?.views ?? 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Total Engagement Highlight */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="body2" fontWeight="medium" color="text.secondary">
                    Total Engagement
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatNumber(post.engagement?.total ?? 0)}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
