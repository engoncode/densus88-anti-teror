import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Skeleton,
  IconButton,
  Breadcrumbs,
  Link,
  Grid as Grid,
} from '@mui/material';
import {
  ShowChart as ActivityIcon,
  ThumbUp as ThumbsUpIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Home as HomeIcon,
  Language as WebIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import apiClient from 'src/services/apiService';
import ChartLine from 'src/components/charts/chart-line';
import ChartPie from 'src/components/charts/chart-pie';
import ChartLineExpression from 'src/components/charts/chart-line-expression';
import ChartPieExpression from 'src/components/charts/chart-pie-expression';
import ChartTopShare from 'src/components/charts/chart-top-share';
import TopIssues from 'src/components/charts/top-issues';
import PetaIndonesia from 'src/components/maps/peta-indonesia';
import ResumeWeb from 'src/components/topics/resume-web';
import { ArticleModal } from 'src/components/modal/article-modal';
import TopPostsModal from 'src/components/modal/top-posts-modal';
import ExportModal from 'src/components/modal/export-modal';
import FloatingChatButton from 'src/components/chat/floating-chat-button';

interface TopicStatistics {
  summary: {
    total_posts: number;
    total_engagement: number;
  };
  by_network: {
    [key: string]: {
      posts: number;
      likes: number;
      comments: number;
      views: number;
      shares: number;
    };
  };
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  timeline?: Array<{
    date: string;
    posts: number;
  }>;
  top_posts?: Array<{
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
  }>;
}

const StatSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Skeleton variant="text" width="40%" height={24} />
      <Skeleton variant="text" width="60%" height={48} sx={{ mt: 1 }} />
      <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
    </CardContent>
  </Card>
);

