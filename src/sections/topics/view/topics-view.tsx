import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { Icon } from '@iconify/react';

import topicsApi, { type Topic, type CreateTopicData } from 'src/services/topicsService';
import { workspacesApi, type Workspace } from 'src/services/apiService';
import { useAuth } from 'src/contexts/AuthContext';

// ----------------------------------------------------------------------

export function TopicsView() {
  const { isSuperAdmin, user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [filterMonitoring, setFilterMonitoring] = useState<'all' | 'Y' | 'N'>('all');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formData, setFormData] = useState<CreateTopicData>({
    name: '',
    keyword: '',
    hashtag: '',
    instansi: '',
    workspace_id: undefined,
    monitoring: 'Y',
    instagram: 'N',
    twitter: 'N',
    facebook: 'N',
    tiktok: 'N',
    youtube: 'N',
    instagram_interval: 60,
    twitter_interval: 60,
    facebook_interval: 60,
    tiktok_interval: 60,
    youtube_interval: 60,
    custom_prompt: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [topicsRes, workspacesRes] = await Promise.all([
        isSuperAdmin ? topicsApi.getAllTopics() : topicsApi.getAll(),
        workspacesApi.getAll(),
      ]);
      console.log('Topics Response:', topicsRes);
      console.log('Workspaces Response:', workspacesRes);

      // Handle nested response format: {data: {message, data: [...]}}
      const topicsData = (topicsRes.data as any)?.data || topicsRes.data;
      const workspacesData = workspacesRes.data;

      setTopics(Array.isArray(topicsData) ? topicsData : []);
      setWorkspaces(Array.isArray(workspacesData) ? workspacesData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setTopics([]);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDialog = (topic?: Topic) => {
    if (topic) {
      setEditTopic(topic);
      setFormData({
        name: topic.name,
        keyword: topic.keyword,
        hashtag: topic.hashtag,
        instansi: topic.instansi,
        workspace_id: topic.workspace_id,
        monitoring: topic.monitoring,
        instagram: topic.instagram,
        twitter: topic.twitter,
        facebook: topic.facebook,
        tiktok: topic.tiktok,
        youtube: topic.youtube,
        instagram_interval: topic.instagram_interval || 60,
        twitter_interval: topic.twitter_interval || 60,
        facebook_interval: topic.facebook_interval || 60,
        tiktok_interval: topic.tiktok_interval || 60,
        youtube_interval: topic.youtube_interval || 60,
        custom_prompt: topic.custom_prompt || '',
      });
    } else {
      setEditTopic(null);
      setFormData({
        name: '',
        keyword: '',
        hashtag: '',
        instansi: '',
        workspace_id: user?.workspace?.id,
        monitoring: 'Y',
        instagram: 'N',
        twitter: 'N',
        facebook: 'N',
        tiktok: 'N',
        youtube: 'N',
        instagram_interval: 60,
        twitter_interval: 60,
        facebook_interval: 60,
        tiktok_interval: 60,
        youtube_interval: 60,
        custom_prompt: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditTopic(null);
  };

  const showToast = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    try {
      if (editTopic) {
        await topicsApi.update(editTopic.id, formData);
        showToast('Topic updated successfully! 🎉', 'success');
      } else {
        await topicsApi.create(formData);
        showToast('Topic created successfully! 🎉', 'success');
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Failed to save topic:', error);
      showToast('Failed to save topic. Please try again.', 'error');
    }
  };

  const handleOpenDeleteDialog = (topic: Topic) => {
    setTopicToDelete(topic);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTopicToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!topicToDelete) return;

    try {
      await topicsApi.delete(topicToDelete.id);
      showToast('Topic deleted successfully! 🗑️', 'success');
      handleCloseDeleteDialog();
      loadData();
    } catch (error) {
      console.error('Failed to delete topic:', error);
      showToast('Failed to delete topic. Please try again.', 'error');
    }
  };

  const handleExecute = async (id: number) => {
    try {
      await topicsApi.execute(id);
      showToast('Topic execution started! 🚀', 'success');
      loadData();
    } catch (error) {
      console.error('Failed to execute topic:', error);
      showToast('Failed to execute topic. Please try again.', 'error');
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Topics Management</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="mingcute:add-line" />}
          onClick={() => handleOpenDialog()}
        >
          New Topic
        </Button>
      </Stack>

      {/* Filter Buttons */}
      <Stack direction="row" spacing={1} mb={3}>
        <Button
          variant={filterMonitoring === 'all' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setFilterMonitoring('all')}
        >
          All Topics
        </Button>
        <Button
          variant={filterMonitoring === 'Y' ? 'contained' : 'outlined'}
          size="small"
          color="success"
          startIcon={<Icon icon="solar:play-circle-bold" />}
          onClick={() => setFilterMonitoring('Y')}
        >
          Running
        </Button>
        <Button
          variant={filterMonitoring === 'N' ? 'contained' : 'outlined'}
          size="small"
          color="error"
          startIcon={<Icon icon="solar:stop-circle-bold" />}
          onClick={() => setFilterMonitoring('N')}
        >
          Stopped
        </Button>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Keywords</TableCell>
                <TableCell>Workspace</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Networks</TableCell>
                <TableCell>Last Processed</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                topics
                  .filter((topic) =>
                    filterMonitoring === 'all' ? true : topic.monitoring === filterMonitoring
                  )
                  .sort((a, b) => {
                    // Sort by workspace name alphabetically
                    const workspaceA = a.workspace?.name?.toLowerCase() || '';
                    const workspaceB = b.workspace?.name?.toLowerCase() || '';
                    return workspaceA.localeCompare(workspaceB);
                  })
                  .map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{topic.name}</Typography>
                        {topic.instansi && (
                          <Typography variant="caption" color="text.secondary">
                            {topic.instansi}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ display: 'block', maxWidth: 200 }}>
                          {topic.keyword ? topic.keyword.substring(0, 50) : '-'}
                          {topic.keyword && topic.keyword.length > 50 ? '...' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>{topic.workspace?.name || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={topic.monitoring === 'Y' ? 'Running' : 'Stopped'}
                          size="small"
                          color={topic.monitoring === 'Y' ? 'success' : 'default'}
                          icon={
                            <Icon
                              icon={
                                topic.monitoring === 'Y'
                                  ? 'solar:play-circle-bold'
                                  : 'solar:stop-circle-bold'
                              }
                            />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {topic.twitter === 'Y' && (
                            <Chip
                              size="small"
                              color="default"
                              icon={<Icon icon="ri:twitter-x-fill" />}
                              sx={{
                                '& .MuiChip-icon': {
                                  margin: 0,
                                },
                                paddingLeft: '8px',
                                paddingRight: '8px',
                              }}
                            />
                          )}
                          {topic.facebook === 'Y' && (
                            <Chip
                              size="small"
                              color="default"
                              icon={<Icon icon="bi:facebook" />}
                              sx={{
                                '& .MuiChip-icon': {
                                  margin: 0,
                                },
                                paddingLeft: '8px',
                                paddingRight: '8px',
                              }}
                            />
                          )}
                          {topic.instagram === 'Y' && (
                            <Chip
                              size="small"
                              color="default"
                              icon={<Icon icon="bi:instagram" />}
                              sx={{
                                '& .MuiChip-icon': {
                                  margin: 0,
                                },
                                paddingLeft: '8px',
                                paddingRight: '8px',
                              }}
                            />
                          )}
                          {topic.tiktok === 'Y' && (
                            <Chip
                              size="small"
                              color="default"
                              icon={<Icon icon="ic:baseline-tiktok" />}
                              sx={{
                                '& .MuiChip-icon': {
                                  margin: 0,
                                },
                                paddingLeft: '8px',
                                paddingRight: '8px',
                              }}
                            />
                          )}
                          {topic.youtube === 'Y' && (
                            <Chip
                              size="small"
                              color="default"
                              icon={<Icon icon="bi:youtube" />}
                              sx={{
                                '& .MuiChip-icon': {
                                  margin: 0,
                                },
                                paddingLeft: '8px',
                                paddingRight: '8px',
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {topic.last_processed_at
                          ? new Date(topic.last_processed_at).toLocaleString()
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenDialog(topic)}>
                          <Icon icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(topic)}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editTopic ? 'Edit Topic' : 'Create New Topic'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Topic Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Keywords"
              fullWidth
              multiline
              rows={2}
              value={formData.keyword}
              onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
              helperText="e.g., keyword1 or keyword2 or keyword3"
            />
            <TextField
              label="Hashtags"
              fullWidth
              value={formData.hashtag}
              onChange={(e) => setFormData({ ...formData, hashtag: e.target.value })}
              helperText="e.g., #hashtag1 #hashtag2"
            />
            <TextField
              label="Institution"
              fullWidth
              value={formData.instansi}
              onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
            />
            {(isSuperAdmin || user?.role.name === 'Analyst') && (
              <FormControl fullWidth>
                <InputLabel>Workspace</InputLabel>
                <Select
                  value={formData.workspace_id || ''}
                  label="Workspace"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workspace_id: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                >
                  {workspaces.map((workspace) => (
                    <MenuItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Monitoring Status</InputLabel>
              <Select
                value={formData.monitoring}
                label="Monitoring Status"
                onChange={(e) =>
                  setFormData({ ...formData, monitoring: e.target.value as 'Y' | 'N' })
                }
              >
                <MenuItem value="Y">Running</MenuItem>
                <MenuItem value="N">Stopped</MenuItem>
              </Select>
            </FormControl>

            <Stack spacing={2}>
              <Typography variant="subtitle2">Enable Networks:</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.twitter === 'Y'}
                      onChange={(e) =>
                        setFormData({ ...formData, twitter: e.target.checked ? 'Y' : 'N' })
                      }
                    />
                  }
                  label="Twitter/X"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.facebook === 'Y'}
                      onChange={(e) =>
                        setFormData({ ...formData, facebook: e.target.checked ? 'Y' : 'N' })
                      }
                    />
                  }
                  label="Facebook"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.instagram === 'Y'}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.checked ? 'Y' : 'N' })
                      }
                    />
                  }
                  label="Instagram"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.tiktok === 'Y'}
                      onChange={(e) =>
                        setFormData({ ...formData, tiktok: e.target.checked ? 'Y' : 'N' })
                      }
                    />
                  }
                  label="TikTok"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.youtube === 'Y'}
                      onChange={(e) =>
                        setFormData({ ...formData, youtube: e.target.checked ? 'Y' : 'N' })
                      }
                    />
                  }
                  label="YouTube"
                />
              </Stack>
            </Stack>

            <Stack spacing={2} sx={{ mt: 10, pt: 2 }}>
              <Typography variant="subtitle2">Scraping Intervals (minutes):</Typography>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  overflowX: 'auto',
                  pb: 1,
                  pt: 1,
                  width: '100%',
                  '&::-webkit-scrollbar': {
                    height: 6,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,.2)',
                    borderRadius: 3,
                  },
                }}
              >
                <TextField
                  label="Instagram"
                  type="number"
                  size="small"
                  value={formData.instagram_interval || 60}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram_interval: Number(e.target.value) })
                  }
                  disabled={formData.instagram === 'N'}
                  sx={{ minWidth: 180, flexShrink: 0 }}
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <TextField
                  label="Twitter"
                  type="number"
                  size="small"
                  value={formData.twitter_interval || 60}
                  onChange={(e) =>
                    setFormData({ ...formData, twitter_interval: Number(e.target.value) })
                  }
                  disabled={formData.twitter === 'N'}
                  sx={{ minWidth: 180, flexShrink: 0 }}
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <TextField
                  label="Facebook"
                  type="number"
                  size="small"
                  value={formData.facebook_interval || 60}
                  onChange={(e) =>
                    setFormData({ ...formData, facebook_interval: Number(e.target.value) })
                  }
                  disabled={formData.facebook === 'N'}
                  sx={{ minWidth: 180, flexShrink: 0 }}
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <TextField
                  label="TikTok"
                  type="number"
                  size="small"
                  value={formData.tiktok_interval || 60}
                  onChange={(e) =>
                    setFormData({ ...formData, tiktok_interval: Number(e.target.value) })
                  }
                  disabled={formData.tiktok === 'N'}
                  sx={{ minWidth: 180, flexShrink: 0 }}
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <TextField
                  label="YouTube"
                  type="number"
                  size="small"
                  value={formData.youtube_interval || 60}
                  onChange={(e) =>
                    setFormData({ ...formData, youtube_interval: Number(e.target.value) })
                  }
                  disabled={formData.youtube === 'N'}
                  sx={{ minWidth: 180, flexShrink: 0 }}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Stack>
            </Stack>

            {(isSuperAdmin || user?.role.name === 'Analyst') && (
              <TextField
                label="Custom AI Prompt"
                fullWidth
                multiline
                rows={4}
                value={formData.custom_prompt || ''}
                onChange={(e) => setFormData({ ...formData, custom_prompt: e.target.value })}
                helperText="Custom prompt for AI sentiment analysis (SuperAdmin & Analyst only)"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editTopic ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon="solar:trash-bin-trash-bold-duotone" width={28} color="#ff5252" />
          Delete Topic?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{topicToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All data related to this topic will be permanently
            removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
