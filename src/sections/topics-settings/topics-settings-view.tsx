import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Skeleton,
  FormControlLabel,
  Checkbox,
  Switch,
  Stack,
  Grid,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Tag as TagIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet-async';
import apiClient from 'src/services/apiService';
import { topicsApi, type ThreatMonitoringSource } from 'src/services/topicsService';

const MEDIA_OPTIONS: { label: string; source: ThreatMonitoringSource }[] = [
  { label: 'Media', source: 'media' },
  { label: 'Twitter', source: 'twitter' },
  { label: 'Facebook', source: 'facebook' },
  { label: 'Instagram', source: 'instagram' },
  { label: 'TikTok', source: 'tiktok' },
];

interface Topic {
  id: number;
  name: string;
  keyword: string;
  hashtag?: string;
  instansi?: string;
  monitoring?: string;
  pivot_id?: number;
  media?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  context?: string;
}

interface NewTopic {
  name: string;
  keywords: string[];
  hashtag: string;
  instansi: string;
  media: string[];
  monitoring: string;
  context: string;
}

const TopicSkeleton = () => (
  <Card variant="outlined" sx={{ borderRadius: 2 }}>
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Skeleton variant="text" width={200} height={28} />
        <Skeleton variant="rounded" width={60} height={22} />
      </Box>
      <Skeleton variant="text" width={140} height={20} sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={100} height={24} />
      </Box>
    </CardContent>
  </Card>
);

const KeywordInput = ({
  keywords,
  setKeywords,
}: {
  keywords: string[];
  setKeywords: (keywords: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState('');

  const addKeywords = (raw: string, existingKeywords: string[]) => {
    const parts = raw
      .split(/[,\n]+/)
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k && !existingKeywords.includes(k));
    return [...existingKeywords, ...parts];
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const updated = addKeywords(inputValue, keywords);
      setKeywords(updated);
      setInputValue('');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.includes(',') || pasted.includes('\n')) {
      e.preventDefault();
      const updated = addKeywords(inputValue + pasted, keywords);
      setKeywords(updated);
      setInputValue('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter((keyword) => keyword !== keywordToRemove));
  };

  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
        bgcolor: 'background.paper',
      }}
    >
      {keywords.map((keyword, index) => (
        <Chip
          key={index}
          label={keyword}
          onDelete={() => removeKeyword(keyword)}
          size="small"
          sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}
          deleteIcon={<CloseIcon />}
        />
      ))}
      <TextField
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="ketik / tempel keyword, pisahkan dengan koma"
        variant="standard"
        size="small"
        sx={{
          flexGrow: 1,
          minWidth: 200,
          '& .MuiInput-root': { '&:before, &:after': { display: 'none' } },
        }}
        InputProps={{ disableUnderline: true }}
      />
    </Box>
  );
};