const NetworkCard = ({
  icon: Icon,
  label,
  posts,
  likes,
  comments,
  views,
  isActive,
  onClick,
}: {
  icon: any;
  label: string;
  posts: number;
  likes: number;
  comments: number;
  views: number;
  isActive: boolean;
  onClick: () => void;
}) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: 2,
      borderColor: isActive ? 'primary.main' : 'divider',
      '&:hover': {
        boxShadow: 4,
        borderColor: 'primary.light',
      },
    }}
  >
    <CardContent sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="medium">
          {label}
        </Typography>
        <Icon sx={{ fontSize: 20, color: 'text.secondary' }} />
      </Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {formatNumber(posts)}
      </Typography>
      <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1, mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ThumbsUpIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption">{formatNumber(likes)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CommentIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption">{formatNumber(comments)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <VisibilityIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption">{formatNumber(views)}</Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export function TopicsView() {
  const { id: paramId } = useParams<{ id: string }>();
  const id = paramId || (() => {
    try {
      const stored = localStorage.getItem('selected_topic');
      if (stored) return String(JSON.parse(stored).id);
    } catch { }
    return undefined;
  })();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const contentType = searchParams.get('type') || 'web';

  const [topicName, setTopicName] = useState<string>('Topic');
  const [statistics, setStatistics] = useState<TopicStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>(contentType);
  const [showTopPostsModal, setShowTopPostsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [articleModalParams, setArticleModalParams] = useState<any>({});

  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  const fetchStatistics = async (start: string, end: string, isInitial = false) => {
    if (!id) return;

    if (isInitial && !statistics) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await apiClient.get<{ data: TopicStatistics }>(
        `/topics/${id}/statistics?start_date=${start}&end_date=${end}`
      );
      setStatistics(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching topic statistics:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch topic name from my-topics list
  const fetchTopicName = async () => {
    if (!id) return;

    try {
      const response = await apiClient.get('/topics/my-topics');
      const topics = response.data.data || response.data;
      const currentTopic = topics.find((topic: any) => topic.id === Number(id));

      if (currentTopic) {
        setTopicName(currentTopic.name || currentTopic.topic_name || 'Topic');
      }
    } catch (error) {
      console.error('Error fetching topic name:', error);
      // Fallback to query param if API fails
      setTopicName(searchParams.get('name') || 'Topic');
    }
  };

  useEffect(() => {
    fetchTopicName();
  }, [id]);

  useEffect(() => {
    fetchStatistics(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), !statistics);
  }, [id]);

  useEffect(() => {
    setSelectedNetwork(contentType);
  }, [contentType]);

  const handleDateApply = () => {
    fetchStatistics(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), false);
  };

  const handleNetworkClick = (network: string) => {
    setSelectedNetwork(network);
    // Update URL with new type
    const networkTypeMap: { [key: string]: string } = {
      web: 'web',
      tweet: 'tweet',
      facebook: 'facebook',
      instagram: 'instagram',
      tiktok: 'tikTok',
      youtube: 'youtube',
    };
    const newType = networkTypeMap[network] || network;
    const slug = createSlug(topicName);
    navigate(`/topics/${id}/${slug}?type=${newType}`);
  };

  const calculateTotalEngagement = (type: 'likes' | 'comments' | 'views' | 'shares'): number => {
    if (!statistics) return 0;
    return Object.values(statistics.by_network).reduce((sum, net) => sum + (net[type] || 0), 0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Helmet>
        <title>{topicName} | Sentiment Analysis</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        {/* Title & Breadcrumb */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {topicName}
          </Typography>

          <Breadcrumbs>
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              color="inherit"
              href="/"
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography color="text.primary" fontSize="small">
              {topicName}
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Date Range */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(val) => val && setStartDate(val)}
              slotProps={{ textField: { size: 'small', variant: 'standard', sx: { width: 150 } } }}
            />
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(val) => val && setEndDate(val)}
              slotProps={{ textField: { size: 'small', variant: 'standard', sx: { width: 150 } } }}
            />
          </Box>
          <Button variant="contained" onClick={handleDateApply} disabled={isRefreshing}>
            {isRefreshing ? <CircularProgress size={20} /> : 'Apply'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setShowExportModal(true)}
          >
            Export
          </Button>
        </Box>

        {/* Statistics Cards */}
        {loading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
              mb: 4,
            }}
          >
            <StatSkeleton />
            <StatSkeleton />
          </Box>
        ) : statistics ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
              mb: 4,
            }}
          >
            {/* Total Posts Card */}
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 6,
                  borderColor: 'primary.main',
                },
              }}
              onClick={() => setShowTopPostsModal(true)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Posts
                    </Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {formatNumber(statistics.summary.total_posts)}
                    </Typography>
                  </Box>
                  <ActivityIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                </Box>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="primary.main" fontWeight="medium">
                    View Top Posts →
                  </Typography>
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
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Engagement
                    </Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {formatNumber(statistics.summary.total_engagement)}
                    </Typography>
                  </Box>
                  <BarChartIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                </Box>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Box>
                      <ThumbsUpIcon sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
                      <Typography variant="caption" fontWeight="bold" display="block">
                        {formatNumber(calculateTotalEngagement('likes'))}
                      </Typography>
                    </Box>
                    <Box>
                      <CommentIcon sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
                      <Typography variant="caption" fontWeight="bold" display="block">
                        {formatNumber(calculateTotalEngagement('comments'))}
                      </Typography>
                    </Box>
                    <Box>
                      <VisibilityIcon sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
                      <Typography variant="caption" fontWeight="bold" display="block">
                        {formatNumber(calculateTotalEngagement('views'))}
                      </Typography>
                    </Box>
                    <Box>
                      <ShareIcon sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
                      <Typography variant="caption" fontWeight="bold" display="block">
                        {formatNumber(calculateTotalEngagement('shares'))}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ) : null}

        {/* Network Cards */}
        {!loading && statistics && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              By Platform
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(5, 1fr)',
                },
                gap: 2,
              }}
            >
              <NetworkCard
                icon={WebIcon}
                label="Media"
                posts={statistics.by_network.web?.posts || 0}
                likes={statistics.by_network.web?.likes || 0}
                comments={statistics.by_network.web?.comments || 0}
                views={statistics.by_network.web?.views || 0}
                isActive={selectedNetwork === 'web'}
                onClick={() => handleNetworkClick('web')}
              />
              <NetworkCard
                icon={ActivityIcon}
                label="Twitter"
                posts={statistics.by_network.tweet?.posts || 0}
                likes={statistics.by_network.tweet?.likes || 0}
                comments={statistics.by_network.tweet?.comments || 0}
                views={statistics.by_network.tweet?.views || 0}
                isActive={selectedNetwork === 'tweet'}
                onClick={() => handleNetworkClick('tweet')}
              />
              <NetworkCard
                icon={FacebookIcon}
                label="Facebook"
                posts={statistics.by_network.facebook?.posts || 0}
                likes={statistics.by_network.facebook?.likes || 0}
                comments={statistics.by_network.facebook?.comments || 0}
                views={statistics.by_network.facebook?.views || 0}
                isActive={selectedNetwork === 'facebook'}
                onClick={() => handleNetworkClick('facebook')}
              />
              <NetworkCard
                icon={InstagramIcon}
                label="Instagram"
                posts={statistics.by_network.instagram?.posts || 0}
                likes={statistics.by_network.instagram?.likes || 0}
                comments={statistics.by_network.instagram?.comments || 0}
                views={statistics.by_network.instagram?.views || 0}
                isActive={selectedNetwork === 'instagram'}
                onClick={() => handleNetworkClick('instagram')}
              />
              <NetworkCard
                icon={ActivityIcon}
                label="TikTok"
                posts={statistics.by_network.tiktok?.posts || 0}
                likes={statistics.by_network.tiktok?.likes || 0}
                comments={statistics.by_network.tiktok?.comments || 0}
                views={statistics.by_network.tiktok?.views || 0}
                isActive={selectedNetwork === 'tiktok'}
                onClick={() => handleNetworkClick('tiktok')}
              />
            </Box>

            {/* Selected Network Indicator */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Showing content from:{' '}
                <Typography component="span" color="primary.main" fontWeight="bold">
                  {selectedNetwork === 'tweet'
                    ? 'Twitter'
                    : selectedNetwork === 'web'
                      ? 'Web / Media Portal'
                      : selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}
                </Typography>
              </Typography>
            </Box>
          </Box>
        )}

        {/* Charts Section */}
        {!loading && statistics && (
          <Grid container spacing={3}>
            {/* Conditional Charts based on network type */}
            {selectedNetwork === 'web' ? (
              <>
                {/* Web Content Charts */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <ChartPie
                    id={Number(id)}
                    type={selectedNetwork}
                    startDate={startDate.format('YYYY-MM-DD HH:mm:ss')}
                    endDate={endDate.format('YYYY-MM-DD HH:mm:ss')}
                    onSliceClick={(sentiment, dateFrom, dateTo) => {
                      setArticleModalParams({
                        sentiment,
                        dateFrom,
                        dateTo,
                        platform: selectedNetwork,
                      });
                      setArticleModalOpen(true);
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <ChartLine
                    id={Number(id)}
                    type={selectedNetwork}
                    startDate={startDate.format('YYYY-MM-DD HH:mm:ss')}
                    endDate={endDate.format('YYYY-MM-DD HH:mm:ss')}
                    onDataPointClick={(date, platform) => {
                      setArticleModalParams({
                        tanggal: date,
                        platform: selectedNetwork,
                      });
                      setArticleModalOpen(true);
                    }}
                  />
                </Grid>

                {/* Top Shares */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ChartTopShare
                    id={Number(id)}
                    type={selectedNetwork}
                    startDate={startDate.format('YYYY-MM-DD HH:mm:ss')}
                    endDate={endDate.format('YYYY-MM-DD HH:mm:ss')}
                    onBarClick={(media, dateFrom, dateTo) => {
                      setArticleModalParams({
                        media,
                        dateFrom,
                        dateTo,
                        platform: selectedNetwork,
                      });
                      setArticleModalOpen(true);
                    }}
                  />
                </Grid>

                {/* Top Issues */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TopIssues
                    id={Number(id)}
                    type={selectedNetwork}
                    startDate={startDate.format('YYYY-MM-DD HH:mm:ss')}
                    endDate={endDate.format('YYYY-MM-DD HH:mm:ss')}
                    onBarClick={(sentence, dateFrom, dateTo) => {
                      setArticleModalParams({
                        concern: sentence,
                        dateFrom,
                        dateTo,
                        platform: selectedNetwork,
                      });
                      setArticleModalOpen(true);
                    }}
                  />
                </Grid>

                {/* Indonesia Map */}
                <Grid size={{ xs: 12 }}>
                  <PetaIndonesia
                    id={Number(id)}
                    startDate={startDate.format('YYYY-MM-DD HH:mm:ss')}
                    endDate={endDate.format('YYYY-MM-DD HH:mm:ss')}
                  />
                </Grid>
              </>
            ) : (
              <>
                {/* Social Media Content Charts - Show both Sentiment and Expression */}
                {/* Sentiment Charts */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <ChartPie
                    id={Number(id)}
                    type={selectedNetwork}
                    startDate={startDate.format('YYYY-MM-DD HH:mm:ss')}
                    endDate={endDate.format('YYYY-MM-DD HH:mm:ss')}
                    onSliceClick={(sentiment, dateFrom, dateTo) => {
                      setArticleModalParams({
                        sentiment,
                        dateFrom,
                        dateTo,
                        platform: selectedNetwork,
                      });
                      setArticleModalOpen(true);
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <ChartLine
                    id={Number(id)}
                    type={selectedNetwork}
                    startDate={startDate.format('YYYY-MM-DD HH:mm:ss')}
                    endDate={endDate.format('YYYY-MM-DD HH:mm:ss')}
                    onDataPointClick={(date, platform) => {
                      setArticleModalParams({
                        tanggal: date,
                        platform: selectedNetwork,
                      });
                      setArticleModalOpen(true);
                    }}
                  />
                </Grid>

                {/* Expression Charts */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ChartPieExpression
                    id={Number(id)}
                    type={selectedNetwork}
                    startDate={startDate.format('YYYY-MM-DD HH:mm:ss')}
                    endDate={endDate.format('YYYY-MM-DD HH:mm:ss')}
                    onSliceClick={(expression, dateFrom, dateTo) => {
                      setArticleModalParams({
                        expression,
                        dateFrom,
                        dateTo,
                        platform: selectedNetwork,
                      });
                      setArticleModalOpen(true);
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ChartLineExpression
                    id={Number(id)}
                    type={selectedNetwork}
                    startDate={startDate.format('YYYY-MM-DD HH:mm:ss')}
                    endDate={endDate.format('YYYY-MM-DD HH:mm:ss')}
                    onDataPointClick={(date, expression, platform) => {
                      setArticleModalParams({
                        tanggal: date,
                        expression,
                        platform: selectedNetwork,
                      });
                      setArticleModalOpen(true);
                    }}
                  />
                </Grid>
              </>
            )}

            {/* Resume/Summary - Common for both */}
            <Grid size={{ xs: 12 }}>
              <ResumeWeb
                id={Number(id)}
                type={selectedNetwork}
                startDate={startDate.format('YYYY-MM-DD HH:mm:ss')}
                endDate={endDate.format('YYYY-MM-DD HH:mm:ss')}
              />
            </Grid>
          </Grid>
        )}

        {/* Top Posts Modal */}
        {showTopPostsModal && statistics?.top_posts && (
          <TopPostsModal
            open={showTopPostsModal}
            topPosts={statistics.top_posts}
            onClose={() => setShowTopPostsModal(false)}
          />
        )}

        {/* Article Modal */}
        <ArticleModal
          open={articleModalOpen}
          topicId={Number(id)}
          onClose={() => {
            setArticleModalOpen(false);
            setArticleModalParams({});
          }}
          {...articleModalParams}
        />

        {/* Export Modal */}
        {showExportModal && id && (
          <ExportModal
            open={showExportModal}
            onClose={() => setShowExportModal(false)}
            topicId={Number(id)}
            topicName={topicName}
            preSelectedPlatform={selectedNetwork !== 'web' ? selectedNetwork : undefined}
          />
        )}

        {/* Floating Chat Button */}
        {id && <FloatingChatButton key={id} topicId={Number(id)} topicName={topicName} />}
      </Box>
    </LocalizationProvider>
  );
}
