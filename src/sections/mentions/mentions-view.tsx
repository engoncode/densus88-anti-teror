import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Tabs,
  Tab,
  Button,
  Switch,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  AlternateEmail as MentionIcon,
  Language as WebIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  ShowChart as TimelineIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import ChartLine from 'src/components/charts/chart-line';
import ChartPie from 'src/components/charts/chart-pie';
import { ArticleListView } from 'src/sections/articles/article-list-view';
import { ArticleModal } from 'src/components/modal/article-modal';
import ExportModal from 'src/components/modal/export-modal';

export function MentionsView() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [articleModalParams, setArticleModalParams] = useState<any>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Get selected topic from localStorage
  const [topicId, setTopicId] = useState<number>(() => {
    const stored = localStorage.getItem('selected_topic');
    if (stored) {
      try {
        const topic = JSON.parse(stored);
        return topic.id;
      } catch {
        return 1;
      }
    }
    return 1;
  });

  // Listen for topic changes
  useEffect(() => {
    const handleTopicChange = (event: CustomEvent) => {
      const topic = event.detail;
      if (topic && topic.id) {
        setTopicId(topic.id);
      }
    };

    window.addEventListener('selectedTopicChanged', handleTopicChange as EventListener);
    return () =>
      window.removeEventListener('selectedTopicChanged', handleTopicChange as EventListener);
  }, []);

  // Auto refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(
      () => {
        setRefreshKey((prev) => prev + 1);
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handlePlatformChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPlatform(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getPlatformType = () => {
    switch (selectedPlatform) {
      case 'all':
        return 'allplatform';
      case 'web':
        return 'web';
      case 'facebook':
        return 'facebook';
      case 'instagram':
        return 'instagram';
      case 'twitter':
        return 'tweet';
      case 'tiktok':
        return 'tiktok';
      default:
        return 'allplatform';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {/* <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <MentionIcon fontSize="large" /> Mentions
        </Typography> */}

        <Grid container spacing={3}>
          {/* Left Column - Charts & Article List */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Charts with Tabs */}
            <Card sx={{ mb: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  aria-label="sentiment chart tabs"
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      minHeight: 64,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      transition: 'all 0.3s',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      '&.Mui-selected': {
                        color: 'primary.main',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      height: 3,
                    },
                  }}
                >
                  <Tab
                    icon={<TimelineIcon sx={{ fontSize: 22 }} />}
                    iconPosition="start"
                    label="Sentiment Timeline"
                    sx={{ gap: 1 }}
                  />
                  <Tab
                    icon={<PieChartIcon sx={{ fontSize: 22 }} />}
                    iconPosition="start"
                    label="Sentiment Distribution"
                    sx={{ gap: 1 }}
                  />
                </Tabs>
              </Box>
              <Box sx={{ bgcolor: 'background.neutral' }}>
                {/* Timeline Chart */}
                {activeTab === 0 && (
                  <ChartLine
                    key={`chart-line-${refreshKey}`}
                    id={topicId}
                    type={getPlatformType()}
                    startDate={startDate.format('YYYY-MM-DD')}
                    endDate={endDate.format('YYYY-MM-DD')}
                    onDataPointClick={(date, platform) => {
                      const platformType = getPlatformType();
                      setArticleModalParams({
                        tanggal: date,
                        ...(platformType !== 'allplatform' && { platform: platformType }),
                      });
                      setArticleModalOpen(true);
                    }}
                  />
                )}
                {/* Pie Chart */}
                {activeTab === 1 && (
                  <ChartPie
                    key={`chart-pie-${refreshKey}`}
                    id={topicId}
                    type={getPlatformType()}
                    startDate={startDate.format('YYYY-MM-DD')}
                    endDate={endDate.format('YYYY-MM-DD')}
                    onSliceClick={(sentiment, dateFrom, dateTo) => {
                      const platformType = getPlatformType();
                      setArticleModalParams({
                        sentiment: sentiment,
                        dateFrom,
                        dateTo,
                        ...(platformType !== 'allplatform' && { platform: platformType }),
                      });
                      setArticleModalOpen(true);
                    }}
                  />
                )}
              </Box>
            </Card>

            {/* Article List */}
            <Box>
              <ArticleListView
                key={`article-list-${refreshKey}`}
                topicId={topicId}
                type={getPlatformType() === 'allplatform' ? '' : getPlatformType()}
              />
            </Box>
          </Grid>

          {/* Right Column - Platform Filter */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ position: 'sticky', top: 24 }}>
              <CardContent>
                {/* Date Range Picker */}
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Date Range
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => newValue && setStartDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        sx: { mb: 2 },
                      },
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => newValue && setEndDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                      },
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Select Source
                </Typography>

                {/* Auto Refresh Toggle */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    p: 1.5,
                    bgcolor: autoRefresh ? 'action.selected' : 'action.hover',
                    borderRadius: 1,
                    border: 1,
                    borderColor: autoRefresh ? 'primary.main' : 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RefreshIcon
                      sx={{
                        fontSize: 20,
                        color: autoRefresh ? 'primary.main' : 'text.secondary',
                      }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      Auto Refresh
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: autoRefresh ? 'primary.main' : 'text.disabled',
                        fontWeight: 600,
                      }}
                    >
                      {autoRefresh ? 'ON' : 'OFF'}
                    </Typography>
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem' }}>
                    Platform
                  </FormLabel>
                  <RadioGroup value={selectedPlatform} onChange={handlePlatformChange}>
                    <FormControlLabel
                      value="all"
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MentionIcon sx={{ fontSize: 18 }} />
                          <Typography variant="body2">All Platforms</Typography>
                        </Box>
                      }
                    />
                    <Divider sx={{ my: 1 }} />
                    <FormControlLabel
                      value="web"
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WebIcon sx={{ fontSize: 18 }} />
                          <Typography variant="body2">Media / Web</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="facebook"
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FacebookIcon sx={{ fontSize: 18 }} />
                          <Typography variant="body2">Facebook</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="instagram"
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <InstagramIcon sx={{ fontSize: 18 }} />
                          <Typography variant="body2">Instagram</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="twitter"
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FaXTwitter style={{ fontSize: 18 }} />
                          <Typography variant="body2">Twitter / X</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="tiktok"
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FaTiktok style={{ fontSize: 18 }} />
                          <Typography variant="body2">TikTok</Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                <Divider sx={{ my: 3 }} />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Selected:</strong>{' '}
                    {selectedPlatform === 'all'
                      ? 'All Platforms'
                      : selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Data will be filtered based on your selection
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Export Button */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={() => setShowExportModal(true)}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Article Modal */}
        <ArticleModal
          open={articleModalOpen}
          topicId={topicId}
          onClose={() => {
            setArticleModalOpen(false);
            setArticleModalParams({});
          }}
          {...articleModalParams}
        />

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            open={showExportModal}
            onClose={() => setShowExportModal(false)}
            topicId={topicId}
            topicName="Mentions"
            preSelectedPlatform={getPlatformType()}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
}
