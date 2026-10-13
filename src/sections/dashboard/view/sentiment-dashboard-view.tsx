import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Button,
  Paper,
  Skeleton,
  Alert,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import ReactMarkdown from 'react-markdown';

import apiClient from 'src/services/apiService';
import { useAuth } from 'src/contexts/AuthContext';

import { StatCard } from '../stat-card';
import { SentimentChart } from '../sentiment-chart';
import { TopIssuesTable } from '../top-issues-table';
import { MediaShareChart } from '../media-share-chart';
import { TrendChart } from '../trend-chart';
import { ContributionHeatmap } from '../contribution-heatmap';

// ----------------------------------------------------------------------

interface DashboardData {
  total_articles: number;
  total_engagement: number;
  engagement_rate: number;
  total_views: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  top_issues: Array<{
    issue: string;
    count: number;
  }>;
  media_share: Array<{
    platform: string;
    count: number;
  }>;
  trend_data: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
}

// ----------------------------------------------------------------------

export function SentimentDashboardView() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Date range state
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  const workspaceId = localStorage.getItem('workspace_id');

  // Format number helper
  const formatNumber = (num: number | undefined) => {
    if (!num || num === 0) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ data: DashboardData }>(
        `/dashboard?start_date=${startDate.format('YYYY-MM-DD')}&end_date=${endDate.format('YYYY-MM-DD')}&workspace_id=${workspaceId}`
      );

      setData(response.data.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, workspaceId]);

  // Fetch AI analysis
  const fetchAiAnalysis = async () => {
    if (!data) return;

    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const response = await apiClient.post<{ data: { analysis: string } }>('/openai/analyze', {
        query: 'Analyze the current sentiment and provide strategic insights',
        data,
      });

      setAiAnalysis(response.data.data.analysis);
    } catch (err: any) {
      console.error('Error fetching AI analysis:', err);
      setAiAnalysis('Failed to generate AI analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Render loading skeleton
  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mb: 5 }}>
          <Skeleton variant="text" width={300} height={50} />
        </Box>

        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant="rectangular" height={140} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );
  }

  // Render empty state
  if (!data) {
    return (
      <Container maxWidth="xl">
        <Alert severity="info" sx={{ mt: 2 }}>
          No data available for the selected date range.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Box>
          <Typography variant="h4">Welcome back, {user?.name}! 👋</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor and analyze social media sentiment in real-time
          </Typography>
        </Box>

        {/* Date Range Picker */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction="row" spacing={2} alignItems="center">
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => newValue && setStartDate(newValue)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => newValue && setEndDate(newValue)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small' } }}
            />
            <Button variant="contained" onClick={fetchDashboardData}>
              Apply
            </Button>
          </Stack>
        </LocalizationProvider>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Articles"
            value={formatNumber(data.total_articles)}
            icon="solar:document-text-bold-duotone"
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Engagement"
            value={formatNumber(data.total_engagement)}
            icon="solar:like-bold-duotone"
            color="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Engagement Rate"
            value={`${(data.engagement_rate || 0).toFixed(2)}%`}
            icon="solar:graph-up-bold-duotone"
            color="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Views"
            value={formatNumber(data.total_views)}
            icon="solar:eye-bold-duotone"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Sentiment Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SentimentChart
            data={data.sentiment_distribution || { positive: 0, neutral: 0, negative: 0 }}
          />
        </Grid>

        {/* Media Share */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MediaShareChart data={data.media_share || []} />
        </Grid>

        {/* Top Issues */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TopIssuesTable data={data.top_issues || []} />
        </Grid>
      </Grid>

      {/* Trend Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <TrendChart data={data.trend_data || []} />
        </Grid>
      </Grid>

      {/* Contribution Heatmap */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <ContributionHeatmap workspaceId={workspaceId || ''} />
        </Grid>
      </Grid>

      {/* AI Analysis Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon icon="solar:magic-stick-bold-duotone" width={24} />
            <Typography variant="h6">AI-Powered Analysis</Typography>
            <Chip label="Beta" size="small" color="info" />
          </Stack>

          <Button
            variant="contained"
            onClick={fetchAiAnalysis}
            disabled={isAnalyzing}
            startIcon={
              isAnalyzing ? <CircularProgress size={20} /> : <Icon icon="solar:magic-stick-bold" />
            }
          >
            {isAnalyzing ? 'Analyzing...' : 'Generate AI Insights'}
          </Button>
        </Stack>

        {aiAnalysis && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'background.neutral',
              borderRadius: 1,
              '& p': { mb: 1 },
              '& ul': { pl: 3, mb: 1 },
              '& li': { mb: 0.5 },
            }}
          >
            <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
          </Box>
        )}

        {!aiAnalysis && !isAnalyzing && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Click the button above to generate AI-powered insights based on your current dashboard
            data.
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
