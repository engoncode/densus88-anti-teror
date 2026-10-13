// src/sections/exhibition/view/exhibition-list-view.tsx
import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';
import exhibitionService, {
  type Exhibition,
  type ExhibitionArtwork,
} from 'src/services/exhibitionService';

// Helper to format date for input[type="date"]
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// Helper to calculate status based on dates
const calculateStatusFromDates = (startDate: string, endDate: string): string => {
  if (!startDate) return 'upcoming';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  if (start > today) {
    return 'upcoming';
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    if (end < today) {
      return 'past';
    }
  }

  return 'ongoing';
};

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'past', label: 'Past' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'event', label: 'Event' },
  { value: 'workshop', label: 'Workshop' },
];

export function ExhibitionListView() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  // Available artworks for selection
  const [availableArtworks, setAvailableArtworks] = useState<ExhibitionArtwork[]>([]);
  const [artworksLoading, setArtworksLoading] = useState(false);
  const [selectedArtworks, setSelectedArtworks] = useState<ExhibitionArtwork[]>([]);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    exhibition: Exhibition | null;
  }>({ open: false, mode: 'create', exhibition: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    exhibition: Exhibition | null;
  }>({
    open: false,
    exhibition: null,
  });

  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    address: '',
    curator_name: '',
    curator_bio: '',
    type: 'exhibition',
    status: 'upcoming',
    is_featured: false,
    is_active: true,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const loadExhibitions = useCallback(async (page = 1, search = '', status = '', type = '') => {
    try {
      setLoading(true);
      const response = await exhibitionService.getAll({
        page,
        search: search || undefined,
        status: status || undefined,
        type: type || undefined,
      });
      setExhibitions(response.data.data);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Failed to load exhibitions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAvailableArtworks = useCallback(async (search = '') => {
    try {
      setArtworksLoading(true);
      const response = await exhibitionService.getAllArtworks({
        search: search || undefined,
        per_page: 100,
      });
      setAvailableArtworks(response.data.data || []);
    } catch (error) {
      console.error('Failed to load artworks:', error);
    } finally {
      setArtworksLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExhibitions();
    loadAvailableArtworks();
  }, [loadExhibitions, loadAvailableArtworks]);

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setCurrentPage(1);
      loadExhibitions(1, searchQuery, statusFilter, typeFilter);
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    loadExhibitions(1, searchQuery, value, typeFilter);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
    loadExhibitions(1, searchQuery, statusFilter, value);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    loadExhibitions(page, searchQuery, statusFilter, typeFilter);
  };

  const openCreateDialog = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      location: '',
      address: '',
      curator_name: '',
      curator_bio: '',
      type: 'exhibition',
      status: 'upcoming',
      is_featured: false,
      is_active: true,
    });
    setCoverImage(null);
    setCoverPreview(null);
    setSelectedArtworks([]);
    setFormDialog({ open: true, mode: 'create', exhibition: null });
  };

  const openEditDialog = async (exhibition: Exhibition) => {
    setFormData({
      title: exhibition.title,
      description: exhibition.description,
      start_date: formatDateForInput(exhibition.start_date),
      end_date: formatDateForInput(exhibition.end_date),
      location: exhibition.location,
      address: exhibition.address || '',
      curator_name: exhibition.curator_name || '',
      curator_bio: exhibition.curator_bio || '',
      type: exhibition.type,
      status: exhibition.status,
      is_featured: exhibition.is_featured,
      is_active: exhibition.is_active,
    });
    setCoverImage(null);
    setCoverPreview(exhibition.cover_image);

    // Load full exhibition with artworks
    try {
      const fullExhibition = await exhibitionService.getById(exhibition.id);
      setSelectedArtworks(fullExhibition.artworks || []);
    } catch (error) {
      console.error('Failed to load exhibition details:', error);
      setSelectedArtworks([]);
    }

    setFormDialog({ open: true, mode: 'edit', exhibition });
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null) {
          data.append(key, String(value));
        }
      });
      if (coverImage) {
        data.append('cover_image', coverImage);
      }

      let exhibitionId: number;

      if (formDialog.mode === 'create') {
        const created = await exhibitionService.create(data);
        exhibitionId = created.id;

        // Add artworks if selected
        if (selectedArtworks.length > 0) {
          await exhibitionService.addArtworks(
            exhibitionId,
            selectedArtworks.map((artwork, index) => ({
              artwork_id: artwork.id,
              display_order: index + 1,
            }))
          );
        }

        setSnackbar({
          open: true,
          message: 'Exhibition created successfully!',
          severity: 'success',
        });
      } else if (formDialog.exhibition) {
        exhibitionId = formDialog.exhibition.id;
        await exhibitionService.update(exhibitionId, data);

        // Get current artworks to compare
        const currentExhibition = await exhibitionService.getById(exhibitionId);
        const currentArtworkIds = (currentExhibition.artworks || []).map((a) => a.id);
        const newArtworkIds = selectedArtworks.map((a) => a.id);

        // Remove artworks that are no longer selected
        for (const artworkId of currentArtworkIds) {
          if (!newArtworkIds.includes(artworkId)) {
            await exhibitionService.removeArtwork(exhibitionId, artworkId);
          }
        }

        // Add new artworks
        const artworksToAdd = selectedArtworks.filter((a) => !currentArtworkIds.includes(a.id));
        if (artworksToAdd.length > 0) {
          await exhibitionService.addArtworks(
            exhibitionId,
            artworksToAdd.map((artwork, index) => ({
              artwork_id: artwork.id,
              display_order: currentArtworkIds.length + index + 1,
            }))
          );
        }

        setSnackbar({
          open: true,
          message: 'Exhibition updated successfully!',
          severity: 'success',
        });
      }

      setFormDialog({ open: false, mode: 'create', exhibition: null });
      loadExhibitions(currentPage, searchQuery, statusFilter, typeFilter);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save exhibition',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.exhibition) return;
    try {
      setSubmitting(true);
      await exhibitionService.delete(deleteDialog.exhibition.id);
      setSnackbar({ open: true, message: 'Exhibition deleted successfully!', severity: 'success' });
      setDeleteDialog({ open: false, exhibition: null });
      loadExhibitions(currentPage, searchQuery, statusFilter, typeFilter);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete exhibition',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'ongoing':
        return 'success';
      case 'past':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exhibition':
        return 'primary';
      case 'event':
        return 'secondary';
      case 'workshop':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Exhibitions Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={openCreateDialog}
        >
          New Exhibition
        </Button>
      </Stack>

      {/* Search & Filter */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Search exhibitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cover</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Artworks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : exhibitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No exhibitions found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                exhibitions.map((exhibition) => (
                  <TableRow key={exhibition.id} hover>
                    <TableCell>
                      {exhibition.cover_image ? (
                        <Box
                          component="img"
                          src={exhibition.cover_image}
                          sx={{ width: 80, height: 60, borderRadius: 1, objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 80,
                            height: 60,
                            borderRadius: 1,
                            bgcolor: 'grey.200',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify icon="solar:palette-bold" sx={{ color: 'grey.500' }} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{exhibition.title}</Typography>
                      {exhibition.is_featured && (
                        <Chip label="Featured" size="small" color="warning" sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={exhibition.type}
                        size="small"
                        color={getTypeColor(exhibition.type) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={exhibition.status}
                        size="small"
                        color={getStatusColor(exhibition.status) as any}
                      />
                    </TableCell>
                    <TableCell>{exhibition.location}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(exhibition.start_date).toLocaleDateString()}
                      </Typography>
                      {exhibition.end_date && (
                        <Typography variant="caption" color="text.secondary">
                          to {new Date(exhibition.end_date).toLocaleDateString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{exhibition.artworks_count || 0}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => openEditDialog(exhibition)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, exhibition })}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
          </Box>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={formDialog.open}
        onClose={() => setFormDialog({ ...formDialog, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {formDialog.mode === 'create' ? 'Create Exhibition' : 'Edit Exhibition'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              required
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="exhibition">Exhibition</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                  <MenuItem value="workshop">Workshop</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Status"
                value={formData.status}
                disabled
                helperText="Status otomatis berdasarkan tanggal"
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  const newStatus = calculateStatusFromDates(newStartDate, formData.end_date);
                  setFormData({ ...formData, start_date: newStartDate, status: newStatus });
                }}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.end_date}
                onChange={(e) => {
                  const newEndDate = e.target.value;
                  const newStatus = calculateStatusFromDates(formData.start_date, newEndDate);
                  setFormData({ ...formData, end_date: newEndDate, status: newStatus });
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Curator Name"
                value={formData.curator_name}
                onChange={(e) => setFormData({ ...formData, curator_name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Curator Bio"
                value={formData.curator_bio}
                onChange={(e) => setFormData({ ...formData, curator_bio: e.target.value })}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                }
                label="Featured"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Stack>

            {/* Artworks Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Artworks
              </Typography>
              <Autocomplete
                multiple
                options={availableArtworks}
                value={selectedArtworks}
                onChange={(_event, newValue) => setSelectedArtworks(newValue)}
                getOptionLabel={(option) => option.title}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={artworksLoading}
                disableCloseOnSelect
                renderOption={(props, option, { selected }) => {
                  const imageUrl =
                    option.image ||
                    option.images?.find((img) => img.is_main)?.path ||
                    option.images?.[0]?.path;
                  return (
                    <li {...props} key={option.id}>
                      <Checkbox checked={selected} sx={{ mr: 1 }} />
                      <Avatar
                        src={imageUrl}
                        variant="rounded"
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                      <ListItemText
                        primary={option.title}
                        secondary={option.artist?.name || 'Unknown Artist'}
                      />
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search and select artworks..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {artworksLoading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => {
                    const imageUrl =
                      option.image ||
                      option.images?.find((img) => img.is_main)?.path ||
                      option.images?.[0]?.path;
                    return (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        avatar={<Avatar src={imageUrl} />}
                        label={option.title}
                        size="small"
                      />
                    );
                  })
                }
              />
              {selectedArtworks.length > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  {selectedArtworks.length} artwork(s) selected
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Cover Image
              </Typography>
              <input type="file" accept="image/*" onChange={handleCoverChange} />
              {coverPreview && (
                <Box
                  component="img"
                  src={coverPreview}
                  sx={{ mt: 1, width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 1 }}
                />
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialog({ ...formDialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <CircularProgress size={20} />
            ) : formDialog.mode === 'create' ? (
              'Create'
            ) : (
              'Save'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, exhibition: null })}
      >
        <DialogTitle>Delete Exhibition</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteDialog.exhibition?.title}&quot;? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, exhibition: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
