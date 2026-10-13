import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
  Grid,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  Tooltip,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  GppBad as HoaxIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  ThumbUp as LikeIcon,
  InfoOutlined as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Article as TweetIcon,
} from '@mui/icons-material';
import apiClient from 'src/services/apiService';

// ─────────────────────────────────────────────────────────────────────────────

interface SampleTweet {
  tweet_id: string;
  text: string;
  created_at: string;
  retweet_count: number;
  reply_count: number;
  like_count: number;
}

interface ProvocateurAccount {
  username: string;
  name: string | null;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  post_count: number;
  total_retweets: number;
  provocateur_score: number;
  risk_level: 'high' | 'medium' | 'low';
  indicators: string[];
  sample_tweets: SampleTweet[];
}

interface HoaxPost {
  tweet_id: string;
  username: string;
  avatar_url: string | null;
  text: string;
  created_at: string;
  like_count: number;
  retweet_count: number;
  reply_count: number;
  hoax_score: number;
  likelihood: 'high' | 'medium' | 'low';
  flags: string[];
}

interface DetectionViewProps {
  topicId: number;
}

// ─────────────────────────────────────────────────────────────────────────────

const riskColor = (level: string) => {
  if (level === 'high') return 'error';
  if (level === 'medium') return 'warning';
  return 'success';
};

const riskLabel = (level: string) => {
  if (level === 'high') return 'Tinggi';
  if (level === 'medium') return 'Sedang';
  return 'Rendah';
};

