import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  CircularProgress,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Popover,
  Breadcrumbs,
  Link,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import ReactMarkdown from 'react-markdown';
import {
  ShowChart as ActivityIcon,
  TrendingUp as TrendingUpIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  BarChart as BarChartIcon,
  Workspaces as WorkspacesIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';

import { ContributionHeatmap } from '../contribution-heatmap';
import apiClient from 'src/services/apiService';
import { useAuth } from 'src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

interface DashboardTotals {
  total_mentions: number;
  total_engagement: number;
  doc?: { posts: number };
  twitter?: { posts: number };
  facebook?: { posts: number };
  instagram?: { posts: number };
  tiktok?: { posts: number };
}

interface VolumeProject {
  id: number;
  title: string;
  doc?: { posts: number };
  tweet?: { posts: number };
  facebook?: { posts: number };
  instagram?: { posts: number };
  tiktok?: { posts: number };
  total_posts: number;
  total_engagement: number;
}

interface DashboardData {
  totals: DashboardTotals;
  volume_of_running_projects: VolumeProject[];
}

interface HeatmapItem {
  date: string;
  count: number;
}

// ----------------------------------------------------------------------

const DashboardSkeleton = () => (
  <Box>
    {/* Stat Cards Skeleton */}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 3 }}>
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardContent>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="30%" height={40} sx={{ my: 1 }} />
            <Skeleton variant="rectangular" height={60} />
          </CardContent>
        </Card>
      ))}
    </Box>

    {/* Table Skeleton */}
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </CardContent>
    </Card>

    {/* Heatmap Skeleton */}
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Skeleton variant="text" width="25%" height={30} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={150} />
      </CardContent>
    </Card>
  </Box>
);

// ----------------------------------------------------------------------

