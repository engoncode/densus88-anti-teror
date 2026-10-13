import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Link as MuiLink,
  Chip,
  Grid,
  Avatar,
} from '@mui/material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Icon } from '@iconify/react';
import apiClient from 'src/services/apiService';

interface Trend {
  name: string;
  rank: number;
  post_count: string | null;
}

interface TrendHistory {
  created_at: string;
  trends: Trend[];
}

const RANK_STYLES: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: '#FFD700', color: '#7A5800', label: '🥇' },
  2: { bg: '#C0C0C0', color: '#4A4A4A', label: '🥈' },
  3: { bg: '#CD7F32', color: '#5C2D00', label: '🥉' },
};

function RankBadge({ rank }: { rank: number }) {
  const style = RANK_STYLES[rank];
  if (style) {
    return (
      <Avatar
        sx={{
          width: 28,
          height: 28,
          fontSize: 14,
          bgcolor: style.bg,
          color: style.color,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {rank}
      </Avatar>
    );
  }
  return (
    <Avatar
      sx={{
        width: 28,
        height: 28,
        fontSize: 12,
        bgcolor: 'action.selected',
        color: 'text.secondary',
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {rank}
    </Avatar>
  );
}

export function TrendingView() {
  const [trendHistories, setTrendHistories] = useState<TrendHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingData = async () => {
      setLoading(true);
      setError(null);

      const pagesToFetch = [1, 2, 3, 4, 5];
      try {
        const requests = pagesToFetch.map((page) =>
          apiClient.get(`/x/trends-history?page=${page}`)
        );
        const responses = await Promise.all(requests);
        const allTrends = responses.flatMap((response) => response.data.data || response.data);
        setTrendHistories(allTrends);
      } catch (err) {
        console.error('Error fetching trending data:', err);
        setError('Gagal memuat data trending. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  // ── Build chart data: track rank of top-5 topics — last 6 hours ──
  const { chartSeries, chartOptions } = useMemo(() => {
    if (!trendHistories.length) return { chartSeries: [], chartOptions: {} };

    // Filter only snapshots within the last 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const recentHistories = trendHistories.filter(
      (h) => new Date(h.created_at) >= sixHoursAgo
    );
    // Fallback: jika tidak ada data 6 jam terakhir, ambil 12 snapshot terbaru
    const base = recentHistories.length >= 2 ? recentHistories : trendHistories.slice(0, 12);

    // Collect top-5 topic names from the latest snapshot
    const latest = trendHistories[0];
    const trackedTopics = latest?.trends.slice(0, 10).map((t) => t.name) ?? [];

    // X-axis: timestamps (oldest → newest)
    const sorted = [...base].reverse();
    const categories = sorted.map((h) => {
      const d = new Date(h.created_at);
      return d.toLocaleString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    });

    const COLORS = ['#FF1744', '#FF6B35', '#FFAB00', '#00B8D9', '#36B37E', '#7B61FF', '#F50057', '#00BCD4', '#FF9800', '#4CAF50'];

    const series = trackedTopics.map((topicName, i) => ({
      name: topicName,
      color: COLORS[i],
      data: sorted.map((h) => {
        const found = h.trends.find((t) => t.name === topicName);
        // Invert rank so rank 1 = highest on chart (value = 11 - rank)
        return found ? 11 - found.rank : null;
      }),
    }));

    const options: ApexOptions = {
      chart: {
        type: 'line',
        height: 300,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, speed: 600 },
      },
      stroke: { curve: 'smooth', width: 2.5 },
        markers: { size: 4, hover: { sizeOffset: 2 } },
      colors: COLORS,
      xaxis: {
        categories,
        labels: {
          rotate: -30,
          style: { fontSize: '11px' },
        },
        tickAmount: Math.min(sorted.length, 10),
      },
      yaxis: {
        min: 1,
        max: 10,
        reversed: false,
        labels: {
          formatter: (val: number) => {
            const rank = 11 - Math.round(val);
            return rank >= 1 && rank <= 10 ? `#${rank}` : '';
          },
        },
        title: { text: 'Rank', style: { fontSize: '12px' } },
      },
      tooltip: {
        y: {
          formatter: (val: number | null) => {
            if (val === null) return 'Tidak masuk top 10';
            return `Rank #${11 - Math.round(val)}`;
          },
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
        markers: { width: 6, height: 6 },
      },
      grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    };

    return { chartSeries: series, chartOptions: options };
  }, [trendHistories]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, gap: 2 }}>
        <CircularProgress size={28} />
        <Typography color="text.secondary">Memuat hot topics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* ── Header ── */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF1744 100%)',
              boxShadow: '0 4px 12px rgba(255,23,68,0.35)',
            }}
          >
            <Icon icon="solar:fire-bold-duotone" width={26} color="#fff" />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800} lineHeight={1.2}>
              Hot Topics
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Topik terpanas di X (Twitter) · {trendHistories.length} snapshot
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Rank Trend Chart ── */}
      {chartSeries.length > 0 && (
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Icon icon="solar:graph-up-bold-duotone" width={20} color="#FF1744" />
              <Typography variant="subtitle1" fontWeight={700}>
                Tren Pergerakan Rank
              </Typography>
              <Chip
                size="small"
                label="6 jam terakhir · Top 10"
                sx={{ fontSize: 11, height: 20, bgcolor: 'error.lighter', color: 'error.dark' }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Pergerakan rank 10 topik teratas dalam 6 jam terakhir (rank #1 = tertinggi di grafik)
            </Typography>
            <Chart
              type="line"
              height={300}
              series={chartSeries as ApexOptions['series']}
              options={chartOptions}
            />
          </CardContent>
        </Card>
      )}

      {/* ── Grid ── */}
      <Grid container spacing={3}>
        {trendHistories.map((history, index) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Card header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon="mingcute:twitter-x-fill" width={18} />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Hot Topics
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    icon={<Icon icon="solar:clock-circle-bold-duotone" width={14} />}
                    label={formatDateTime(history.created_at)}
                    sx={{ fontSize: 11, height: 22, bgcolor: 'action.hover' }}
                  />
                </Box>

                {/* Trend list */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {history.trends.slice(0, 10).map((trend) => (
                    <MuiLink
                      key={trend.rank}
                      href={`https://x.com/search?q=${encodeURIComponent(trend.name)}&src=trend_click&vertical=trends`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="none"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        transition: 'background-color 0.15s',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          '& .trend-name': { color: 'error.main' },
                        },
                      }}
                    >
                      <RankBadge rank={trend.rank} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          className="trend-name"
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          sx={{ transition: 'color 0.15s', color: 'text.primary' }}
                        >
                          {trend.name}
                        </Typography>
                        {trend.post_count && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {trend.post_count}
                          </Typography>
                        )}
                      </Box>
                      <Icon icon="solar:arrow-right-up-bold-duotone" width={16} color="var(--palette-text-disabled)" />
                    </MuiLink>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
