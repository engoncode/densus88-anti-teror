import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Checkbox,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import {
  CheckBox as CheckSquare,
  CheckBoxOutlineBlank as Square,
  Download,
  Tag as Hash,
  TrendingUp,
  BarChart as BarChart3,
  Place as MapPin,
  Warning as AlertTriangle,
  PieChart,
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactApexChart from 'react-apexcharts';
import WordCloud from 'react-d3-cloud';
import apiClient from 'src/services/apiService';
import SentimentComparisonChart from 'src/components/charts/sentiment-comparison-chart';
import TopPostsModal from 'src/components/modal/top-posts-modal';

// Types
interface Topic {
  id: number;
  name: string;
  description?: string;
}

interface NetworkData {
  platform: string;
  sentiment_summary?: {
    data: Array<{
      date: string;
      positive: string | number;
      neutral: string | number;
      negative: string | number;
    }>;
  };
  percentage?: {
    data: Array<{
      sentiment: string;
      percentage: number;
    }>;
  };
  media_share?: {
    total_articles?: number;
  };
  keyword_data?: Array<{
    keyword: string;
    sentiment_score: number;
  }>;
  top_issues?: {
    data: Array<{
      sentence: string;
      count: number;
    }>;
  };
  city_analysis_lowest?: Array<{
    city: string;
    score: number;
    total_posts: number;
  }>;
  critical_sentiment_areas?: Array<{
    city: string;
    score: number;
    total_posts: number;
  }>;
  resume?: {
    summary: string;
    key_insights?: string[];
  };
}

interface TopicData {
  topic_id: number;
  topic_name: string;
  instansi: string;
  active_networks: string[];
  networks: {
    [networkName: string]: NetworkData;
  };
}

interface ComparisonData {
  success: boolean;
  data: {
    [topicId: string]: TopicData;
  };
  total_topics: number;
}

// Color palette for charts
const colorPalette = [
  '#8b5cf6',
  '#ec4899',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#8b5cf6',
];

// Network emoji mapping
const getNetworkEmoji = (networkName: string): string => {
  const emojiMap: { [key: string]: string } = {
    web: '📰',
    tweet: '🐦',
    facebook: '👥',
    instagram: '📷',
    tiktok: '🎵',
    youtube: '📺',
  };
  return emojiMap[networkName] || '🌐';
};

// Network name mapping
const getNetworkDisplayName = (networkName: string): string => {
  const nameMap: { [key: string]: string } = {
    web: 'Web/Media',
    tweet: 'Twitter',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
  };
  return nameMap[networkName] || networkName;
};

// Skeleton loading component
const ComparisonCardSkeleton = () => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ height: 24, bgcolor: 'action.hover', borderRadius: 1 }} />
        <Box sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 1, width: '60%' }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ height: 24, bgcolor: 'action.hover', borderRadius: 1, width: 60 }} />
          <Box sx={{ height: 24, bgcolor: 'action.hover', borderRadius: 1, width: 60 }} />
        </Box>
        <Box sx={{ height: 200, bgcolor: 'action.hover', borderRadius: 1 }} />
      </Box>
    </CardContent>
  </Card>
);

