import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Grid as Grid,
  IconButton,
  Link as MuiLink,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ThumbUp as ThumbUpIcon,
  Visibility as VisibilityIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import apiClient from 'src/services/apiService';

interface Influencer {
  user_id: number;
  username: string;
  name: string;
  profile_image_url: string | null;
  is_verified?: boolean;
  post_count: number;
  metrics: {
    total_likes: number;
    total_comments: number;
    total_shares?: number;
    total_views?: number;
    total_retweets?: number;
    total_replies?: number;
    total_quotes?: number;
    total_saves?: number;
    total_plays?: number;
  };
  total_engagement: number;
  influence_score: number;
  tier: string;
  platform: string;
}

interface InfluencerIdentificationProps {
  topicId: number;
  platform?: 'twitter' | 'facebook' | 'instagram' | 'tiktok';
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export function InfluencerIdentification({
  topicId,
  platform = 'twitter',
}: InfluencerIdentificationProps) {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [sortBy, setSortBy] = useState<'influence_score' | 'follower_count' | 'engagement'>(
    'influence_score'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchInfluencers = async () => {
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

      const res = await apiClient.get(`/social-analytics/influencers`, {
        params: {
          topic_id: topicId,
          platform: platform,
          from: formatDate(startDate),
          to: formatDate(endDate),
          limit: 50,
        },
      });

      const influencerData = Array.isArray(res.data) ? res.data : res.data.data || [];
      setInfluencers(influencerData);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      setInfluencers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topicId) {
      fetchInfluencers();
    }
  }, [topicId, platform, period, sortBy]);

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'mega':
        return 'secondary';
      case 'macro':
        return 'info';
      case 'micro':
        return 'success';
      case 'nano':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank.toString();
  };

  const getProfileUrl = (username: string) => {
    switch (platform) {
      case 'twitter':
        return `https://x.com/${username}`;
      case 'facebook':
        return `https://facebook.com/${username}`;
      case 'instagram':
        return `https://instagram.com/${username}`;
      case 'tiktok':
        return `https://tiktok.com/@${username}`;
      default:
        return `https://x.com/${username}`;
    }
  };

  const totalPages = Math.ceil(influencers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInfluencers = influencers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Analyzing influencers...</Typography>
      </Box>
    );
  }

  if (influencers.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No influencers found
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Try adjusting the period or check back later
        </Typography>
      </Box>
    );
  }

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
            <TrophyIcon /> Influencer Identification
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Top {influencers.length} influencers detected for this topic
          </Typography>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) =>
                setSortBy(e.target.value as 'influence_score' | 'follower_count' | 'engagement')
              }
            >
              <MenuItem value="influence_score">By Influence Score</MenuItem>
              <MenuItem value="follower_count">By Followers</MenuItem>
              <MenuItem value="engagement">By Engagement</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    Total Influencers
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {influencers.length}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
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
                    Avg Influence Score
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {Math.round(
                      influencers.reduce((sum, inf) => sum + (inf.influence_score || 0), 0) /
                        influencers.length
                    ) || 0}
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
                    Total Engagement
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {formatNumber(
                      influencers.reduce((sum, inf) => sum + (inf.total_engagement || 0), 0)
                    )}
                  </Typography>
                </Box>
                <ThumbUpIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
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
                    Total Posts
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {formatNumber(influencers.reduce((sum, inf) => sum + (inf.post_count || 0), 0))}
                  </Typography>
                </Box>
                <VisibilityIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Influencers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Influencer</TableCell>
              <TableCell align="center">Tier</TableCell>
              <TableCell align="right">Influence Score</TableCell>
              <TableCell align="right">Posts</TableCell>
              <TableCell align="right">Likes</TableCell>
              <TableCell align="right">Retweets</TableCell>
              <TableCell align="right">Replies</TableCell>
              <TableCell align="right">Quotes</TableCell>
              <TableCell align="right">Total Engagement</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentInfluencers.map((influencer, index) => {
              const globalRank = startIndex + index + 1;
              return (
                <TableRow key={influencer.username} hover>
                  <TableCell>
                    <Typography variant="h6">{getRankMedal(globalRank)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={influencer.profile_image_url || undefined} alt={influencer.name}>
                        {influencer.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {influencer.name}
                        </Typography>
                        <MuiLink
                          href={getProfileUrl(influencer.username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="caption"
                          color="primary"
                        >
                          @{influencer.username}
                        </MuiLink>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={influencer.tier.charAt(0).toUpperCase() + influencer.tier.slice(1)}
                      color={getTierColor(influencer.tier) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {(influencer.influence_score || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {(influencer.post_count || 0).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {(influencer.metrics?.total_likes || 0).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {(
                      influencer.metrics?.total_retweets ||
                      influencer.metrics?.total_shares ||
                      0
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {(
                      influencer.metrics?.total_replies ||
                      influencer.metrics?.total_comments ||
                      0
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {(
                      influencer.metrics?.total_quotes ||
                      influencer.metrics?.total_saves ||
                      0
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {(influencer.total_engagement || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {startIndex + 1} to {Math.min(endIndex, influencers.length)} of{' '}
            {influencers.length} influencers
          </Typography>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Legend */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <BarChartIcon fontSize="small" />
            Influencer Tier Classification
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'secondary.main' }}
                />
                <Typography variant="body2">
                  <strong>Mega:</strong> ≥ 50,000
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'info.main' }} />
                <Typography variant="body2">
                  <strong>Macro:</strong> 20k - 49,999
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'success.main' }} />
                <Typography variant="body2">
                  <strong>Micro:</strong> 5k - 19,999
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'warning.main' }} />
                <Typography variant="body2">
                  <strong>Nano:</strong> 0 - 4,999
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
