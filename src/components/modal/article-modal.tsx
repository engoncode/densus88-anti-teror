import { useState, useEffect, useRef, MouseEvent } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Dialog,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Button,
  Pagination,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Person as UserIcon,
  CalendarToday as CalendarIcon,
  Image as ImageIcon,
  LocalOffer as TagIcon,
  Message as MessageIcon,
  MoreHoriz as MoreIcon,
  Place as MapPinIcon,
  OpenInNew as ExternalLinkIcon,
  SentimentSatisfied as SentimentIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Language as WebIcon,
} from '@mui/icons-material';
import { FaTiktok } from 'react-icons/fa';
import apiClient from 'src/services/apiService';

interface ArticleSummary {
  post_id: number;
  title: string;
  user_name: string;
  sentiment: string;
  posted: string;
  postid?: string;
  post_type?: string;
}

interface ArticleDetail {
  image?: string;
  title: string;
  user_name: string;
  posted: string;
  sentiment: string;
  text_content: string;
  postid?: string;
  post_type?: string;
  alasan?: string;
  konteks?: string;
  espression?: string;
  sub_espression?: string;
  alasan_espression?: string;
  what?: string;
  why?: string;
  who?: string;
  when_text?: string;
  where_text?: string;
  how?: string;
  sentiment_score?: number;
  score_reason?: string;
}

export interface ArticleModalProps {
  open: boolean;
  topicId: number;
  tanggal?: string;
  platform?: string;
  dateFrom?: string;
  dateTo?: string;
  kota?: string;
  media?: string;
  concern?: string;
  expression?: string;
  sentiment?: string;
  onClose: () => void;
}

