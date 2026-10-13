import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
} from '@mui/material';
import {
  Download,
  Description,
  Storage,
  ChevronRight,
  Language,
  CalendarMonth,
} from '@mui/icons-material';
import { FaTwitter, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa6';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import jsPDF from 'jspdf';
import apiClient from 'src/services/apiService';

// Types
interface Topic {
  id: number;
  name: string;
  keyword?: string;
  hashtag?: string;
}

interface ContentType {
  id: string;
  label: string;
  value: string;
  icon: any;
  color: string;
}

const contentTypes: ContentType[] = [
  { id: 'web', label: 'Media/Web', value: 'web', icon: Language, color: '#2196f3' },
  { id: 'tweet', label: 'Twitter/X', value: 'tweet', icon: FaTwitter, color: '#1DA1F2' },
  { id: 'facebook', label: 'Facebook', value: 'facebook', icon: FaFacebook, color: '#1877f2' },
  { id: 'instagram', label: 'Instagram', value: 'instagram', icon: FaInstagram, color: '#E4405F' },
  { id: 'tiktok', label: 'TikTok', value: 'tiktok', icon: FaTiktok, color: '#000000' },
];

const steps = ['Select Topic', 'Select Platform', 'Select Export Type', 'Configure & Export'];

export default function ExportDataPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [exportType, setExportType] = useState<'analytics' | 'raw' | ''>('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Date range for raw data export
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  // Analytics data states
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await apiClient.get('/topics/my-topics');
      setTopics(response.data || response);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setActiveStep(1);
  };

  const handleContentTypeSelect = (contentType: string) => {
    setSelectedContentType(contentType);
    setActiveStep(2);
  };

  const handleExportTypeSelect = (type: 'analytics' | 'raw') => {
    setExportType(type);
    if (type === 'analytics') {
      setActiveStep(3);
      fetchAnalyticsData();
    } else {
      setActiveStep(3);
    }
  };

  const fetchAnalyticsData = async () => {
    if (!selectedTopic) return;

    setLoadingAnalytics(true);
    try {
      const endDateObj = new Date();
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - 30);

      const formatDate = (d: Date) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} 00:00:00`;
      };

      const startDateStr = formatDate(startDateObj);
      const endDateStr = formatDate(endDateObj);

      // Fetch analytics data
      const fetchPromises: Promise<any>[] = [
        // Sentiment Summary
        apiClient.post('/sentiment-summary', {
          topic_id: selectedTopic.id,
          post_type: selectedContentType,
          start_date: startDateStr,
          end_date: endDateStr,
        }),

        // Sentiment Percentage
        apiClient.get(
          `/search-results/${selectedTopic.id}/${selectedContentType}/sentiment-percentage?start_date=${encodeURIComponent(startDateStr)}&end_date=${encodeURIComponent(endDateStr)}`
        ),

        // Top Issues
        apiClient.get(
          `/posts/top-issues?topic_id=${selectedTopic.id}&post_type=${selectedContentType}&days=30`
        ),
      ];

      if (selectedContentType === 'web') {
        // Media Share
        fetchPromises.push(
          apiClient.get(`/media-share/${selectedTopic.id}/${selectedContentType}`)
        );

        // City Analysis
        fetchPromises.push(
          apiClient.get(
            `/post-analysis/geolocation-stats?topic_id=${selectedTopic.id}&start_date=${startDateStr.split(' ')[0]}&end_date=${endDateStr.split(' ')[0]}`
          )
        );
      } else {
        // Expression Summary
        fetchPromises.push(
          apiClient.post('/expression-summary', {
            topic_id: selectedTopic.id,
            post_type: selectedContentType,
            start_date: startDateStr,
            end_date: endDateStr,
          })
        );

        // Expression Percentage
        fetchPromises.push(
          apiClient.get(
            `/search-results/${selectedTopic.id}/${selectedContentType}/expression-percentage?start_date=${encodeURIComponent(startDateStr)}&end_date=${encodeURIComponent(endDateStr)}`
          )
        );
      }

      // Resume AI
      fetchPromises.push(
        apiClient.post('/resume-ai', {
          topic_id: selectedTopic.id,
          network: selectedContentType,
        })
      );

      // Top Keywords
      fetchPromises.push(
        apiClient.post('/top-issues', {
          topic_id: selectedTopic.id,
          network: selectedContentType,
        })
      );

      const results = await Promise.all(fetchPromises.map((p) => p.catch((e) => null)));

      if (selectedContentType === 'web') {
        setAnalyticsData({
          sentimentSummary: results[0]?.data,
          sentimentPercentage: results[1]?.data,
          topIssues: results[2]?.data,
          mediaShare: results[3]?.data,
          cityAnalysis: results[4]?.data,
          resumeAI: results[5]?.data,
          topKeywords: results[6]?.data,
        });
      } else {
        setAnalyticsData({
          sentimentSummary: results[0]?.data,
          sentimentPercentage: results[1]?.data,
          topIssues: results[2]?.data,
          expressionSummary: results[3]?.data,
          expressionPercentage: results[4]?.data,
          resumeAI: results[5]?.data,
          topKeywords: results[6]?.data,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const exportRawDataCSV = async () => {
    if (!selectedTopic || !selectedContentType) return;

    setExporting(true);
    try {
      const startDateStr = startDate.format('YYYY-MM-DD');
      const endDateStr = endDate.format('YYYY-MM-DD');

      let allData: any[] = [];

      if (selectedContentType === 'web') {
        const response = await apiClient.get(
          `/article/export-raw?topic_id=${selectedTopic.id}&type=${selectedContentType}&start_date=${startDateStr}&end_date=${endDateStr}`
        );
        allData = response.data || [];
      } else {
        // Pagination for social media
        let page = 1;
        const perPage = 10000;
        const maxRows = 10000;
        let hasMoreData = true;

        while (allData.length < maxRows && hasMoreData) {
          const response = await apiClient.get(
            `/article/export-raw?topic_id=${selectedTopic.id}&type=${selectedContentType}&start_date=${startDateStr}&end_date=${endDateStr}&page=${page}&per_page=${perPage}`
          );

          const result = response.data || response;
          const posts = result.data || [];
          if (posts.length === 0) break;

          allData = [...allData, ...posts];

          if (result.current_page >= result.last_page) {
            hasMoreData = false;
          }

          if (allData.length >= maxRows) {
            hasMoreData = false;
          }

          page++;
        }

        allData = allData.slice(0, maxRows);
      }

      // Helper to clean text
      const cleanText = (text: string | null | undefined): string => {
        if (!text) return '';
        return text
          .replace(/\r\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/"/g, '""')
          .replace(/\s+/g, ' ')
          .trim();
      };

      // Generate CSV
      let headers: string[];
      let rows: (string | number)[][];

      if (selectedContentType === 'web') {
        headers = [
          'No',
          'Date',
          'Title',
          'Sentiment',
          'Alasan',
          'Context',
          'Link',
          'What',
          'Why',
          'Who',
          'When',
          'Where',
          'How',
          'Sentiment Score',
          'Score Reason',
          'Content',
        ];

        rows = allData.map((post, index) => [
          index + 1,
          post.posted ? dayjs(post.posted).format('YYYY-MM-DD HH:mm:ss') : '',
          cleanText(post.title),
          post.sentiment || '',
          cleanText(post.alasan),
          cleanText(post.konteks),
          post.post_url || '',
          cleanText(post.what),
          cleanText(post.why),
          cleanText(post.who),
          cleanText(post.when_text),
          cleanText(post.where_text),
          cleanText(post.how),
          post.sentiment_score || '',
          cleanText(post.score_reason),
          cleanText(post.text_content),
        ]);
      } else {
        headers = [
          'No',
          'Date',
          'Content',
          'Sentiment',
          'Alasan',
          'Context',
          'Expression',
          'User Name',
          'Likes',
          'Comments',
          'Shares',
          'Views',
          'Link',
        ];

        rows = allData.map((post, index) => [
          index + 1,
          post.posted ? dayjs(post.posted).format('YYYY-MM-DD HH:mm:ss') : '',
          cleanText(post.text_content || post.title),
          post.sentiment || '',
          cleanText(post.alasan),
          cleanText(post.konteks),
          post.espression || '',
          post.user_name || '',
          post.like_count || 0,
          post.comment || 0,
          post.share || 0,
          post.view || 0,
          post.post_url || '',
        ]);
      }

      const csv = [headers, ...rows]
        .map((row) => row.map((val) => `"${val}"`).join(','))
        .join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedTopic.name}_${selectedContentType}_raw_${startDateStr}_${endDateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting raw data:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportAnalyticsPDF = async () => {
    if (!analyticsData || !selectedTopic) return;

    setExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = 20;

      // Title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analytics Report', margin, yPosition);
      yPosition += 10;

      // Topic info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Topic: ${selectedTopic.name}`, margin, yPosition);
      yPosition += 6;
      pdf.text(
        `Platform: ${contentTypes.find((c) => c.value === selectedContentType)?.label}`,
        margin,
        yPosition
      );
      yPosition += 6;
      pdf.text(`Generated: ${dayjs().format('MMM DD, YYYY HH:mm')}`, margin, yPosition);
      yPosition += 12;

      // Sentiment Distribution
      const _sdRaw = analyticsData.sentimentPercentage?.data;
      const _sdArr: any[] = Array.isArray(_sdRaw) ? _sdRaw : [];
      if (_sdArr.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Sentiment Distribution', margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const positive = _sdArr.find((s: any) => s.sentiment === 'positive')?.percentage || 0;
        const neutral = _sdArr.find((s: any) => s.sentiment === 'neutral')?.percentage || 0;
        const negative = _sdArr.find((s: any) => s.sentiment === 'negative')?.percentage || 0;

        pdf.text(`Positive: ${positive.toFixed(1)}%`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Neutral: ${neutral.toFixed(1)}%`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Negative: ${negative.toFixed(1)}%`, margin + 5, yPosition);
        yPosition += 12;
      }

      // Top Issues
      if (analyticsData.topIssues?.data && analyticsData.topIssues.data.length > 0) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Top Issues', margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        analyticsData.topIssues.data.slice(0, 10).forEach((issue: any, index: number) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          const text = `${index + 1}. ${issue.sentence} (${issue.count})`;
          const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);
          pdf.text(lines, margin + 5, yPosition);
          yPosition += lines.length * 5;
        });
        yPosition += 8;
      }

      // Resume AI
      if (analyticsData.resumeAI?.summary) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Summary', margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const summaryLines = pdf.splitTextToSize(
          analyticsData.resumeAI.summary,
          pageWidth - margin * 2
        );
        pdf.text(summaryLines, margin, yPosition);
        yPosition += summaryLines.length * 5 + 8;
      }

      pdf.save(`${selectedTopic.name}_${selectedContentType}_analytics.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExport = () => {
    if (exportType === 'analytics') {
      exportAnalyticsPDF();
    } else {
      exportRawDataCSV();
    }
  };

  const resetWizard = () => {
    setActiveStep(0);
    setSelectedTopic(null);
    setSelectedContentType('');
    setExportType('');
    setAnalyticsData(null);
  };

  return (
    <>
      <Helmet>
        <title>Export Data - Analisis Sentimen</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Export Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Export analytics reports or raw data from your topics
          </Typography>
        </Box>

        {/* Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: Select Topic */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Step 1: Select Topic
                </Typography>

                {loadingTopics ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {topics.map((topic) => (
                      <Grid key={topic.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card
                          onClick={() => handleTopicSelect(topic)}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: 2,
                            },
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {topic.name}
                            </Typography>
                            {topic.keyword && (
                              <Typography variant="body2" color="text.secondary">
                                Keywords: {topic.keyword}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Step 2: Select Content Type */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Step 2: Select Platform
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Selected Topic: <strong>{selectedTopic?.name}</strong>
                </Alert>

                <Grid container spacing={2}>
                  {contentTypes.map((ct) => {
                    const IconComponent = ct.icon;
                    return (
                      <Grid key={ct.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card
                          onClick={() => handleContentTypeSelect(ct.value)}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: 2,
                            },
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Box sx={{ mb: 2 }}>
                              <IconComponent style={{ fontSize: 48, color: ct.color }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {ct.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                <Button onClick={() => setActiveStep(0)} sx={{ mt: 3 }}>
                  Back
                </Button>
              </Box>
            )}

            {/* Step 3: Select Export Type */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Step 3: Select Export Type
                </Typography>
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`Topic: ${selectedTopic?.name}`} />
                  <Chip
                    label={`Platform: ${contentTypes.find((c) => c.value === selectedContentType)?.label}`}
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      onClick={() => handleExportTypeSelect('analytics')}
                      sx={{
                        cursor: 'pointer',
                        height: '100%',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 2,
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Description sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                          Analytics Report (PDF)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Export comprehensive analytics including sentiment, expressions, and top
                          issues in PDF format with charts.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      onClick={() => handleExportTypeSelect('raw')}
                      sx={{
                        cursor: 'pointer',
                        height: '100%',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 2,
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Storage sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                          Raw Data (CSV)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Export raw posts data with custom date range. Maximum 10,000 rows.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Button onClick={() => setActiveStep(1)} sx={{ mt: 3 }}>
                  Back
                </Button>
              </Box>
            )}

            {/* Step 4: Configure & Export */}
            {activeStep === 3 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Step 4: Configure & Export
                </Typography>

                <Card sx={{ mb: 3, bgcolor: 'action.hover' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Topic:</strong> {selectedTopic?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Platform:</strong>{' '}
                      {contentTypes.find((c) => c.value === selectedContentType)?.label}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Export Type:</strong>{' '}
                      {exportType === 'analytics' ? 'Analytics Report (PDF)' : 'Raw Data (CSV)'}
                    </Typography>
                  </CardContent>
                </Card>

                {exportType === 'raw' && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        <CalendarMonth sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Select Date Range (Max 10,000 rows)
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DatePicker
                              label="Start Date"
                              value={startDate}
                              onChange={(newValue) => newValue && setStartDate(newValue)}
                              maxDate={endDate}
                              slotProps={{ textField: { fullWidth: true } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DatePicker
                              label="End Date"
                              value={endDate}
                              onChange={(newValue) => newValue && setEndDate(newValue)}
                              minDate={startDate}
                              maxDate={dayjs()}
                              slotProps={{ textField: { fullWidth: true } }}
                            />
                          </Grid>
                        </Grid>
                      </LocalizationProvider>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 2, display: 'block' }}
                      >
                        From {startDate.format('MMM DD, YYYY')} to {endDate.format('MMM DD, YYYY')}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {exportType === 'analytics' && loadingAnalytics && (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}
                  >
                    <CircularProgress sx={{ mr: 2 }} />
                    <Typography color="text.secondary">Loading analytics data...</Typography>
                  </Box>
                )}

                {exportType === 'analytics' && analyticsData && !loadingAnalytics && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Analytics Preview
                      </Typography>

                      {Array.isArray(analyticsData.sentimentPercentage?.data) && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Sentiment Distribution:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Positive:{' '}
                            {analyticsData.sentimentPercentage.data.find(
                              (s: any) => s.sentiment === 'positive'
                            )?.percentage || 0}
                            % | Neutral:{' '}
                            {analyticsData.sentimentPercentage.data.find(
                              (s: any) => s.sentiment === 'neutral'
                            )?.percentage || 0}
                            % | Negative:{' '}
                            {analyticsData.sentimentPercentage.data.find(
                              (s: any) => s.sentiment === 'negative'
                            )?.percentage || 0}
                            %
                          </Typography>
                        </Box>
                      )}

                      {analyticsData.topIssues?.data && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Top Issues: {analyticsData.topIssues.data.length} keywords found
                          </Typography>
                        </Box>
                      )}

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 2, display: 'block' }}
                      >
                        PDF will include sentiment data, expressions, and top issues.
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="outlined" onClick={() => setActiveStep(2)} disabled={exporting}>
                    Back
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleExport}
                    disabled={
                      exporting ||
                      (exportType === 'analytics' && (loadingAnalytics || !analyticsData))
                    }
                    startIcon={exporting ? <CircularProgress size={20} /> : <Download />}
                  >
                    {exporting
                      ? 'Exporting...'
                      : `Export ${exportType === 'analytics' ? 'PDF' : 'CSV'}`}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={resetWizard}
                    disabled={exporting}
                    sx={{ ml: 'auto' }}
                  >
                    Start Over
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
