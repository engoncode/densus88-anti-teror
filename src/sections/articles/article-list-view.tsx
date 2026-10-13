import { useState, useEffect, useRef, useCallback } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Image as ImageIcon,
  AccessTime as ClockIcon,
  Fullscreen as FullscreenIcon,
  ViewList as TableIcon,
  ViewModule as GalleryIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Language as WebIcon,
  LocalOffer as TagIcon,
  KeyboardArrowDown as ChevronDownIcon,
  TableChart as TableChartIcon,
  SentimentSatisfied as SentimentIcon,
} from '@mui/icons-material';
import { FaTiktok } from 'react-icons/fa';
import apiClient from 'src/services/apiService';

dayjs.extend(relativeTime);

interface Article {
  id: number;
  title: string;
  image: string | null;
  image_url: string | null;
  user_name: string;
  posted: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  post_type: string;
  text_content?: string;
  konteks?: string;
  alasan?: string;
  espression?: string;
  sub_espression?: string;
  alasan_espression?: string;
  postid?: string;
}

interface ArticleListViewProps {
  topicId: number;
  type?: string;
}

export function ArticleListView({ topicId, type = '' }: ArticleListViewProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState(type);
  const [filterSentiment, setFilterSentiment] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'masonry'>('masonry');
  const [typeMenuAnchor, setTypeMenuAnchor] = useState<null | HTMLElement>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedArticles, setExpandedArticles] = useState<Set<number>>(new Set());
  const [loadingList, setLoadingList] = useState(false);
  const [imageOrientations, setImageOrientations] = useState<
    Record<number, 'portrait' | 'landscape'>
  >({});

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Sync filterType when parent type prop changes
  useEffect(() => {
    setFilterType(type);
    setPage(1);
    setArticles([]);
  }, [type]);

  const observerTarget = useRef<HTMLDivElement>(null);

  const detectImageOrientation = (url: string, articleId: number) => {
    const img = new Image();
    img.onload = () => {
      const orientation = img.width > img.height ? 'landscape' : 'portrait';
      setImageOrientations((prev) => ({
        ...prev,
        [articleId]: orientation,
      }));
    };
    img.src = url;
  };

  const fetchArticles = async (pageToFetch = 1, replace = false) => {
    setLoadingList(true);
    try {
      const { data } = await apiClient.get('/articles-content', {
        params: {
          topic_id: topicId,
          post_type: filterType,
          sentiment: filterSentiment,
          search,
          page: pageToFetch,
        },
      });

      const newArticles = data.data || [];

      if (replace) {
        setArticles(newArticles);
        newArticles.forEach((article: Article) => {
          if (article.image) {
            detectImageOrientation(article.image, article.id);
          }
        });
      } else {
        setArticles((prev) => [...prev, ...newArticles]);
        newArticles.forEach((article: Article) => {
          if (article.image) {
            detectImageOrientation(article.image, article.id);
          }
        });
      }
      setHasMore(data.next_page_url !== null);
      setPage(pageToFetch);
    } catch (err) {
      console.error('Fetch articles failed:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchArticles(1, true);
  }, [search, filterType, filterSentiment, topicId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingList) {
          fetchArticles(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingList, page]);

  const handleLoadMore = () => {
    if (hasMore) fetchArticles(page + 1);
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

  const renderSocialIcon = (postType: string) => {
    const type = postType.toLowerCase();
    const iconProps = { fontSize: 'small' as const };

    switch (type) {
      case 'tweet':
      case 'twitter':
        return <TwitterIcon {...iconProps} />;
      case 'facebook':
        return <FacebookIcon {...iconProps} />;
      case 'instagram':
        return <InstagramIcon {...iconProps} />;
      case 'tiktok':
        return <FaTiktok style={{ fontSize: 14 }} />;
      case 'youtube':
        return <YouTubeIcon {...iconProps} />;
      case 'web':
        return <WebIcon {...iconProps} />;
      default:
        return <TagIcon {...iconProps} />;
    }
  };

  const typeOptions = [
    { value: '', label: 'All Types', icon: <TableChartIcon fontSize="small" /> },
    { value: 'web', label: 'Web', icon: <WebIcon fontSize="small" /> },
    { value: 'tweet', label: 'Twitter', icon: <TwitterIcon fontSize="small" /> },
    { value: 'facebook', label: 'Facebook', icon: <FacebookIcon fontSize="small" /> },
    { value: 'instagram', label: 'Instagram', icon: <InstagramIcon fontSize="small" /> },
    {
      value: 'tiktok',
      label: 'TikTok',
      icon: <FaTiktok style={{ fontSize: 14 }} />,
    },
  ];

  const getSelectedTypeOption = () => {
    return typeOptions.find((opt) => opt.value === filterType) || typeOptions[0];
  };

  const handleDetail = async (article: Article) => {
    setLoadingDetail(true);
    setSelectedArticle(null);
    try {
      const { data } = await apiClient.get(`/articles/${article.id}`);
      setSelectedArticle(data);
    } catch (err) {
      console.error('Fetch detail failed:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => setSelectedArticle(null);

  const toggleReadMore = (articleId: number) => {
    setExpandedArticles((prev) => {
      const newSet = new Set(prev);
      newSet.has(articleId) ? newSet.delete(articleId) : newSet.add(articleId);
      return newSet;
    });
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <TableChartIcon /> Last Running Content
          </Typography>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="table">
              <TableIcon fontSize="small" sx={{ mr: 0.5 }} />
              Table
            </ToggleButton>
            <ToggleButton value="masonry">
              <GalleryIcon fontSize="small" sx={{ mr: 0.5 }} />
              Gallery
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            size="small"
            endIcon={<ChevronDownIcon />}
            onClick={(e) => setTypeMenuAnchor(e.currentTarget)}
            sx={{ minWidth: 160 }}
          >
            {getSelectedTypeOption().icon}
            <Box component="span" sx={{ ml: 1 }}>
              {getSelectedTypeOption().label}
            </Box>
          </Button>
          <Menu
            anchorEl={typeMenuAnchor}
            open={Boolean(typeMenuAnchor)}
            onClose={() => setTypeMenuAnchor(null)}
          >
            {typeOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterType(option.value);
                  setTypeMenuAnchor(null);
                }}
                selected={filterType === option.value}
              >
                <ListItemIcon>{option.icon}</ListItemIcon>
                <ListItemText>{option.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sentiment</InputLabel>
            <Select
              value={filterSentiment}
              label="Sentiment"
              onChange={(e) => setFilterSentiment(e.target.value)}
            >
              <MenuItem value="">All Sentiments</MenuItem>
              <MenuItem value="positive">Positive</MenuItem>
              <MenuItem value="neutral">Neutral</MenuItem>
              <MenuItem value="negative">Negative</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Masonry Layout View */}
        {viewMode === 'masonry' && (
          <Box
            sx={{
              columnCount: { xs: 1, sm: 2, lg: 3, xl: 4 },
              columnGap: 2,
              '& > *': { breakInside: 'avoid', mb: 2 },
            }}
          >
            {articles.map((article) => {
              const orientation = imageOrientations[article.id] || 'landscape';
              return (
                <Card
                  key={article.id}
                  onClick={() => handleDetail(article)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  {article.image && (
                    <Box
                      sx={{
                        position: 'relative',
                        height: orientation === 'portrait' ? 300 : 200,
                        bgcolor: 'action.hover',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        component="img"
                        src={article.image}
                        alt={article.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s',
                          '&:hover': { transform: 'scale(1.05)' },
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23E5E7EB'/%3E%3C/svg%3E";
                        }}
                      />
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        {renderSentimentChip(article.sentiment)}
                      </Box>
                    </Box>
                  )}

                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {article.image_url ? (
                        <Avatar
                          src={article.image_url}
                          alt={article.user_name}
                          sx={{ width: 32, height: 32 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${article.user_name || 'User'}&background=random`;
                          }}
                        />
                      ) : (
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {(article.user_name || 'U')[0].toUpperCase()}
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" fontWeight="bold" noWrap>
                          @{article.user_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                        >
                          <ClockIcon sx={{ fontSize: 12 }} />
                          {dayjs(article.posted).fromNow()}
                        </Typography>
                      </Box>
                      {!article.image && renderSentimentChip(article.sentiment)}
                    </Box>

                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {article.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={renderSocialIcon(article.post_type)}
                        label={article.post_type}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ImageIcon fontSize="small" /> Image
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TableChartIcon fontSize="small" /> Title
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SentimentIcon fontSize="small" /> Sentiment
                    </Box>
                  </TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={article.image || ''}
                        alt="thumb"
                        sx={{
                          width: 80,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='50' viewBox='0 0 80 50'%3E%3Crect width='80' height='50' fill='%23E5E7EB'/%3E%3C/svg%3E";
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" display="block">
                        @{article.user_name}
                      </Typography>
                      <Typography variant="body2">
                        {expandedArticles.has(article.id) ? (
                          <>
                            {article.title}
                            <Button
                              size="small"
                              onClick={() => toggleReadMore(article.id)}
                              sx={{ ml: 1 }}
                            >
                              Read less
                            </Button>
                          </>
                        ) : (
                          <>
                            {article.title.length > 100
                              ? `${article.title.substring(0, 100)}...`
                              : article.title}
                            {article.title.length > 100 && (
                              <Button
                                size="small"
                                onClick={() => toggleReadMore(article.id)}
                                sx={{ ml: 1 }}
                              >
                                Read more
                              </Button>
                            )}
                          </>
                        )}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                        >
                          <ClockIcon sx={{ fontSize: 12 }} />
                          {dayjs(article.posted).fromNow()}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          sx={{ textTransform: 'capitalize' }}
                        >
                          <TagIcon sx={{ fontSize: 12 }} />
                          {article.post_type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{renderSentimentChip(article.sentiment)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<FullscreenIcon />}
                        onClick={() => handleDetail(article)}
                      >
                        Analisa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {loadingList && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {hasMore && !loadingList && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button variant="contained" onClick={handleLoadMore}>
                  Load More
                </Button>
              </Box>
            )}
          </TableContainer>
        )}

        {/* Infinite Scroll Trigger */}
        <Box ref={observerTarget} sx={{ py: 2, textAlign: 'center' }}>
          {loadingList && <CircularProgress size={24} />}
          {!hasMore && articles.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              No more articles to load
            </Typography>
          )}
        </Box>

        {/* Detail Modal */}
        <Dialog
          open={loadingDetail || Boolean(selectedArticle)}
          onClose={closeModal}
          maxWidth="sm"
          fullWidth
        >
          {loadingDetail ? (
            <DialogContent sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </DialogContent>
          ) : (
            selectedArticle && (
              <>
                <DialogTitle>{selectedArticle.title}</DialogTitle>
                <DialogContent dividers>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium" display="inline">
                      Sentiment:{' '}
                    </Typography>
                    {renderSentimentChip(selectedArticle.sentiment)}
                  </Box>

                  {selectedArticle.konteks && (
                    <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Context:</strong> "{selectedArticle.konteks}"
                      </Typography>
                    </Box>
                  )}

                  {selectedArticle.alasan && (
                    <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Reason:</strong> "{selectedArticle.alasan}"
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {selectedArticle.text_content || 'Konten tidak tersedia.'}
                  </Typography>

                  {selectedArticle.espression && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" display="inline" fontWeight="medium">
                        Ekspresi:{' '}
                      </Typography>
                      <Chip label={selectedArticle.espression} size="small" color="info" />
                    </Box>
                  )}

                  {selectedArticle.sub_espression && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" display="inline" fontWeight="medium">
                        Sub-Ekspresi:{' '}
                      </Typography>
                      <Chip label={selectedArticle.sub_espression} size="small" color="secondary" />
                    </Box>
                  )}

                  {selectedArticle.alasan_espression && (
                    <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Alasan Ekspresi:</strong> "{selectedArticle.alasan_espression}"
                      </Typography>
                    </Box>
                  )}

                  {selectedArticle.postid && (
                    <Button
                      variant="text"
                      href={selectedArticle.postid}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ mt: 2 }}
                    >
                      🔗 Lihat Posting Asli
                    </Button>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={closeModal} variant="contained">
                    Close
                  </Button>
                </DialogActions>
              </>
            )
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
}