export function ArticleModal({
  open,
  topicId,
  tanggal,
  platform: initialPlatform,
  dateFrom: propsDateFrom,
  dateTo: propsDateTo,
  kota,
  media,
  concern,
  expression,
  sentiment: initialSentiment,
  onClose,
}: ArticleModalProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sentimentFilter, setSentimentFilter] = useState<string>(initialSentiment || '');
  const [platformFilter, setPlatformFilter] = useState<string>(initialPlatform || '');
  const [dateFrom, setDateFrom] = useState<string>(propsDateFrom || '');
  const [dateTo, setDateTo] = useState<string>(propsDateTo || '');
  const [filterTanggal, setFilterTanggal] = useState<string>(tanggal || '');
  const [filterKota, setFilterKota] = useState<string>(kota || '');
  const [filterMedia, setFilterMedia] = useState<string>(media || '');
  const [filterConcern, setFilterConcern] = useState<string>(concern || '');
  const [filterExpression, setFilterExpression] = useState<string>(expression || '');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Sync all filter props when modal opens - all state changes are batched,
  // so the fetch effect fires only ONCE with all correct values
  useEffect(() => {
    if (open) {
      setSentimentFilter(initialSentiment || '');
      setPlatformFilter(initialPlatform || '');
      setDateFrom(propsDateFrom || '');
      setDateTo(propsDateTo || '');
      setFilterTanggal(tanggal || '');
      setFilterKota(kota || '');
      setFilterMedia(media || '');
      setFilterConcern(concern || '');
      setFilterExpression(expression || '');
      setCurrentPage(1);
      setSelectedId(null);
      setSelectedArticle(null);
    }
  }, [
    open,
    initialSentiment,
    initialPlatform,
    propsDateFrom,
    propsDateTo,
    tanggal,
    kota,
    media,
    concern,
    expression,
  ]);

  useEffect(() => {
    if (!open) return;

    const fetchArticles = async () => {
      setLoadingList(true);

      const params: any = {
        topic_id: topicId,
        page: currentPage,
      };

      if (searchTerm.trim()) params.search = searchTerm;
      if (sentimentFilter) params.sentiment = sentimentFilter;
      if (platformFilter) params.platform = platformFilter;
      if (filterKota) params.kota = filterKota;
      if (filterMedia) params.media = filterMedia;
      if (filterConcern) params.concern = filterConcern;
      if (filterExpression) params.expression = filterExpression;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (filterTanggal) params.tanggal = filterTanggal;

      try {
        const res = await apiClient.get('/articles-modal/search', { params });
        setArticles(res.data.data || []);
        setLastPage(res.data.last_page || 1);
      } catch (err) {
        console.error('Gagal fetch articles:', err);
        setArticles([]);
        setLastPage(1);
      } finally {
        setLoadingList(false);
      }
    };

    fetchArticles();
  }, [
    topicId,
    filterTanggal,
    platformFilter,
    filterKota,
    filterMedia,
    filterConcern,
    filterExpression,
    sentimentFilter,
    searchTerm,
    dateFrom,
    dateTo,
    currentPage,
  ]);

  // Auto-select first article when list changes
  useEffect(() => {
    if (articles.length > 0) {
      setSelectedId(articles[0].post_id);
    } else {
      setSelectedId(null);
    }
  }, [articles]);

  useEffect(() => {
    if (selectedId === null) {
      setSelectedArticle(null);
      return;
    }

    const fetchDetail = async (id: number) => {
      setLoadingDetail(true);
      try {
        const res = await apiClient.get(`/articles/${id}`);
        setSelectedArticle(res.data);
        setIsExpanded(false);
      } catch (err) {
        console.error('Gagal fetch detail:', err);
        setSelectedArticle(null);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail(selectedId);
  }, [selectedId]);

  const handleClose = () => {
    setSelectedId(null);
    setSelectedArticle(null);
    setIsExpanded(false);
    setSearchTerm('');
    setSentimentFilter('');
    setPlatformFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    onClose();
  };

  const renderSocialIcon = (postType?: string) => {
    const type = (postType || '').toLowerCase();
    const iconProps = { sx: { fontSize: 12 } };

    switch (type) {
      case 'tweet':
      case 'twitter':
        return <TwitterIcon {...iconProps} />;
      case 'facebook':
        return <FacebookIcon {...iconProps} />;
      case 'instagram':
        return <InstagramIcon {...iconProps} />;
      case 'tiktok':
        return <FaTiktok style={{ fontSize: 12 }} />;
      case 'web':
        return <WebIcon {...iconProps} />;
      default:
        return <UserIcon {...iconProps} />;
    }
  };

  const renderSentimentChip = (sentiment: string) => {
    const colorMap: Record<string, 'success' | 'warning' | 'error'> = {
      positive: 'success',
      neutral: 'warning',
      negative: 'error',
    };
    return (
      <Chip
        label={sentiment}
        color={colorMap[sentiment] || 'default'}
        size="small"
        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
      />
    );
  };

  const isPortrait =
    selectedArticle?.post_type === 'instagram' || selectedArticle?.post_type === 'tiktok';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: isPortrait ? '900px' : '1200px',
          height: isPortrait ? '90vh' : '80vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Filter Bar */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.neutral',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          placeholder="Cari judul..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sentiment</InputLabel>
          <Select
            value={sentimentFilter}
            label="Sentiment"
            onChange={(e) => {
              setSentimentFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <MenuItem value="">Semua Sentimen</MenuItem>
            <MenuItem value="positive">Positive</MenuItem>
            <MenuItem value="negative">Negative</MenuItem>
            <MenuItem value="neutral">Neutral</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Platform</InputLabel>
          <Select
            value={platformFilter}
            label="Platform"
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <MenuItem value="">Semua Platform</MenuItem>
            <MenuItem value="tweet">Twitter</MenuItem>
            <MenuItem value="facebook">Facebook</MenuItem>
            <MenuItem value="instagram">Instagram</MenuItem>
            <MenuItem value="tiktok">TikTok</MenuItem>
            <MenuItem value="web">Web</MenuItem>
          </Select>
        </FormControl>

        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Article List */}
        <Box
          sx={{
            width: isPortrait ? '40%' : '50%',
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {loadingList ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress size={24} />
                <Typography sx={{ ml: 2 }} variant="body2" color="text.secondary">
                  Memuat daftar...
                </Typography>
              </Box>
            ) : articles.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Tidak ada artikel
                </Typography>
              </Box>
            ) : (
              articles.map((item) => (
                <Box
                  key={item.post_id}
                  onClick={() => setSelectedId(item.post_id)}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: selectedId === item.post_id ? 'action.selected' : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Typography variant="body2" fontWeight="medium" noWrap sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {renderSocialIcon(item.post_type)}
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.user_name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      •
                    </Typography>
                    {renderSentimentChip(item.sentiment)}
                    <Typography variant="caption" color="text.secondary">
                      •
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 12 }} />
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(item.posted).format('DD/MM/YYYY')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {/* Pagination */}
          {lastPage > 1 && (
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Pagination
                count={lastPage}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                size="small"
                color="primary"
              />
            </Box>
          )}
        </Box>

        {/* Right: Article Detail */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {selectedId === null ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Pilih artikel untuk melihat detail
              </Typography>
            </Box>
          ) : loadingDetail ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }} variant="body2" color="text.secondary">
                Memuat detail...
              </Typography>
            </Box>
          ) : selectedArticle ? (
            <Box>
              {selectedArticle.image ? (
                <Box
                  component="img"
                  src={selectedArticle.image}
                  alt="Article image"
                  sx={{
                    width: '100%',
                    height: isPortrait ? 384 : 160,
                    objectFit: isPortrait ? 'contain' : 'cover',
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    mb: 2,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: isPortrait ? 384 : 160,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <ImageIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <MessageIcon />
                  {selectedArticle.title}
                </Typography>
                {selectedArticle.postid && (
                  <Button
                    size="small"
                    href={selectedArticle.postid}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<ExternalLinkIcon />}
                  >
                    Link
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <UserIcon fontSize="small" />
                  <Typography variant="body2">{selectedArticle.user_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon fontSize="small" />
                  <Typography variant="body2">
                    {dayjs(selectedArticle.posted).format('DD/MM/YYYY HH:mm')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TagIcon fontSize="small" />
                  {renderSentimentChip(selectedArticle.sentiment)}
                </Box>
              </Box>

              <Typography variant="body2" sx={{ mb: 2 }}>
                {isExpanded || selectedArticle.text_content.length <= 200
                  ? selectedArticle.text_content
                  : `${selectedArticle.text_content.slice(0, 200)}...`}
                {!isExpanded && selectedArticle.text_content.length > 200 && (
                  <Button size="small" onClick={() => setIsExpanded(true)} sx={{ ml: 1 }}>
                    Read more
                  </Button>
                )}
                {isExpanded && selectedArticle.text_content.length > 200 && (
                  <Button size="small" onClick={() => setIsExpanded(false)} sx={{ ml: 1 }}>
                    Read less
                  </Button>
                )}
              </Typography>

              {selectedArticle.alasan && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Alasan:
                  </Typography>
                  <Typography variant="body2">{selectedArticle.alasan}</Typography>
                </Box>
              )}

              {selectedArticle.konteks && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Konteks:
                  </Typography>
                  <Typography variant="body2">{selectedArticle.konteks}</Typography>
                </Box>
              )}

              {/* W5H1 Section */}
              {(selectedArticle.what ||
                selectedArticle.why ||
                selectedArticle.who ||
                selectedArticle.when_text ||
                selectedArticle.where_text ||
                selectedArticle.how) && (
                <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Analisis 5W1H
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      {selectedArticle.what && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', width: 100 }}>
                            Apa:
                          </TableCell>
                          <TableCell>{selectedArticle.what}</TableCell>
                        </TableRow>
                      )}
                      {selectedArticle.who && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Siapa:
                          </TableCell>
                          <TableCell>{selectedArticle.who}</TableCell>
                        </TableRow>
                      )}
                      {selectedArticle.when_text && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Kapan:
                          </TableCell>
                          <TableCell>{selectedArticle.when_text}</TableCell>
                        </TableRow>
                      )}
                      {selectedArticle.where_text && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Dimana:
                          </TableCell>
                          <TableCell>{selectedArticle.where_text}</TableCell>
                        </TableRow>
                      )}
                      {selectedArticle.why && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Mengapa:
                          </TableCell>
                          <TableCell>{selectedArticle.why}</TableCell>
                        </TableRow>
                      )}
                      {selectedArticle.how && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Bagaimana:
                          </TableCell>
                          <TableCell>{selectedArticle.how}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              )}

              {/* Sentiment Score */}
              {selectedArticle.sentiment_score !== undefined && (
                <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Sentiment Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      {selectedArticle.sentiment_score}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / 100
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={selectedArticle.sentiment_score}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        bgcolor:
                          selectedArticle.sentiment_score >= 70
                            ? 'success.main'
                            : selectedArticle.sentiment_score >= 40
                              ? 'warning.main'
                              : 'error.main',
                      },
                    }}
                  />
                  {selectedArticle.score_reason && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {selectedArticle.score_reason}
                    </Typography>
                  )}
                </Box>
              )}

              {selectedArticle.espression && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Ekspresi:
                  </Typography>
                  <Typography variant="body2">{selectedArticle.espression}</Typography>
                </Box>
              )}

              {selectedArticle.sub_espression && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Sub-Ekspresi:
                  </Typography>
                  <Typography variant="body2">{selectedArticle.sub_espression}</Typography>
                </Box>
              )}

              {selectedArticle.alasan_espression && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Alasan Ekspresi:
                  </Typography>
                  <Typography variant="body2">{selectedArticle.alasan_espression}</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Pilih artikel untuk melihat detail
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