export function TopicsSettingsView() {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [userRole, setUserRole] = useState('User');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Y' | 'N'>('all');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [newTopic, setNewTopic] = useState<NewTopic>({
    name: '',
    keywords: [],
    hashtag: '',
    instansi: '',
    media: MEDIA_OPTIONS.map((option) => option.label),
    monitoring: 'N',
    context: '',
  });

  const [editTopic, setEditTopic] = useState<
    (Omit<Topic, 'media'> & { keywords: string[]; media: string[]; context: string }) | null
  >(null);
  const [generatingContext, setGeneratingContext] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const mediaOptions = MEDIA_OPTIONS.map((option) => option.label);

  // Convert media name array to backend Y/N fields
  const mediaArrayToFields = (media: string[]) => ({
    media: media.includes('Media') ? 'Y' : 'N',
    twitter: media.includes('Twitter') ? 'Y' : 'N',
    facebook: media.includes('Facebook') ? 'Y' : 'N',
    instagram: media.includes('Instagram') ? 'Y' : 'N',
    tiktok: media.includes('TikTok') ? 'Y' : 'N',
    youtube: media.includes('YouTube') ? 'Y' : 'N',
  });

  // Convert backend Y/N fields to media name array
  const fieldsToMediaArray = (topic: Topic): string[] => {
    const result: string[] = [];
    if (topic.media === 'Y') result.push('Media');
    if (topic.twitter === 'Y') result.push('Twitter');
    if (topic.facebook === 'Y') result.push('Facebook');
    if (topic.instagram === 'Y') result.push('Instagram');
    if (topic.tiktok === 'Y') result.push('TikTok');
    if (topic.youtube === 'Y') result.push('YouTube');
    return result;
  };

  const fetchTopics = async () => {
    try {
      const role = localStorage.getItem('user_role');
      const workspaceId = localStorage.getItem('workspace_id');
      setUserRole(role || 'User');

      const response = await apiClient.get<any>(`/topics/workspace/${workspaceId}`);
      let data: Topic[] = [];
      if (response?.data) {
        data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      }
      setAllTopics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      showNotification('Gagal memuat topik.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const showNotification = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDeleteTopicForOperator = async (topicId: number) => {
    if (
      !window.confirm(
        'Yakin Anda ingin menghapus topik ini? Jika dihapus, semua article akan hilang.'
      )
    ) {
      return;
    }
    try {
      await apiClient.delete(`/topics/${topicId}`);
      showNotification('Topic successfully deleted by Operator!', 'success');
      setAllTopics((prev) => prev.filter((topic) => topic.id !== topicId));
      window.dispatchEvent(new Event('topicsUpdated'));
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete topic.', 'error');
    }
  };

  const handleCreateTopic = async () => {
    if (userRole !== 'Operator') {
      showNotification('Only Operators can create topics.', 'error');
      return;
    }

    if (!newTopic.name.trim()) {
      showNotification('Topic name is required.', 'error');
      return;
    }
    if (newTopic.keywords.length === 0) {
      showNotification('At least one keyword is required.', 'error');
      return;
    }
    if (newTopic.media.length === 0) {
      showNotification('Pilih minimal satu sumber media.', 'error');
      return;
    }
    const workspaceId = Number(localStorage.getItem('workspace_id'));
    if (!Number.isSafeInteger(workspaceId) || workspaceId <= 0) {
      showNotification('Workspace belum tersedia. Masuk ulang atau hubungi pengelola.', 'error');
      return;
    }

    setCreateLoading(true);
    try {
      await topicsApi.createThreatMonitoring({
        name: newTopic.name,
        keyword: newTopic.keywords.join(' or '),
        hashtag: newTopic.hashtag,
        instansi: newTopic.instansi,
        workspace_id: workspaceId,
        monitoring: newTopic.monitoring === 'Y',
        context: newTopic.context,
        media_sources: MEDIA_OPTIONS
          .filter((option) => newTopic.media.includes(option.label))
          .map((option) => option.source),
      });

      showNotification('Topic successfully created!');
      setNewTopic({
        name: '',
        keywords: [],
        hashtag: '',
        instansi: '',
        media: [],
        monitoring: 'N',
        context: '',
      });
      setShowCreateModal(false);
      fetchTopics();
      window.dispatchEvent(new Event('topicsUpdated'));
    } catch (error) {
      const response = isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)
        ? error.response?.data
        : undefined;
      const validationMessage = response?.errors && Object.values(response.errors).flat().join(' ');
      showNotification(validationMessage || response?.message || 'Gagal membuat topik monitoring.', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditTopic = async () => {
    if (!editTopic) return;

    if (!editTopic.name?.trim()) {
      showNotification('Topic name is required.', 'error');
      return;
    }
    if (!editTopic.keywords || editTopic.keywords.length === 0) {
      showNotification('At least one keyword is required.', 'error');
      return;
    }
    const originalTopic = allTopics.find((topic) => topic.id === editTopic.id);
    if (
      (originalTopic?.hashtag && !editTopic.hashtag?.trim()) ||
      (originalTopic?.instansi && !editTopic.instansi?.trim())
    ) {
      showNotification('API edit lama belum mendukung pengosongan hashtag atau instansi yang sudah terisi.', 'error');
      return;
    }
    setUpdateLoading(true);
    try {
      const response = await apiClient.put(`/topics/${editTopic.id}`, {
        name: editTopic.name,
        keyword: editTopic.keywords.join(' or '),
        hashtag: editTopic.hashtag?.trim() || undefined,
        instansi: editTopic.instansi?.trim() || undefined,
        monitoring: editTopic.monitoring ?? 'N',
        context: editTopic.context,
        ...mediaArrayToFields(editTopic.media),
      });

      const data = response.data;
      if (data?.topic) {
        setAllTopics(allTopics.map((t) => (t.id === editTopic.id ? data.topic : t)));
      }
      showNotification('Topic successfully updated!');
      setEditTopic(null);
      setShowEditModal(false);
      window.dispatchEvent(new Event('topicsUpdated'));
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to update topic.', 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCheckboxChange = (media: string) => {
    setNewTopic((prev) => {
      const updatedMedia = prev.media.includes(media)
        ? prev.media.filter((m) => m !== media)
        : [...prev.media, media];
      return { ...prev, media: updatedMedia };
    });
  };

  const handleGenerateContext = async (mode: 'create' | 'edit') => {
    const name = mode === 'create' ? newTopic.name : editTopic?.name || '';
    const instansi = mode === 'create' ? newTopic.instansi : editTopic?.instansi || '';
    if (!name && !instansi) {
      showNotification('Isi Nama Topik atau Instansi terlebih dahulu.', 'error');
      return;
    }
    try {
      setGeneratingContext(true);
      const res = await apiClient.post<{ context: string }>('/topics/generate-context', { name, instansi });
      const generated = (res.data as any)?.context ?? (res.data as any)?.data?.context ?? '';
      if (generated) {
        if (mode === 'create') {
          setNewTopic((prev) => ({ ...prev, context: generated }));
        } else if (editTopic) {
          setEditTopic((prev) => (prev ? { ...prev, context: generated } : null));
        }
        showNotification('Context berhasil digenerate oleh AI!', 'success');
      } else {
        showNotification('AI tidak mengembalikan hasil, coba lagi.', 'error');
      }
    } catch (error) {
      console.error('Failed to generate context:', error);
      showNotification('Gagal generate context. Coba lagi.', 'error');
    } finally {
      setGeneratingContext(false);
    }
  };

  const handleEditCheckboxChange = (media: string) => {
    if (!editTopic) return;
    const updatedMedia = editTopic.media.includes(media)
      ? editTopic.media.filter((m) => m !== media)
      : [...editTopic.media, media];
    setEditTopic({ ...editTopic, media: updatedMedia });
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Topics Settings | Sentiment Analysis</title>
        </Helmet>
        <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
          <Skeleton variant="text" width={220} height={40} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width={360} height={22} sx={{ mb: 4 }} />
          <Stack spacing={2}>
            <TopicSkeleton />
            <TopicSkeleton />
            <TopicSkeleton />
          </Stack>
        </Box>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Topics Settings | Sentiment Analysis</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Topics Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Daftar topik yang sedang dimonitor oleh workspace Anda
            </Typography>
          </Box>
          {userRole === 'Operator' && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowCreateModal(true)}>
              New Topic
            </Button>
          )}
        </Box>

        {/* Search & Filter Bar */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <TextField
            placeholder="Cari nama topik..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={(_e, val) => { if (val !== null) setFilterStatus(val); }}
            size="small"
          >
            <ToggleButton value="all">Semua</ToggleButton>
            <ToggleButton value="Y" sx={{ color: 'success.main' }}>Aktif</ToggleButton>
            <ToggleButton value="N" sx={{ color: 'text.secondary' }}>Stopped</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Topics Grid */}
        {(() => {
          const filtered = allTopics
            .filter((t) => filterStatus === 'all' || t.monitoring === filterStatus)
            .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
              if (a.monitoring === b.monitoring) return 0;
              return a.monitoring === 'Y' ? -1 : 1;
            });

          if (allTopics.length === 0) {
            return <Alert severity="info">Belum ada topik di workspace ini.</Alert>;
          }
          if (filtered.length === 0) {
            return <Alert severity="info">Tidak ada topik yang sesuai filter.</Alert>;
          }
          return (
            <Grid container spacing={2}>
              {filtered.map((topic) => (
                <Grid key={topic.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: 3 },
                      borderColor: topic.monitoring === 'Y' ? 'success.light' : 'divider',
                    }}
                  >
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Name + monitoring badge + actions */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                        <Box sx={{ flexGrow: 1, minWidth: 0, mr: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                              {topic.name}
                            </Typography>
                          </Box>
                          <Chip
                            label={topic.monitoring === 'Y' ? 'Aktif' : 'Nonaktif'}
                            size="small"
                            color={topic.monitoring === 'Y' ? 'success' : 'default'}
                            sx={{ fontWeight: 600, mb: 1 }}
                          />
                        </Box>
                        {userRole === 'Operator' && (
                          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                            <IconButton
                              size="small"
                              color="info"
                              title="Edit Topik"
                              onClick={() => {
                                const keywords = topic.keyword
                                  ? topic.keyword.split(' or ').filter((k) => k)
                                  : [];
                                const media = fieldsToMediaArray(topic);
                                setEditTopic({ ...topic, keywords, media, context: topic.context || '' });
                                setShowEditModal(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              title="Hapus Topik"
                              onClick={() => handleDeleteTopicForOperator(topic.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      {/* Instansi */}
                      {topic.instansi && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <BusinessIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {topic.instansi}
                          </Typography>
                        </Box>
                      )}

                      {/* Keywords */}
                      {(topic.keyword || '').split(' or ').filter((k) => k.trim()).length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, flexWrap: 'wrap', mb: 0.75 }}>
                          <TagIcon sx={{ fontSize: 13, color: 'text.secondary', mt: '3px', flexShrink: 0 }} />
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(topic.keyword || '')
                              .split(' or ')
                              .filter((k) => k.trim())
                              .slice(0, 4)
                              .map((kw, i) => (
                                <Chip
                                  key={i}
                                  label={kw}
                                  size="small"
                                  sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontSize: '0.7rem' }}
                                />
                              ))}
                            {(topic.keyword || '').split(' or ').filter((k) => k.trim()).length > 4 && (
                              <Chip
                                label={`+${(topic.keyword || '').split(' or ').filter((k) => k.trim()).length - 4}`}
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* Hashtag */}
                      {topic.hashtag && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 'auto' }} noWrap>
                          {topic.hashtag}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          );
        })()}
      </Box>

      {/* Create Topic Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Buat Topik Baru
            <IconButton
              onClick={() => {
                setShowCreateModal(false);
                setNewTopic({
                  name: '',
                  keywords: [],
                  hashtag: '',
                  instansi: '',
                  media: [],
                  monitoring: 'N',
                  context: '',
                });
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Nama Topik"
              placeholder="Masukkan nama topik"
              value={newTopic.name}
              onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
              fullWidth
            />

            <TextField
              label="Instansi"
              placeholder="Masukkan nama instansi"
              value={newTopic.instansi}
              onChange={(e) => setNewTopic({ ...newTopic, instansi: e.target.value })}
              fullWidth
            />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Keywords
              </Typography>
              <KeywordInput
                keywords={newTopic.keywords}
                setKeywords={(keywords) => setNewTopic({ ...newTopic, keywords })}
              />
            </Box>

            <TextField
              label="Hashtag"
              placeholder="contoh: #topik1 #topik2"
              value={newTopic.hashtag}
              onChange={(e) => setNewTopic({ ...newTopic, hashtag: e.target.value })}
              fullWidth
            />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Monitoring
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={newTopic.monitoring === 'Y'}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, monitoring: e.target.checked ? 'Y' : 'N' })
                    }
                  />
                }
                label={newTopic.monitoring === 'Y' ? 'ON' : 'OFF'}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Media Sources
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {mediaOptions.map((media) => (
                  <FormControlLabel
                    key={media}
                    control={
                      <Checkbox
                        checked={newTopic.media.includes(media)}
                        onChange={() => handleCheckboxChange(media)}
                        size="small"
                      />
                    }
                    label={media}
                  />
                ))}
              </Box>
            </Box>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={600}>
                  Konteks Analisis Sentimen
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={
                    generatingContext ? (
                      <CircularProgress size={14} />
                    ) : (
                      <Icon icon="solar:magic-stick-3-bold-duotone" />
                    )
                  }
                  onClick={() => handleGenerateContext('create')}
                  disabled={generatingContext}
                >
                  {generatingContext ? 'Generating...' : 'Generate Context'}
                </Button>
              </Stack>
              <TextField
                label="Konteks"
                fullWidth
                multiline
                rows={5}
                value={newTopic.context}
                onChange={(e) => setNewTopic({ ...newTopic, context: e.target.value })}
                helperText="Konteks tentang topik/instansi yang digunakan AI untuk menentukan arah sentimen. Klik 'Generate Context' untuk membuat otomatis."
                placeholder="Contoh: PT Danantara adalah lembaga investasi negara Indonesia... Sentimen positif jika masyarakat mendukung kinerja..."
              />
            </Stack>          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateModal(false)}>Batal</Button>
          <Button
            onClick={handleCreateTopic}
            variant="contained"
            disabled={createLoading}
            startIcon={createLoading && <CircularProgress size={16} />}
          >
            Buat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Topic Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Edit Topik
            <IconButton onClick={() => setShowEditModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {editTopic && (
            <Stack spacing={3}>
              <TextField
                label="Nama Topik"
                placeholder="Masukkan nama topik"
                value={editTopic.name}
                onChange={(e) => setEditTopic({ ...editTopic, name: e.target.value })}
                fullWidth
              />

              <TextField
                label="Instansi"
                placeholder="Masukkan nama instansi"
                value={editTopic.instansi || ''}
                onChange={(e) => setEditTopic({ ...editTopic, instansi: e.target.value })}
                fullWidth
              />

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Keywords
                </Typography>
                <KeywordInput
                  keywords={editTopic.keywords}
                  setKeywords={(keywords) => setEditTopic({ ...editTopic, keywords })}
                />
              </Box>

              <TextField
                label="Hashtag"
                placeholder="contoh: #topik1 #topik2"
                value={editTopic.hashtag || ''}
                onChange={(e) => setEditTopic({ ...editTopic, hashtag: e.target.value })}
                fullWidth
              />

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Monitoring
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editTopic.monitoring === 'Y'}
                      onChange={(e) =>
                        setEditTopic({
                          ...editTopic,
                          monitoring: e.target.checked ? 'Y' : 'N',
                        })
                      }
                    />
                  }
                  label={editTopic.monitoring === 'Y' ? 'ON' : 'OFF'}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Media Platform
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {mediaOptions
                    .map((media) => (
                      <FormControlLabel
                        key={media}
                        control={
                          <Checkbox
                            checked={editTopic.media.includes(media)}
                            onChange={() => handleEditCheckboxChange(media)}
                          />
                        }
                        label={media}
                      />
                    ))}
                </Box>
              </Box>

              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={600}>
                    Konteks Analisis Sentimen
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      generatingContext ? (
                        <CircularProgress size={14} />
                      ) : (
                        <Icon icon="solar:magic-stick-3-bold-duotone" />
                      )
                    }
                    onClick={() => handleGenerateContext('edit')}
                    disabled={generatingContext}
                  >
                    {generatingContext ? 'Generating...' : 'Generate Context'}
                  </Button>
                </Stack>
                <TextField
                  label="Konteks"
                  fullWidth
                  multiline
                  rows={5}
                  value={editTopic.context || ''}
                  onChange={(e) => setEditTopic({ ...editTopic, context: e.target.value })}
                  helperText="Konteks tentang topik/instansi yang digunakan AI untuk menentukan arah sentimen. Klik 'Generate Context' untuk membuat otomatis."
                  placeholder="Contoh: PT Danantara adalah lembaga investasi negara Indonesia... Sentimen positif jika masyarakat mendukung kinerja..."
                />
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Batal</Button>
          <Button
            onClick={handleEditTopic}
            variant="contained"
            disabled={updateLoading}
            startIcon={updateLoading && <CircularProgress size={16} />}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