const scoreBarColor = (score: number) => {
  if (score >= 70) return 'error';
  if (score >= 40) return 'warning';
  return 'success';
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function DetectionView({ topicId }: DetectionViewProps) {
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  const [provocateurs, setProvocateurs] = useState<ProvocateurAccount[]>([]);
  const [hoaxPosts, setHoaxPosts] = useState<HoaxPost[]>([]);
  const [loadingProv, setLoadingProv] = useState(true);
  const [loadingHoax, setLoadingHoax] = useState(true);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  const toggleExpand = (username: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  };

  const buildDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    if (period === 'day') startDate.setDate(endDate.getDate() - 1);
    else if (period === 'week') startDate.setDate(endDate.getDate() - 7);
    else startDate.setMonth(endDate.getMonth() - 1);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { from: fmt(startDate), to: fmt(endDate) };
  };

  const fetchProvocateurs = async () => {
    setLoadingProv(true);
    try {
      const { from, to } = buildDateRange();
      const res = await apiClient.get('/detection/provocateurs', {
        params: { topic_id: topicId, from, to },
      });
      setProvocateurs(Array.isArray(res.data) ? res.data : []);
    } catch {
      setProvocateurs([]);
    } finally {
      setLoadingProv(false);
    }
  };

  const fetchHoaxPosts = async () => {
    setLoadingHoax(true);
    try {
      const { from, to } = buildDateRange();
      const res = await apiClient.get('/detection/hoax-posts', {
        params: { topic_id: topicId, from, to },
      });
      setHoaxPosts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setHoaxPosts([]);
    } finally {
      setLoadingHoax(false);
    }
  };

  useEffect(() => {
    if (!topicId) return;
    fetchProvocateurs();
    fetchHoaxPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, period]);

  const highProv = provocateurs.filter((p) => p.risk_level === 'high').length;
  const highHoax = hoaxPosts.filter((p) => p.likelihood === 'high').length;

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" /> Deteksi Ancaman
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Identifikasi akun provokator dan konten berpotensi hoax berdasarkan analisis pola bahasa & perilaku
          </Typography>
        </Box>
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
      </Box>

      {/* ── Summary Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderLeft: 4, borderColor: 'error.main' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Provokator Terdeteksi</Typography>
              <Typography variant="h4" fontWeight="bold">{provocateurs.length}</Typography>
              <Typography variant="caption" color="error.main">{highProv} risiko tinggi</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Potensi Hoax</Typography>
              <Typography variant="h4" fontWeight="bold">{hoaxPosts.length}</Typography>
              <Typography variant="caption" color="warning.main">{highHoax} kemungkinan tinggi</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption">
              Deteksi menggunakan <strong>analisis pola berbasis aturan</strong> — frekuensi posting, kata provokatif,
              pola bahasa sensasional, dan anomali engagement. Ini merupakan
              indikasi awal, bukan kesimpulan final.
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* ── Tabs ── */}
      <Card>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon fontSize="small" />
                Provokator
                {provocateurs.length > 0 && (
                  <Chip label={provocateurs.length} size="small" color="error" />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HoaxIcon fontSize="small" />
                Potensi Hoax
                {hoaxPosts.length > 0 && (
                  <Chip label={hoaxPosts.length} size="small" color="warning" />
                )}
              </Box>
            }
          />
        </Tabs>

        <CardContent>
          {/* ── TAB: PROVOKATOR ── */}
          {tab === 0 && (
            <>
              {loadingProv ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : provocateurs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <WarningIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">Tidak ada akun provokator terdeteksi</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {provocateurs.map((acct, idx) => (
                    <Box key={acct.username}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{ px: 0, py: 2 }}
                      >
                        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                          {/* Rank */}
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="text.disabled"
                            sx={{ minWidth: 28, textAlign: 'center', mt: 1 }}
                          >
                            {idx + 1}
                          </Typography>

                          {/* Avatar */}
                          <Avatar
                            src={acct.avatar_url ?? undefined}
                            sx={{ width: 48, height: 48, bgcolor: 'error.main', mt: 0.5 }}
                          >
                            <PersonIcon />
                          </Avatar>

                          {/* Content */}
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                @{acct.username}
                              </Typography>
                              {acct.name && (
                                <Typography variant="body2" color="text.secondary">
                                  {acct.name}
                                </Typography>
                              )}
                              <Chip
                                label={`Risiko ${riskLabel(acct.risk_level)}`}
                                color={riskColor(acct.risk_level) as any}
                                size="small"
                              />
                            </Box>

                            {/* Score bar */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                                Skor Provokator
                              </Typography>
                              <Box sx={{ flex: 1, maxWidth: 200 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={acct.provocateur_score}
                                  color={scoreBarColor(acct.provocateur_score) as any}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                              <Typography variant="caption" fontWeight="bold">
                                {acct.provocateur_score}/100
                              </Typography>
                            </Box>

                            {/* Stats */}
                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {acct.post_count} post
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatNumber(acct.followers_count)} follower
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatNumber(acct.following_count)} following
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatNumber(acct.total_retweets)} retweet
                              </Typography>
                            </Box>

                            {/* Indicators */}
                            {acct.indicators.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {acct.indicators.map((ind, i) => (
                                  <Box
                                    key={i}
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'flex-start',
                                      gap: 0.5,
                                      border: '1px solid',
                                      borderColor: 'error.main',
                                      borderRadius: 1,
                                      px: 1,
                                      py: 0.5,
                                      color: 'error.main',
                                    }}
                                  >
                                    <InfoIcon sx={{ fontSize: 14, mt: '1px', flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                                      {ind}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}

                            {/* Sample Tweets — only for high-risk accounts */}
                            {acct.risk_level === 'high' && acct.sample_tweets && acct.sample_tweets.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: 'fit-content' }}
                                  onClick={() => toggleExpand(acct.username)}
                                >
                                  <TweetIcon sx={{ fontSize: 14, color: 'error.main', mr: 0.5 }} />
                                  <Typography variant="caption" color="error.main" fontWeight="bold">
                                    {acct.sample_tweets.length} tweet provokatif terdeteksi
                                  </Typography>
                                  <IconButton size="small" sx={{ p: 0, ml: 0.25 }}>
                                    {expandedAccounts.has(acct.username) ? (
                                      <ExpandLessIcon sx={{ fontSize: 16 }} />
                                    ) : (
                                      <ExpandMoreIcon sx={{ fontSize: 16 }} />
                                    )}
                                  </IconButton>
                                </Box>
                                <Collapse in={expandedAccounts.has(acct.username)}>
                                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {acct.sample_tweets.map((tweet) => (
                                      <Box
                                        key={tweet.tweet_id}
                                        sx={{
                                          p: 1.5,
                                          borderRadius: 1,
                                          border: '1px solid',
                                          borderColor: 'divider',
                                        }}
                                      >
                                        <Typography variant="body2" sx={{ mb: 0.75 }}>
                                          {tweet.text}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                          <Typography variant="caption" color="text.secondary">
                                            {formatTime(tweet.created_at)}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <ShareIcon sx={{ fontSize: 12 }} />{tweet.retweet_count}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <LikeIcon sx={{ fontSize: 12 }} />{tweet.like_count}
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            component="a"
                                            href={`https://x.com/${acct.username}/status/${tweet.tweet_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ color: 'primary.main', ml: 'auto' }}
                                          >
                                            Lihat postingan →
                                          </Typography>
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Collapse>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </ListItem>
                      {idx < provocateurs.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </>
          )}

          {/* ── TAB: HOAX ── */}
          {tab === 1 && (
            <>
              {loadingHoax ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : hoaxPosts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <HoaxIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">Tidak ada konten berpotensi hoax terdeteksi</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {hoaxPosts.map((post, idx) => (
                    <Box key={post.tweet_id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                          {/* Rank */}
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="text.disabled"
                            sx={{ minWidth: 28, textAlign: 'center', mt: 1 }}
                          >
                            {idx + 1}
                          </Typography>

                          {/* Avatar */}
                          <Avatar
                            src={post.avatar_url ?? undefined}
                            sx={{ width: 48, height: 48, bgcolor: 'warning.main', mt: 0.5 }}
                          >
                            <HoaxIcon />
                          </Avatar>

                          {/* Content */}
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                @{post.username}
                              </Typography>
                              <Chip
                                label={`Kemungkinan ${riskLabel(post.likelihood)}`}
                                color={riskColor(post.likelihood) as any}
                                size="small"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(post.created_at)}
                              </Typography>
                            </Box>

                            {/* Tweet text */}
                            <Typography
                              variant="body2"
                              sx={{
                                mb: 1,
                                p: 1.5,
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                                borderLeft: 3,
                                borderColor: riskColor(post.likelihood) + '.main',
                              }}
                            >
                              {post.text}
                            </Typography>

                            {/* Score bar */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                                Skor Hoax
                              </Typography>
                              <Box sx={{ flex: 1, maxWidth: 200 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={post.hoax_score}
                                  color={scoreBarColor(post.hoax_score) as any}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                              <Typography variant="caption" fontWeight="bold">
                                {post.hoax_score}/100
                              </Typography>
                            </Box>

                            {/* Engagement stats */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 1, flexWrap: 'wrap' }}>
                              <Tooltip title="Like">
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LikeIcon sx={{ fontSize: 13 }} />
                                  {post.like_count}
                                </Typography>
                              </Tooltip>
                              <Tooltip title="Retweet">
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ShareIcon sx={{ fontSize: 13 }} />
                                  {post.retweet_count}
                                </Typography>
                              </Tooltip>
                              <Tooltip title="Balasan">
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <VisibilityIcon sx={{ fontSize: 13 }} />
                                  {post.reply_count} balasan
                                </Typography>
                              </Tooltip>
                            </Box>

                            {/* Flags */}
                            {post.flags.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {post.flags.map((flag, i) => (
                                  <Chip
                                    key={i}
                                    label={flag}
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    icon={<InfoIcon />}
                                    sx={{ maxWidth: 320, '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </ListItem>
                      {idx < hoaxPosts.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Legend ── */}
      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
            Cara Kerja Deteksi
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary" component="div" fontWeight="bold" sx={{ mb: 0.5 }}>
                🚨 Provokator
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>Frekuensi tinggi</strong>: posting jauh di atas rata-rata akun lain
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>Kata provokatif</strong>: menggunakan kata kebencian, hujatan, atau hasutan
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>Akun mencurigakan</strong>: follower sedikit tapi sangat aktif (indikasi bot)
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>Memancing debat</strong>: konten mendapat banyak balasan (kontroversial)
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary" component="div" fontWeight="bold" sx={{ mb: 0.5 }}>
                📢 Potensi Hoax
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>HURUF KAPITAL</strong>: persentase huruf besar sangat tinggi
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>Tanda baca berlebihan</strong>: !!! ??? yang tidak wajar
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>Kata sensasional</strong>: "segera sebarkan", "terbongkar", "sebelum dihapus", dll.
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>Anomali engagement</strong>: banyak disebarkan tapi tidak ada like/balasan
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