export function MainDashboardView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const workspaceId = localStorage.getItem('workspace_id') || '';

  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, 'day'),
    endDate: dayjs(),
  });

  const [data, setData] = useState<DashboardData | null>(null);
  const [heatData, setHeatData] = useState<HeatmapItem[]>([]);
  const [tooltipData, setTooltipData] = useState<HeatmapItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHeat, setLoadingHeat] = useState(false);

  // AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Tooltip popover
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const showTooltip = Boolean(anchorEl);

  // Format number dengan separator (M/K)
  const formatNumber = (num?: number) => {
    if (!num || num === 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Fetch dashboard data
  const fetchDashboardData = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ data: DashboardData }>(
        `/dashboard?start_date=${startDate}&end_date=${endDate}&workspace_id=${workspaceId}`
      );
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch heatmap data
  const fetchHeatmap = async () => {
    setLoadingHeat(true);
    try {
      const response = await apiClient.get<HeatmapItem[]>(`/heatmap?workspace_id=${workspaceId}`);
      setHeatData(response.data);

      // Update tooltip data based on date range
      if (response.data && Array.isArray(response.data)) {
        const filtered = response.data
          .filter((item) => {
            const itemDate = dayjs(item.date);
            return itemDate.isAfter(dateRange.startDate) && itemDate.isBefore(dateRange.endDate);
          })
          .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
        setTooltipData(filtered.slice(0, 10)); // Show last 10 days
      }
    } catch (error) {
      console.error('Error fetching heatmap:', error);
    } finally {
      setLoadingHeat(false);
    }
  };

  // Fetch AI analysis
  const fetchAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const response = await apiClient.post<{ data: { analysis: string } }>('/openai/analyze', {
        query: 'Saya sedang memantau beberapa isu akhir-akhir ini)',
        data,
      });
      setAiAnalysis(response.data.data.analysis);
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      setAiAnalysis('Failed to fetch AI analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle date apply
  const handleDateApply = () => {
    fetchDashboardData(
      dateRange.startDate.format('YYYY-MM-DD'),
      dateRange.endDate.format('YYYY-MM-DD')
    );
  };

  // Initial fetch
  useEffect(() => {
    if (workspaceId) {
      fetchDashboardData(
        dateRange.startDate.format('YYYY-MM-DD'),
        dateRange.endDate.format('YYYY-MM-DD')
      );
      fetchHeatmap();
    }
  }, [workspaceId]);

  // Update tooltip when date range changes
  useEffect(() => {
    if (heatData && Array.isArray(heatData)) {
      const filtered = heatData
        .filter((item) => {
          const itemDate = dayjs(item.date);
          return itemDate.isAfter(dateRange.startDate) && itemDate.isBefore(dateRange.endDate);
        })
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
      setTooltipData(filtered.slice(0, 10));
    }
  }, [dateRange, heatData]);

  const workspaceName = user?.workspace?.name || 'Unknown Workspace';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Title and Breadcrumb */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        {/* Left: Page Title */}
        <Typography variant="h4" fontWeight={700}>
          Dashboard
        </Typography>

        {/* Right: Breadcrumb (Small) */}
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
            href="/"
          >
            <HomeIcon sx={{ mr: 0.3, fontSize: 14 }} />
            Home
          </Link>
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
              fontSize: '0.75rem',
            }}
          >
            <DashboardIcon sx={{ mr: 0.3, fontSize: 14 }} />
            Dashboard
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Selected Date with Tooltip */}
      <Box sx={{ mb: 2, position: 'relative' }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            '&:hover': { color: 'primary.main' },
          }}
          onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
          onMouseLeave={() => setAnchorEl(null)}
        >
          Selected Date:{' '}
          <Box component="span" sx={{ fontWeight: 600 }}>
            {dateRange.startDate.format('MMM DD, YYYY')} –{' '}
            {dateRange.endDate.format('MMM DD, YYYY')}
          </Box>
          <ActivityIcon sx={{ fontSize: 16 }} />
        </Typography>

        {/* Tooltip Popover */}
        <Popover
          open={showTooltip}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{ pointerEvents: 'none' }}
          disableRestoreFocus
        >
          <Paper sx={{ p: 2, minWidth: 300, maxWidth: 400 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BarChartIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              Daily Mentions (Last 10 Days)
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {tooltipData.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: idx < tooltipData.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(item.date).format('DD MMM YYYY')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        height: 8,
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                        width: `${Math.min((item.count / Math.max(...tooltipData.map((d) => d.count))) * 100, 100)}px`,
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ minWidth: 60, textAlign: 'right' }}
                    >
                      {formatNumber(item.count)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Total
                </Typography>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  {formatNumber(tooltipData.reduce((sum, item) => sum + item.count, 0))}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Popover>
      </Box>

      {/* Date Picker and Workspace */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={(newValue) =>
                    newValue && setDateRange((prev) => ({ ...prev, startDate: newValue }))
                  }
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={(newValue) =>
                    newValue && setDateRange((prev) => ({ ...prev, endDate: newValue }))
                  }
                  slotProps={{ textField: { size: 'small' } }}
                />
                <Button variant="contained" onClick={handleDateApply}>
                  Apply
                </Button>
              </Box>
            </LocalizationProvider>

            <Box sx={{ textAlign: 'right' }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}
              >
                <WorkspacesIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Workspace
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={600}>
                {workspaceName}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content */}
      {loading ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          {/* Metric Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
              mb: 3,
            }}
          >
            {/* Total Mentions Card */}
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Mentions
                    </Typography>
                    <Typography variant="h3" fontWeight={700}>
                      {formatNumber(data.totals.total_mentions)}
                    </Typography>
                  </Box>
                  <ActivityIcon sx={{ color: 'text.secondary' }} />
                </Box>
                <Box sx={{ height: 1, bgcolor: 'divider', my: 2 }} />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 1,
                    textAlign: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Web
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatNumber(data.totals.doc?.posts)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Twitter
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatNumber(data.totals.twitter?.posts)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      FB
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatNumber(data.totals.facebook?.posts)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      IG
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatNumber(data.totals.instagram?.posts)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      TikTok
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatNumber(data.totals.tiktok?.posts)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Total Engagement Card */}
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Engagement
                    </Typography>
                    <Typography variant="h3" fontWeight={700}>
                      {formatNumber(data.totals.total_engagement)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ color: 'text.secondary' }} />
                </Box>
                <Box sx={{ height: 1, bgcolor: 'divider', my: 2 }} />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 2,
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <ThumbUpIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={600}>
                      Likes
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <CommentIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={600}>
                      Comments
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <VisibilityIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={600}>
                      Views
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <ShareIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={600}>
                      Shares
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Volume of Running Projects Table */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <RocketIcon sx={{ color: 'primary.main' }} />
                Volume of Running Projects
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>NO</TableCell>
                      <TableCell>TITLE</TableCell>
                      <TableCell align="right">WEB</TableCell>
                      <TableCell align="right">TWIT</TableCell>
                      <TableCell align="right">FB</TableCell>
                      <TableCell align="right">INSTAGRAM</TableCell>
                      <TableCell align="right">TIKTOK</TableCell>
                      <TableCell align="right">TOTAL</TableCell>
                      <TableCell align="right">ENGAGEMENT</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.volume_of_running_projects.map((row, index) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="primary"
                            sx={{
                              cursor: 'pointer',
                              display: 'inline',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                            onClick={() => {
                              localStorage.setItem(
                                'selected_topic',
                                JSON.stringify({ id: row.id, name: row.title })
                              );
                              navigate('/mentions');
                            }}
                          >
                            {row.title}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatNumber(row.doc?.posts)}</TableCell>
                        <TableCell align="right">{formatNumber(row.tweet?.posts)}</TableCell>
                        <TableCell align="right">{formatNumber(row.facebook?.posts)}</TableCell>
                        <TableCell align="right">{formatNumber(row.instagram?.posts)}</TableCell>
                        <TableCell align="right">{formatNumber(row.tiktok?.posts)}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>
                            {formatNumber(row.total_posts)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700} color="info.main">
                            {formatNumber(row.total_engagement)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Heatmap */}
          {loadingHeat ? (
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={150} />
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ mb: 3 }}>
              <ContributionHeatmap workspaceId={workspaceId} />
            </Box>
          )}

          {/* AI Analysis */}
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6">✨ AI Analysis Result</Typography>
                <Button
                  variant="contained"
                  onClick={fetchAiAnalysis}
                  disabled={isAnalyzing}
                  startIcon={isAnalyzing ? <CircularProgress size={20} /> : null}
                >
                  {isAnalyzing ? 'Analyzing…' : 'Generate AI Summary'}
                </Button>
              </Box>
              <Box sx={{ color: 'text.secondary' }}>
                <ReactMarkdown>
                  {aiAnalysis || "Click 'Generate AI Summary' to get AI-generated insights."}
                </ReactMarkdown>
              </Box>
            </CardContent>
          </Card>
        </>
      ) : (
        <DashboardSkeleton />
      )}
    </Container>
  );
}