export default function ComparePage() {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState<string | null>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // City Posts Modal
  const [cityPostsModalOpen, setCityPostsModalOpen] = useState(false);
  const [cityPosts, setCityPosts] = useState<any[]>([]);
  const [selectedCityInfo, setSelectedCityInfo] = useState<{
    city: string;
    topicId: number;
  } | null>(null);
  const [loadingCityPosts, setLoadingCityPosts] = useState(false);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await apiClient.get('/topics/my-topics');
        setAllTopics(response.data);
      } catch (err) {
        setError('Gagal memuat daftar topik.');
        console.error(err);
      }
    };
    fetchTopics();
  }, []);

  // Handle topic selection
  const handleTopicSelect = (topicId: number) => {
    setSelectedTopics(
      (prev) =>
        prev.includes(topicId)
          ? prev.filter((id) => id !== topicId)
          : [...prev, topicId].slice(0, 4) // Limit to 4 topics
    );
  };

  // Handle compare
  const handleCompare = async () => {
    if (selectedTopics.length < 2) {
      setError('Pilih minimal 2 topik untuk dibandingkan.');
      return;
    }
    setLoading(true);
    setError(null);
    setComparisonData(null);

    try {
      const response = await apiClient.post('/compare-topics', {
        topic_ids: selectedTopics,
      });
      console.log('Comparison Data:', response.data);
      setComparisonData(response.data);
    } catch (err) {
      setError('Gagal mengambil data perbandingan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF export
  const handleExportPdf = async (topicId: string, topicName: string) => {
    const cardElement = cardRefs.current[topicId];
    if (!cardElement) return;

    setExportingPdf(topicId);
    try {
      // Store original styles
      const originalCardMaxHeight = cardElement.style.maxHeight;
      const originalCardOverflow = cardElement.style.overflow;
      const originalCardHeight = cardElement.style.height;

      // Find ALL elements with overflow/maxHeight constraints
      const allElements = cardElement.querySelectorAll<HTMLElement>('*');
      const originalStyles: Array<{
        element: HTMLElement;
        maxHeight: string;
        overflow: string;
        overflowY: string;
        overflowX: string;
        textOverflow: string;
        whiteSpace: string;
        height: string;
      }> = [];

      allElements.forEach((el) => {
        const computedStyle = window.getComputedStyle(el);
        const hasOverflowConstraint =
          computedStyle.overflow !== 'visible' ||
          computedStyle.overflowY !== 'visible' ||
          computedStyle.maxHeight !== 'none';

        if (hasOverflowConstraint) {
          originalStyles.push({
            element: el,
            maxHeight: el.style.maxHeight,
            overflow: el.style.overflow,
            overflowY: el.style.overflowY,
            overflowX: el.style.overflowX,
            textOverflow: el.style.textOverflow,
            whiteSpace: el.style.whiteSpace,
            height: el.style.height,
          });
          el.style.maxHeight = 'none';
          el.style.overflow = 'visible';
          el.style.overflowY = 'visible';
          el.style.overflowX = 'visible';
        }
      });

      // Find truncate text elements
      const truncateElements = cardElement.querySelectorAll<HTMLElement>('.truncate');
      const truncateOriginalStyles: Array<{
        element: HTMLElement;
        overflow: string;
        textOverflow: string;
        whiteSpace: string;
      }> = [];

      truncateElements.forEach((el) => {
        truncateOriginalStyles.push({
          element: el,
          overflow: el.style.overflow,
          textOverflow: el.style.textOverflow,
          whiteSpace: el.style.whiteSpace,
        });
        el.style.overflow = 'visible';
        el.style.textOverflow = 'clip';
        el.style.whiteSpace = 'normal';
      });

      // Set card to full height
      cardElement.style.maxHeight = 'none';
      cardElement.style.overflow = 'visible';
      cardElement.style.height = 'auto';

      // Wait for layout to stabilize and charts to render
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Force reflow to ensure all charts are rendered
      void cardElement.offsetHeight;

      // Get actual height after expanding
      const actualHeight = cardElement.scrollHeight;

      // Capture the card
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollY: -window.scrollY,
        windowHeight: document.documentElement.scrollHeight,
        height: actualHeight,
        y: cardElement.offsetTop,
      });

      // Restore original styles
      originalStyles.forEach((item) => {
        item.element.style.maxHeight = item.maxHeight;
        item.element.style.overflow = item.overflow;
        item.element.style.overflowY = item.overflowY;
        item.element.style.overflowX = item.overflowX;
        item.element.style.textOverflow = item.textOverflow;
        item.element.style.whiteSpace = item.whiteSpace;
        item.element.style.height = item.height;
      });

      truncateOriginalStyles.forEach((item) => {
        item.element.style.overflow = item.overflow;
        item.element.style.textOverflow = item.textOverflow;
        item.element.style.whiteSpace = item.whiteSpace;
      });

      cardElement.style.maxHeight = originalCardMaxHeight;
      cardElement.style.overflow = originalCardOverflow;
      cardElement.style.height = originalCardHeight;

      const imgData = canvas.toDataURL('image/png');

      // Calculate PDF dimensions
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const margin = 10;
      const contentWidth = pdfWidth - margin * 2;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = contentWidth / (imgWidth / 2);
      const scaledHeight = (imgHeight / 2) * ratio;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // If content fits in one page
      if (scaledHeight <= pdfHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, scaledHeight);
      } else {
        // Multiple pages needed
        let remainingHeight = scaledHeight;
        let sourceY = 0;
        let pageNum = 0;

        while (remainingHeight > 0) {
          if (pageNum > 0) {
            pdf.addPage();
          }

          const pageContentHeight = Math.min(remainingHeight, pdfHeight - margin * 2);
          const sourceHeight = (pageContentHeight / scaledHeight) * imgHeight;

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = sourceHeight;
          const ctx = pageCanvas.getContext('2d');

          if (ctx) {
            const img = new Image();
            img.src = imgData;
            await new Promise((resolve) => {
              img.onload = resolve;
            });
            ctx.drawImage(img, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
            const pageImgData = pageCanvas.toDataURL('image/png');
            pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidth, pageContentHeight);
          }

          sourceY += sourceHeight;
          remainingHeight -= pageContentHeight;
          pageNum++;
        }
      }

      pdf.save(`${topicName.replace(/[^a-zA-Z0-9]/g, '_')}_comparison.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    } finally {
      setExportingPdf(null);
    }
  };

  // Handle view city posts
  const handleViewCityPosts = async (city: string, topicId: number) => {
    setSelectedCityInfo({ city, topicId });
    setLoadingCityPosts(true);
    setCityPostsModalOpen(true);

    try {
      const response = await apiClient.get('/post-analysis/posts-by-city', {
        params: {
          topic_id: topicId,
          city: city,
          limit: 50,
        },
      });

      const posts = response.data.data || response.data || [];
      setCityPosts(posts);
    } catch (err) {
      console.error('Error fetching city posts:', err);
      setCityPosts([]);
    } finally {
      setLoadingCityPosts(false);
    }
  };

  const handleCloseCityPostsModal = () => {
    setCityPostsModalOpen(false);
    setCityPosts([]);
    setSelectedCityInfo(null);
  };

  // Calculate grid columns
  const getGridColumns = () => {
    const count = comparisonData?.total_topics || 0;
    if (count === 2) return { xs: 12, lg: 6 };
    if (count === 3) return { xs: 12, md: 6, lg: 4 };
    return { xs: 12, md: 6, lg: 3 };
  };

  return (
    <>
      <Helmet>
        <title>Bandingkan Topik - Analisis Sentimen</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Bandingkan Topik
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pilih hingga 4 topik untuk melihat perbandingan data secara berdampingan.
          </Typography>
        </Box>

        {/* Topic Selection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Pilih Topik:
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {allTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic.id);
                return (
                  <Grid key={topic.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                    <Button
                      fullWidth
                      variant={isSelected ? 'contained' : 'outlined'}
                      color={isSelected ? 'primary' : 'inherit'}
                      onClick={() => handleTopicSelect(topic.id)}
                      startIcon={
                        isSelected ? <CheckSquare fontSize="small" /> : <Square fontSize="small" />
                      }
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        py: 1.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {topic.name}
                      </Typography>
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              onClick={handleCompare}
              disabled={loading || selectedTopics.length < 2}
              startIcon={loading && <CircularProgress size={20} />}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Membandingkan...' : 'Bandingkan Sekarang'}
            </Button>
          </CardContent>
        </Card>

        {/* Sentiment Comparison Chart */}
        {comparisonData && !loading && (
          <Box sx={{ mb: 3 }}>
            <SentimentComparisonChart chartData={comparisonData} topics={allTopics} />
          </Box>
        )}

        {/* Comparison Results */}
        <Grid container spacing={3}>
          {loading && (
            <>
              <Grid size={getGridColumns()}>
                <ComparisonCardSkeleton />
              </Grid>
              <Grid size={getGridColumns()}>
                <ComparisonCardSkeleton />
              </Grid>
            </>
          )}

          {comparisonData?.data &&
            Object.entries(comparisonData.data).map(([topicId, topicData]) => (
              <Grid key={topicId} size={getGridColumns()}>
                <Card
                  ref={(el) => {
                    cardRefs.current[topicId] = el;
                  }}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    {/* Export PDF Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleExportPdf(topicId, topicData.topic_name)}
                        disabled={exportingPdf === topicId}
                        title="Export to PDF"
                      >
                        {exportingPdf === topicId ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Download fontSize="small" />
                        )}
                      </IconButton>
                    </Box>

                    {/* Topic Header */}
                    <Typography
                      variant="h5"
                      sx={{ color: 'primary.main', fontWeight: 700, mb: 0.5 }}
                    >
                      {topicData.topic_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                      {topicData.instansi}
                    </Typography>

                    {/* Active Networks Badges */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {topicData.active_networks.map((net) => (
                        <Chip
                          key={net}
                          label={net}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Network Statistics */}
                    <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                      {topicData.active_networks.map((networkName) => {
                        const networkData = topicData.networks[networkName];
                        if (!networkData) return null;

                        // Calculate sentiment percentages
                        const sentimentPercentages = (networkData?.percentage?.data || []).reduce(
                          (acc: { [key: string]: number }, item: any) => {
                            acc[item.sentiment] = item.percentage;
                            return acc;
                          },
                          {}
                        );

                        // Calculate total posts
                        const totalPosts =
                          networkData.sentiment_summary?.data?.reduce(
                            (sum: number, day: any) =>
                              sum +
                              parseInt(String(day.positive || 0)) +
                              parseInt(String(day.neutral || 0)) +
                              parseInt(String(day.negative || 0)),
                            0
                          ) || 0;

                        return (
                          <Box
                            key={networkName}
                            sx={{
                              borderLeft: 4,
                              borderColor: 'primary.main',
                              pl: 2,
                              mb: 3,
                            }}
                          >
                            {/* Network Title */}
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, mb: 1, textTransform: 'uppercase' }}
                            >
                              {getNetworkEmoji(networkName)} {getNetworkDisplayName(networkName)}
                            </Typography>

                            {/* Sentiment Stats */}
                            <Box
                              sx={{
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                                p: 1.5,
                                mb: 1.5,
                              }}
                            >
                              <Grid container spacing={1} sx={{ textAlign: 'center' }}>
                                <Grid size={4}>
                                  <Typography
                                    variant="h6"
                                    sx={{ color: 'success.main', fontWeight: 700 }}
                                  >
                                    {sentimentPercentages.positive?.toFixed(1) || 0}%
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Positif
                                  </Typography>
                                </Grid>
                                <Grid size={4}>
                                  <Typography
                                    variant="h6"
                                    sx={{ color: 'warning.main', fontWeight: 700 }}
                                  >
                                    {sentimentPercentages.neutral?.toFixed(1) || 0}%
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Netral
                                  </Typography>
                                </Grid>
                                <Grid size={4}>
                                  <Typography
                                    variant="h6"
                                    sx={{ color: 'error.main', fontWeight: 700 }}
                                  >
                                    {sentimentPercentages.negative?.toFixed(1) || 0}%
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Negatif
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>

                            {/* Additional Stats */}
                            <Grid container spacing={1} sx={{ mb: 1.5 }}>
                              {/* Total Posts */}
                              <Grid size={6}>
                                <Box
                                  sx={{
                                    bgcolor: 'info.lighter',
                                    borderRadius: 1,
                                    p: 1.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      mb: 0.5,
                                    }}
                                  >
                                    <Hash fontSize="small" sx={{ color: 'info.main' }} />
                                    <Typography variant="caption" fontWeight={500}>
                                      Posts
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="h6"
                                    sx={{ color: 'info.main', fontWeight: 700 }}
                                  >
                                    {networkData.media_share?.total_articles || totalPosts || 0}
                                  </Typography>
                                </Box>
                              </Grid>

                              {/* Top Issues Count */}
                              {networkData.top_issues?.data &&
                                networkData.top_issues.data.length > 0 && (
                                  <Grid size={6}>
                                    <Box
                                      sx={{
                                        bgcolor: 'warning.lighter',
                                        borderRadius: 1,
                                        p: 1.5,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 0.5,
                                          mb: 0.5,
                                        }}
                                      >
                                        <TrendingUp
                                          fontSize="small"
                                          sx={{ color: 'warning.main' }}
                                        />
                                        <Typography variant="caption" fontWeight={500}>
                                          Issues
                                        </Typography>
                                      </Box>
                                      <Typography
                                        variant="h6"
                                        sx={{ color: 'warning.main', fontWeight: 700 }}
                                      >
                                        {networkData.top_issues.data.length}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                            </Grid>

                            {/* Sentiment Summary Chart */}
                            {networkData.sentiment_summary?.data &&
                              networkData.sentiment_summary.data.length > 0 && (
                                <Box
                                  sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    p: 1.5,
                                    mb: 1.5,
                                  }}
                                >
                                  <Box
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                                  >
                                    <BarChart3 fontSize="small" />
                                    <Typography variant="caption" fontWeight={600}>
                                      Sentiment Trend
                                    </Typography>
                                  </Box>
                                  <ReactApexChart
                                    options={{
                                      chart: {
                                        type: 'area',
                                        height: 150,
                                        toolbar: { show: false },
                                        zoom: { enabled: false },
                                      },
                                      dataLabels: { enabled: false },
                                      stroke: { curve: 'smooth', width: 2 },
                                      fill: {
                                        type: 'gradient',
                                        gradient: {
                                          opacityFrom: 0.6,
                                          opacityTo: 0.1,
                                        },
                                      },
                                      xaxis: {
                                        categories: networkData.sentiment_summary.data.map(
                                          (d: any) => d.date
                                        ),
                                        labels: { show: false },
                                      },
                                      yaxis: {
                                        labels: { style: { fontSize: '10px' } },
                                      },
                                      legend: {
                                        show: true,
                                        position: 'top',
                                        fontSize: '10px',
                                      },
                                      colors: ['#10B981', '#F59E0B', '#EF4444'],
                                      tooltip: { x: { format: 'dd MMM' } },
                                    }}
                                    series={[
                                      {
                                        name: 'Positive',
                                        data: networkData.sentiment_summary.data.map((d: any) =>
                                          parseInt(String(d.positive || 0))
                                        ),
                                      },
                                      {
                                        name: 'Neutral',
                                        data: networkData.sentiment_summary.data.map((d: any) =>
                                          parseInt(String(d.neutral || 0))
                                        ),
                                      },
                                      {
                                        name: 'Negative',
                                        data: networkData.sentiment_summary.data.map((d: any) =>
                                          parseInt(String(d.negative || 0))
                                        ),
                                      },
                                    ]}
                                    type="area"
                                    height={150}
                                  />
                                </Box>
                              )}

                            {/* Keywords Cloud */}
                            {networkData.keyword_data && networkData.keyword_data.length > 0 && (
                              <Box
                                sx={{
                                  border: 1,
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 1.5,
                                  mb: 1.5,
                                }}
                              >
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                                >
                                  <Hash fontSize="small" />
                                  <Typography variant="caption" fontWeight={600}>
                                    Top Keywords Cloud
                                  </Typography>
                                </Box>
                                <Box sx={{ width: '100%', height: 500, position: 'relative' }}>
                                  <WordCloud
                                    data={networkData.keyword_data.slice(0, 30).map((k) => ({
                                      text: k.keyword,
                                      value: k.sentiment_score,
                                    }))}
                                    width={450}
                                    height={500}
                                    fontSize={(word) => {
                                      const values = networkData.keyword_data!.map(
                                        (k) => k.sentiment_score
                                      );
                                      const min = Math.min(...values);
                                      const max = Math.max(...values);
                                      const normalized = (word.value - min) / (max - min);
                                      return 8 + normalized * 14;
                                    }}
                                    fontWeight={(word) => {
                                      const values = networkData.keyword_data!.map(
                                        (k) => k.sentiment_score
                                      );
                                      const min = Math.min(...values);
                                      const max = Math.max(...values);
                                      const normalized = (word.value - min) / (max - min);
                                      return normalized > 0.5 ? 800 : 600;
                                    }}
                                    rotate={() => 0}
                                    padding={2}
                                    spiral="rectangular"
                                    font="inherit"
                                    fill={() =>
                                      colorPalette[Math.floor(Math.random() * colorPalette.length)]
                                    }
                                  />
                                </Box>
                              </Box>
                            )}

                            {/* City Analysis Chart - Web Only */}
                            {networkName === 'web' &&
                              networkData.city_analysis_lowest &&
                              networkData.city_analysis_lowest.length > 0 && (
                                <Box
                                  sx={{
                                    bgcolor: 'error.lighter',
                                    border: 1,
                                    borderColor: 'error.main',
                                    borderRadius: 1,
                                    p: 1.5,
                                    mb: 1.5,
                                  }}
                                >
                                  <Box
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                                  >
                                    <MapPin fontSize="small" sx={{ color: 'error.main' }} />
                                    <Typography variant="caption" fontWeight={600}>
                                      Lowest Sentiment Cities
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mb: 1, display: 'block', fontSize: 10 }}
                                  >
                                    Click on bars or "View" button to see posts
                                  </Typography>
                                  <ReactApexChart
                                    options={{
                                      chart: {
                                        type: 'bar',
                                        height: 180,
                                        toolbar: { show: false },
                                        events: {
                                          dataPointSelection: (
                                            _event: any,
                                            _chartContext: any,
                                            config: any
                                          ) => {
                                            const selectedCity =
                                              networkData.city_analysis_lowest![
                                                config.dataPointIndex
                                              ];
                                            if (selectedCity) {
                                              handleViewCityPosts(
                                                selectedCity.city,
                                                topicData.topic_id
                                              );
                                            }
                                          },
                                        },
                                      },
                                      plotOptions: {
                                        bar: {
                                          horizontal: true,
                                          distributed: true,
                                          barHeight: '60%',
                                        },
                                      },
                                      dataLabels: {
                                        enabled: true,
                                        style: { fontSize: '9px' },
                                      },
                                      xaxis: {
                                        categories: networkData.city_analysis_lowest.map(
                                          (c) => c.city
                                        ),
                                        labels: { style: { fontSize: '10px' } },
                                      },
                                      yaxis: {
                                        labels: {
                                          style: {
                                            fontSize: '9px',
                                          },
                                        },
                                      },
                                      colors: networkData.city_analysis_lowest.map((c) =>
                                        c.score >= 70
                                          ? '#10B981'
                                          : c.score >= 50
                                            ? '#F59E0B'
                                            : '#EF4444'
                                      ),
                                      legend: { show: false },
                                      tooltip: {
                                        y: {
                                          formatter: (val: number, opts: any) => {
                                            const city =
                                              networkData.city_analysis_lowest![
                                                opts.dataPointIndex
                                              ];
                                            return `${val} (${city.total_posts} posts) - Click to view posts`;
                                          },
                                        },
                                      },
                                      states: {
                                        hover: {
                                          filter: {
                                            type: 'lighten',
                                            value: 0.15,
                                          },
                                        },
                                        active: {
                                          filter: {
                                            type: 'darken',
                                            value: 0.15,
                                          },
                                        },
                                      },
                                    }}
                                    series={[
                                      {
                                        name: 'Sentiment Score',
                                        data: networkData.city_analysis_lowest.map((c) => c.score),
                                      },
                                    ]}
                                    type="bar"
                                    height={180}
                                  />

                                  {/* City List with View Posts */}
                                  <Box sx={{ maxHeight: 200, overflowY: 'auto', mt: 2 }}>
                                    {networkData.city_analysis_lowest.map((city, idx) => {
                                      const hue = (city.score / 100) * 120;
                                      const color = `hsl(${hue}, 100%, 50%)`;
                                      return (
                                        <Box
                                          key={idx}
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            p: 1,
                                            mb: 1,
                                            bgcolor: 'background.paper',
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              flexDirection: 'column',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              width: 40,
                                              height: 40,
                                              borderRadius: 1,
                                              bgcolor: color,
                                              color: 'white',
                                              flexShrink: 0,
                                            }}
                                          >
                                            <Typography variant="caption" sx={{ fontSize: 9 }}>
                                              Score
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                              {city.score}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                fontWeight: 600,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                display: 'block',
                                              }}
                                            >
                                              {city.city}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{ fontSize: 10 }}
                                            >
                                              {city.total_posts} posts
                                            </Typography>
                                          </Box>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleViewCityPosts(city.city, topicData.topic_id);
                                            }}
                                            sx={{
                                              fontSize: 9,
                                              px: 1,
                                              py: 0.5,
                                              minWidth: 'auto',
                                            }}
                                          >
                                            View
                                          </Button>
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Box>
                              )}

                            {/* Critical Sentiment Areas - Web Only */}
                            {networkName === 'web' &&
                              networkData.critical_sentiment_areas &&
                              networkData.critical_sentiment_areas.length > 0 && (
                                <Box
                                  sx={{
                                    bgcolor: 'warning.lighter',
                                    border: 1,
                                    borderColor: 'warning.main',
                                    borderRadius: 1,
                                    p: 1.5,
                                    mb: 1.5,
                                  }}
                                >
                                  <Box
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                                  >
                                    <AlertTriangle
                                      fontSize="small"
                                      sx={{ color: 'warning.main' }}
                                    />
                                    <Typography variant="caption" fontWeight={600}>
                                      Critical Sentiment Areas (Score ≤ 35)
                                    </Typography>
                                  </Box>
                                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                                    {networkData.critical_sentiment_areas.map((area, idx) => {
                                      const hue = (area.score / 100) * 120;
                                      const color = `hsl(${hue}, 100%, 50%)`;
                                      return (
                                        <Box
                                          key={idx}
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            p: 1,
                                            mb: 1,
                                            bgcolor: 'background.paper',
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              flexDirection: 'column',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              width: 40,
                                              height: 40,
                                              borderRadius: 1,
                                              bgcolor: color,
                                              color: 'white',
                                              flexShrink: 0,
                                            }}
                                          >
                                            <Typography variant="caption" sx={{ fontSize: 9 }}>
                                              Score
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                              {area.score}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                fontWeight: 600,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                display: 'block',
                                              }}
                                            >
                                              {area.city}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{ fontSize: 10 }}
                                            >
                                              {area.total_posts} posts
                                            </Typography>
                                          </Box>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleViewCityPosts(area.city, topicData.topic_id);
                                            }}
                                            sx={{
                                              fontSize: 9,
                                              px: 1,
                                              py: 0.5,
                                              minWidth: 'auto',
                                            }}
                                          >
                                            View
                                          </Button>
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Box>
                              )}

                            {/* Top Issues Preview - Web Only */}
                            {networkName === 'web' &&
                              networkData.top_issues?.data &&
                              networkData.top_issues.data.length > 0 && (
                                <Box
                                  sx={{
                                    bgcolor: 'warning.lighter',
                                    borderRadius: 1,
                                    p: 1.5,
                                    mb: 1.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}
                                  >
                                    Top Issues:
                                  </Typography>
                                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                    {networkData.top_issues.data
                                      .slice(0, 2)
                                      .map((issue: any, i: number) => (
                                        <Box
                                          component="li"
                                          key={i}
                                          sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          <Typography variant="caption">
                                            {issue.sentence} ({issue.count})
                                          </Typography>
                                        </Box>
                                      ))}
                                  </Box>
                                </Box>
                              )}

                            {/* Resume Section */}
                            {networkData.resume && (
                              <Box
                                sx={{
                                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                                  border: 1,
                                  borderColor: 'primary.light',
                                  borderRadius: 1,
                                  p: 1.5,
                                }}
                              >
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                                >
                                  <PieChart fontSize="small" />
                                  <Typography variant="caption" fontWeight={700}>
                                    Resume Analisis:
                                  </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                                  {networkData.resume.summary}
                                </Typography>
                                {networkData.resume.key_insights &&
                                  networkData.resume.key_insights.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}
                                      >
                                        Key Insights:
                                      </Typography>
                                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                        {networkData.resume.key_insights.map((insight, i) => (
                                          <Box component="li" key={i}>
                                            <Typography variant="caption" color="text.secondary">
                                              {insight}
                                            </Typography>
                                          </Box>
                                        ))}
                                      </Box>
                                    </Box>
                                  )}
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>

        {/* City Posts Modal */}
        <TopPostsModal
          open={cityPostsModalOpen}
          topPosts={cityPosts}
          onClose={handleCloseCityPostsModal}
          loading={loadingCityPosts}
        />
      </Container>
    </>
  );
}
