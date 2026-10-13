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
  TextField,
  Chip,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Whatshot as FlameIcon,
  Bolt as BoltIcon,
  AccessTime as ClockIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  BarChart as BarChartIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import apiClient from 'src/services/apiService';

interface ViralPost {
  post_id: string;
  text_content: string;
  username: string;
  user_id: string;
  avatar?: string;
  posted: string;
  retweet_count: number;
  like_count: number;
  reply_count: number;
  view_count: number;
  viral_score: number;
  spread_velocity: number;
  reach_estimate: number;
  peak_time: string;
  total_hops: number;
  unique_spreaders: number;
  path: ViralPathNode[];
}

interface ViralPathNode {
  username: string;
  user_id: string;
  avatar?: string;
  timestamp: string;
  action: 'original' | 'retweet' | 'quote' | 'reply';
  reach: number;
  level: number;
}

interface ViralPathViewProps {
  topicId: number;
}

export function ViralPathView({ topicId }: ViralPathViewProps) {
  const [viralPosts, setViralPosts] = useState<ViralPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ViralPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [minViralScore, setMinViralScore] = useState(70);

  const fetchViralPaths = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();

      if (period === 'day') {
        startDate.setDate(endDate.getDate() - 1);
      } else if (period === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else {
        startDate.setMonth(endDate.getMonth() - 1);
      }

      const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const res = await apiClient.get(`/sna/viral-paths`, {
        params: {
          topic_id: topicId,
          from: formatDate(startDate),
          to: formatDate(endDate),
        },
      });

      const responseData = Array.isArray(res.data) ? res.data : res.data.data || [];

      const posts = responseData.map((item: any) => ({
        post_id: item.original_tweet?.tweet_id || '',
        text_content: item.original_tweet?.text || '',
        username: item.original_tweet?.author || '',
        user_id: item.original_tweet?.author || '',
        avatar: item.original_tweet?.avatar_url || undefined,
        posted: item.original_tweet?.created_at || '',
        retweet_count: item.original_tweet?.retweets || 0,
        like_count: item.original_tweet?.likes || 0,
        reply_count: item.original_tweet?.replies || 0,
        view_count: 0,
        viral_score: Math.min(100, Math.round((item.metrics?.engagement_score || 0) / 10)),
        spread_velocity: item.metrics?.viral_velocity || 0,
        reach_estimate: item.metrics?.estimated_reach || 0,
        peak_time: item.original_tweet?.created_at || '',
        total_hops: item.propagation?.length || 0,
        unique_spreaders: item.metrics?.unique_users || 0,
        path: (item.propagation || []).map((p: any, idx: number) => ({
          username: p.author || '',
          user_id: p.author || '',
          avatar: p.avatar_url || undefined,
          timestamp: p.created_at || '',
          action: p.interaction_type || 'retweet',
          reach: 0,
          level: idx + 1,
        })),
      }));

      setViralPosts(posts);
      if (posts.length > 0 && !selectedPost) {
        setSelectedPost(posts[0]);
      }
    } catch (error) {
      console.error('Error fetching viral paths:', error);
      setViralPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topicId) {
      fetchViralPaths();
    }
  }, [topicId, period, minViralScore]);

  const getViralTier = (score: number) => {
    if (score >= 90) return { label: 'Mega Viral', color: 'error', icon: FlameIcon };
    if (score >= 75) return { label: 'Sangat Viral', color: 'warning', icon: BoltIcon };
    if (score >= 60) return { label: 'Viral', color: 'info', icon: TrendingUpIcon };
    return { label: 'Trending', color: 'success', icon: BarChartIcon };
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'original':
        return 'primary';
      case 'retweet':
        return 'success';
      case 'quote':
        return 'warning';
      case 'reply':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Memuat data jalur viral...</Typography>
      </Box>
    );
  }

  if (viralPosts.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <FlameIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Tidak ada konten viral terdeteksi
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Coba kurangi ambang skor viral atau pilih periode yang berbeda
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
            <TrendingUpIcon /> Flow Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {viralPosts.length} postingan viral terdeteksi — lacak pola penyebaran &amp; rantai pengaruh
          </Typography>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Periode</InputLabel>
            <Select
              value={period}
              label="Periode"
              onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month')}
            >
              <MenuItem value="day">24 Jam Terakhir</MenuItem>
              <MenuItem value="week">Minggu Lalu</MenuItem>
              <MenuItem value="month">Bulan Lalu</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="number"
            label="Skor Min"
            value={minViralScore}
            onChange={(e) => setMinViralScore(parseInt(e.target.value) || 70)}
            inputProps={{ min: 50, max: 100 }}
            sx={{ width: 120 }}
          />
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Postingan Viral
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {viralPosts.length}
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
                  <Typography variant="caption" color="text.secondary">
                    Rata-rata Skor Viral
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {Math.round(
                      viralPosts.reduce((sum, post) => sum + post.viral_score, 0) /
                        viralPosts.length
                    )}
                  </Typography>
                </Box>
                <BoltIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Jangkauan
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {(
                      viralPosts.reduce((sum, post) => sum + post.reach_estimate, 0) / 1000000
                    ).toFixed(1)}
                    M
                  </Typography>
                </Box>
                <VisibilityIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Penyebar
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {viralPosts.reduce((sum, post) => sum + post.unique_spreaders, 0)}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Viral Posts List */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <TrendingUpIcon fontSize="small" />
                  Postingan Viral Teratas
                </Typography>
              </Box>
              <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                {viralPosts.map((post) => {
                  const tier = getViralTier(post.viral_score);
                  const TierIcon = tier.icon;
                  return (
                    <Box key={post.post_id}>
                      <ListItemButton
                        selected={selectedPost?.post_id === post.post_id}
                        onClick={() => setSelectedPost(post)}
                      >
                        <ListItemAvatar>
                          <Avatar src={post.avatar}>{post.username.charAt(0).toUpperCase()}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Typography variant="body2" fontWeight="bold">
                                @{post.username}
                              </Typography>
                              <Chip
                                icon={<TierIcon />}
                                label={post.viral_score}
                                color={tier.color as any}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" noWrap>
                                {post.text_content}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  <ShareIcon sx={{ fontSize: 12 }} />
                                  {post.retweet_count}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  <VisibilityIcon sx={{ fontSize: 12 }} />
                                  {post.view_count.toLocaleString()}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  <PeopleIcon sx={{ fontSize: 12 }} />
                                  {post.unique_spreaders}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItemButton>
                      <Divider />
                    </Box>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Viral Path Visualization */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            {selectedPost ? (
              <CardContent>
                {/* Post Header */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        src={selectedPost.avatar}
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'error.main',
                        }}
                      >
                        {selectedPost.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          @{selectedPost.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(selectedPost.posted)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      {(() => {
                        const tier = getViralTier(selectedPost.viral_score);
                        const TierIcon = tier.icon;
                        return (
                          <>
                            <Chip
                              icon={<TierIcon />}
                              label={tier.label}
                              color={tier.color as any}
                            />
                            <Typography
                              variant="h4"
                              fontWeight="bold"
                              color="error.main"
                              sx={{ mt: 1 }}
                            >
                              {selectedPost.viral_score}
                            </Typography>
                          </>
                        );
                      })()}
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedPost.text_content}
                  </Typography>

                  {/* Metrics */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Tooltip title="Jangkauan: Perkiraan jumlah orang yang terpapar konten ini berdasarkan jumlah pengikut penyebar" arrow>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1, cursor: 'help' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Jangkauan</Typography>
                            <InfoIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            {selectedPost.reach_estimate > 0 ? `${(selectedPost.reach_estimate / 1000).toFixed(0)}K` : '-'}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Tooltip title="Kecepatan Sebar: Seberapa cepat konten menyebar — dihitung dari jumlah retweet per jam sejak diunggah" arrow>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1, cursor: 'help' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Kecepatan Sebar</Typography>
                            <InfoIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            {selectedPost.spread_velocity > 0 ? `${selectedPost.spread_velocity.toFixed(1)}/jam` : '-'}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Tooltip title="Rantai: Jumlah langkah penyebaran konten dari postingan asli ke penyebar terjauh. Semakin banyak, semakin jauh konten menjangkau" arrow>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1, cursor: 'help' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Rantai</Typography>
                            <InfoIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            {selectedPost.total_hops > 0 ? selectedPost.total_hops : '-'}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Tooltip title="Penyebar: Jumlah akun unik yang ikut menyebarkan konten ini (retweet, quote, reply)" arrow>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1, cursor: 'help' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Penyebar</Typography>
                            <InfoIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            {selectedPost.unique_spreaders > 0 ? selectedPost.unique_spreaders : '-'}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>

                {/* Spread Timeline */}
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <ClockIcon />
                    Alur Penyebaran
                  </Typography>

                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {selectedPost.path.map((node, index) => (
                      <Box key={index} sx={{ position: 'relative', mb: 3 }}>
                        {index < selectedPost.path.length - 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 24,
                              top: 56,
                              width: 2,
                              height: 'calc(100% + 12px)',
                              background: 'linear-gradient(to bottom, #f44336, #ff9800)',
                            }}
                          />
                        )}

                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Avatar
                            src={node.avatar}
                            sx={{
                              width: 48,
                              height: 48,
                              zIndex: 1,
                              bgcolor:
                                node.level === 0
                                  ? 'secondary.main'
                                  : node.level === 1
                                    ? 'error.main'
                                    : node.level === 2
                                      ? 'warning.main'
                                      : 'success.main',
                            }}
                          >
                            {node.username.charAt(0).toUpperCase()}
                          </Avatar>

                          <Box
                            sx={{
                              flex: 1,
                              p: 2,
                              bgcolor: 'action.hover',
                              borderRadius: 1,
                              borderLeft: 4,
                              borderColor: 'error.main',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  @{node.username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatTime(node.timestamp)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip
                                  label={node.action}
                                  color={getActionColor(node.action) as any}
                                  size="small"
                                />
                                <Typography variant="caption">Tingkat {node.level}</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <Typography
                                variant="caption"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                              >
                                <VisibilityIcon sx={{ fontSize: 14 }} />
                                Jangkauan: {node.reach > 0 ? node.reach.toLocaleString() : '-'}
                              </Typography>
                              {index > 0 && node.reach > 0 && selectedPost.path[0].reach > 0 && (
                                <Typography
                                  variant="caption"
                                  color="error"
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  <ArrowForwardIcon sx={{ fontSize: 14 }} />+
                                  {((node.reach / selectedPost.path[0].reach) * 100).toFixed(0)}%
                                  pertumbuhan
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
                <FlameIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                  Pilih postingan viral untuk melihat alur penyebarannya
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Legend */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <BarChartIcon fontSize="small" />
            Klasifikasi Skor Viral
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlameIcon color="error" fontSize="small" />
                <Typography variant="caption">
                  <strong>Mega Viral:</strong> 90-100
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BoltIcon color="warning" fontSize="small" />
                <Typography variant="caption">
                  <strong>Sangat Viral:</strong> 75-89
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="info" fontSize="small" />
                <Typography variant="caption">
                  <strong>Viral:</strong> 60-74
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon color="success" fontSize="small" />
                <Typography variant="caption">
                  <strong>Trending:</strong> 50-59
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
