import { useState, useEffect } from 'react';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  CloudDownload,
  Language,
  Description,
  Storage,
  CalendarMonth,
} from '@mui/icons-material';
import { FaXTwitter, FaFacebook, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import jsPDF from 'jspdf';
import apiClient from 'src/services/apiService';

// ===========================|| INTERFACES ||=========================== //

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  topicId: number;
  topicName: string;
  preSelectedPlatform?: string;
}

interface ContentType {
  id: string;
  label: string;
  value: string;
  icon: any;
}

const contentTypes: ContentType[] = [
  { id: 'web', label: 'Media/Web', value: 'web', icon: Language },
  { id: 'tweet', label: 'Twitter/X', value: 'tweet', icon: FaXTwitter },
  { id: 'facebook', label: 'Facebook', value: 'facebook', icon: FaFacebook },
  { id: 'instagram', label: 'Instagram', value: 'instagram', icon: FaInstagram },
  { id: 'tiktok', label: 'TikTok', value: 'tiktok', icon: FaTiktok },
  { id: 'youtube', label: 'YouTube', value: 'youtube', icon: FaYoutube },
];

// ===========================|| COMPONENT ||=========================== //

export default function ExportModal({
  open,
  onClose,
  topicId,
  topicName,
  preSelectedPlatform,
}: ExportModalProps) {
  const [step, setStep] = useState(preSelectedPlatform ? 2 : 1);
  const [selectedContentType, setSelectedContentType] = useState<string>(preSelectedPlatform || '');
  const [exportType, setExportType] = useState<'analytics' | 'raw' | ''>('');
  const [exporting, setExporting] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(preSelectedPlatform ? 2 : 1);
        setSelectedContentType(preSelectedPlatform || '');
        setExportType('');
        setAnalyticsData(null);
        setError('');
      }, 300);
    }
  }, [open, preSelectedPlatform]);

  const handleContentTypeSelect = (contentType: string) => {
    setSelectedContentType(contentType);
    setStep(2);
  };

  const handleExportTypeSelect = (type: 'analytics' | 'raw') => {
    setExportType(type);
    if (type === 'analytics') {
      setStep(3);
      fetchAnalyticsData();
    } else {
      setStep(3);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    setError('');
    try {
      const startDateStr = dayjs().subtract(30, 'day').format('YYYY-MM-DD 00:00:00');
      const endDateStr = dayjs().format('YYYY-MM-DD 00:00:00');

      const fetchPromises: Promise<any>[] = [
        apiClient
          .post('/sentiment-summary', {
            topic_id: topicId,
            post_type: selectedContentType,
            start_date: startDateStr,
            end_date: endDateStr,
          })
          .catch(() => null),

        apiClient
          .get(
            `/search-results/${topicId}/${selectedContentType}/sentiment-percentage?start_date=${encodeURIComponent(startDateStr)}&end_date=${encodeURIComponent(endDateStr)}`
          )
          .catch(() => null),

        apiClient
          .get(`/posts/top-issues?topic_id=${topicId}&post_type=${selectedContentType}&days=30`)
          .catch(() => null),
      ];

      if (selectedContentType === 'web') {
        fetchPromises.push(
          apiClient.get(`/media-share/${topicId}/${selectedContentType}`).catch(() => null)
        );

        fetchPromises.push(
          apiClient
            .get(
              `/post-analysis/geolocation-stats?topic_id=${topicId}&start_date=${startDateStr.split(' ')[0]}&end_date=${endDateStr.split(' ')[0]}`
            )
            .catch(() => null)
        );
      } else {
        fetchPromises.push(
          apiClient
            .post('/expression-summary', {
              topic_id: topicId,
              post_type: selectedContentType,
              start_date: startDateStr,
              end_date: endDateStr,
            })
            .catch(() => null)
        );

        fetchPromises.push(
          apiClient
            .get(
              `/search-results/${topicId}/${selectedContentType}/expression-percentage?start_date=${encodeURIComponent(startDateStr)}&end_date=${encodeURIComponent(endDateStr)}`
            )
            .catch(() => null)
        );
      }

      fetchPromises.push(
        apiClient
          .post('/resume-ai', {
            topic_id: topicId,
            network: selectedContentType,
          })
          .catch(() => null)
      );

      fetchPromises.push(
        apiClient
          .post('/top-issues', {
            topic_id: topicId,
            network: selectedContentType,
          })
          .catch(() => null)
      );

      const results = await Promise.all(fetchPromises);

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
      setError('Failed to load analytics data');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const exportRawDataCSV = async () => {
    setExporting(true);
    setError('');
    try {
      const startDateStr = startDate.format('YYYY-MM-DD');
      const endDateStr = endDate.format('YYYY-MM-DD');

      let allData: any[] = [];

      if (selectedContentType === 'web') {
        const response = await apiClient.get(
          `/article/export-raw?topic_id=${topicId}&type=${selectedContentType}&start_date=${startDateStr}&end_date=${endDateStr}`
        );
        allData = response.data.data || response.data || [];
      } else {
        let page = 1;
        const perPage = 10000;
        const maxRows = 10000;
        let hasMoreData = true;

        while (allData.length < maxRows && hasMoreData) {
          try {
            const response = await apiClient.get(
              `/article/export-raw?topic_id=${topicId}&type=${selectedContentType}&start_date=${startDateStr}&end_date=${endDateStr}&page=${page}&per_page=${perPage}`
            );

            const posts = response.data.data || response.data || [];

            if (posts.length === 0) {
              break;
            }

            allData = [...allData, ...posts];

            const currentPage = response.data.current_page;
            const lastPage = response.data.last_page;

            if (currentPage >= lastPage) {
              hasMoreData = false;
            }

            if (allData.length >= maxRows) {
              hasMoreData = false;
            }

            page++;
          } catch (error) {
            break;
          }
        }

        allData = allData.slice(0, maxRows);
      }

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

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${topicName}_${selectedContentType}_raw_${startDateStr}_${endDateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Error exporting raw data:', error);
      setError('Error exporting data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportAnalyticsPDF = async () => {
    if (!analyticsData || !selectedContentType) return;

    setExporting(true);
    setError('');
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let y = 20;

      const checkPage = (needed = 10) => {
        if (y + needed > pageHeight - margin) {
          pdf.addPage();
          y = 20;
        }
      };

      // Title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analytics Report', margin, y);
      y += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Topic    : ${topicName}`, margin, y); y += 6;
      pdf.text(`Platform : ${contentTypes.find((c) => c.value === selectedContentType)?.label || selectedContentType}`, margin, y); y += 6;
      pdf.text(`Generated: ${dayjs().format('MMM DD, YYYY HH:mm')}`, margin, y); y += 12;

      // Sentiment Distribution
      const rawSd = analyticsData.sentimentPercentage?.data;
      const sdArr: any[] = Array.isArray(rawSd) ? rawSd : [];
      if (sdArr.length > 0) {
        checkPage(30);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Sentiment Distribution', margin, y); y += 7;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const pos = sdArr.find((s: any) => s.sentiment === 'positive')?.percentage || 0;
        const neu = sdArr.find((s: any) => s.sentiment === 'neutral')?.percentage || 0;
        const neg = sdArr.find((s: any) => s.sentiment === 'negative')?.percentage || 0;
        pdf.text(`Positive : ${Number(pos).toFixed(1)}%`, margin + 5, y); y += 5;
        pdf.text(`Neutral  : ${Number(neu).toFixed(1)}%`, margin + 5, y); y += 5;
        pdf.text(`Negative : ${Number(neg).toFixed(1)}%`, margin + 5, y); y += 10;
      }

      // Expression Distribution (non-web)
      const rawEx = analyticsData.expressionPercentage?.data;
      const exArr: any[] = Array.isArray(rawEx) ? rawEx : [];
      if (exArr.length > 0) {
        checkPage(30);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Expression Distribution', margin, y); y += 7;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        exArr.slice(0, 8).forEach((ex: any) => {
          checkPage(6);
          pdf.text(`${ex.expression || ex.label}: ${Number(ex.percentage || ex.value || 0).toFixed(1)}%`, margin + 5, y); y += 5;
        });
        y += 5;
      }

      // Top Issues
      const rawIssues = analyticsData.topIssues?.data;
      const issuesArr: any[] = Array.isArray(rawIssues) ? rawIssues : [];
      if (issuesArr.length > 0) {
        checkPage(20);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Top Issues', margin, y); y += 7;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        issuesArr.slice(0, 10).forEach((issue: any, i: number) => {
          checkPage(8);
          const text = `${i + 1}. ${issue.sentence} (${issue.count})`;
          const lines = pdf.splitTextToSize(text, pageWidth - margin * 2 - 5);
          pdf.text(lines, margin + 5, y);
          y += lines.length * 5;
        });
        y += 5;
      }

      // Top Keywords
      const rawKw = analyticsData.topKeywords?.data || analyticsData.topKeywords;
      const kwArr: any[] = Array.isArray(rawKw) ? rawKw : [];
      if (kwArr.length > 0) {
        checkPage(20);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Top Keywords', margin, y); y += 7;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        kwArr.slice(0, 10).forEach((kw: any, i: number) => {
          checkPage(6);
          pdf.text(`${i + 1}. ${kw.word || kw.keyword || kw.text} (${kw.count || kw.value || ''})`, margin + 5, y); y += 5;
        });
        y += 5;
      }

      // AI Summary
      if (analyticsData.resumeAI?.summary) {
        checkPage(20);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Summary', margin, y); y += 7;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(analyticsData.resumeAI.summary, pageWidth - margin * 2);
        lines.forEach((line: string) => {
          checkPage(6);
          pdf.text(line, margin, y); y += 5;
        });
      }

      pdf.save(`${topicName}_${selectedContentType}_analytics.pdf`);
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Error generating PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExport = () => {
    if (exportType === 'raw') {
      exportRawDataCSV();
    } else if (exportType === 'analytics') {
      exportAnalyticsPDF();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={exporting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
        }}
      >
        <Typography variant="h4" component="h2">
          Export Data: {topicName}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          disabled={exporting}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Step 1: Select Content Type */}
        {step === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Select Content Type
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              {contentTypes.map((ct) => {
                const IconComponent = ct.icon;
                return (
                  <Grid key={ct.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      onClick={() => handleContentTypeSelect(ct.value)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: 4,
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <CardContent>
                        <IconComponent style={{ fontSize: 32, marginBottom: 12, opacity: 0.6 }} />
                        <Typography variant="subtitle1" fontWeight="semibold">
                          {ct.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Step 2: Select Export Type */}
        {step === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Select Export Type
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Platform:{' '}
              <strong>{contentTypes.find((c) => c.value === selectedContentType)?.label}</strong>
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card
                  onClick={() => handleExportTypeSelect('analytics')}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent>
                    <Description sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom fontWeight="semibold">
                      Analytics Report (PDF)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Export comprehensive analytics including sentiment, expressions, and top
                      issues in PDF format with charts.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card
                  onClick={() => handleExportTypeSelect('raw')}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent>
                    <Storage sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom fontWeight="semibold">
                      Raw Data (CSV)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Export raw posts data with custom date range. Maximum 10,000 rows.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Button onClick={() => setStep(1)} variant="outlined" sx={{ mt: 3 }}>
              Back
            </Button>
          </Box>
        )}

        {/* Step 3: Configure & Export */}
        {step === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Configure & Export
            </Typography>

            <Card sx={{ mb: 3, bgcolor: 'action.hover' }}>
              <CardContent>
                <Typography variant="body2" gutterBottom>
                  <strong>Topic:</strong> {topicName}
                </Typography>
                <Typography variant="body2" gutterBottom>
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
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <CalendarMonth sx={{ fontSize: 18 }} />
                  Select Date Range (Max 10,000 rows)
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => newValue && setStartDate(newValue)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => newValue && setEndDate(newValue)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Box>
                </LocalizationProvider>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  From {startDate.format('MMM DD, YYYY')} to {endDate.format('MMM DD, YYYY')}
                </Typography>
              </Box>
            )}

            {exportType === 'analytics' && loadingAnalytics && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 6,
                  gap: 2,
                }}
              >
                <CircularProgress size={24} />
                <Typography color="text.secondary">Loading analytics data...</Typography>
              </Box>
            )}

            {exportType === 'analytics' && analyticsData && !loadingAnalytics && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="semibold">
                    Analytics Preview
                  </Typography>

                  {Array.isArray(analyticsData.sentimentPercentage?.data) && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">
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
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        Top Issues: {analyticsData.topIssues.data.length} keywords found
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    PDF will include sentiment data, expressions, and top issues.
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={() => setStep(2)} variant="outlined" disabled={exporting}>
                Back
              </Button>

              <Button
                onClick={handleExport}
                disabled={
                  exporting || (exportType === 'analytics' && (loadingAnalytics || !analyticsData))
                }
                variant="contained"
                startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
              >
                {exporting
                  ? 'Exporting...'
                  : `Export ${exportType === 'analytics' ? 'PDF' : 'CSV'}`}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
