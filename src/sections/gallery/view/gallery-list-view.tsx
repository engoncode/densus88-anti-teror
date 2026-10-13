// src/sections/gallery/view/gallery-list-view.tsx
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
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
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
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';

import { Iconify } from 'src/components/iconify';
import galleryService, {
  type Gallery,
  type GalleryCategory,
  type GalleryImage,
} from 'src/services/galleryService';

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

// ----------------------------------------------------------------------

export function GalleryListView() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    gallery: Gallery | null;
  }>({ open: false, mode: 'create', gallery: null });

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; gallery: Gallery | null }>({
    open: false,
    gallery: null,
  });

  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    date: '',
    location: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<GalleryImage[]>([]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const loadGalleries = useCallback(async (page = 1, search = '', category: number | '' = '') => {
    try {
      setLoading(true);
      const response = await galleryService.getAll({
        page,
        search: search || undefined,
        category_id: category || undefined,
      });
      setGalleries(response.data.data);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Failed to load galleries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await galleryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useEffect(() => {
    loadGalleries();
    loadCategories();
  }, [loadGalleries, loadCategories]);

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setCurrentPage(1);
      loadGalleries(1, searchQuery, categoryFilter);
    }
  };

  const handleCategoryChange = (value: number | '') => {
    setCategoryFilter(value);
    setCurrentPage(1);
    loadGalleries(1, searchQuery, value);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    loadGalleries(page, searchQuery, categoryFilter);
  };

  const openCreateDialog = () => {
    setFormData({ title: '', description: '', category_id: '', date: '', location: '' });
    setImageFile(null);
    setImagePreview(null);
    setAdditionalImages([]);
    setAdditionalPreviews([]);
    setExistingImages([]);
    setFormDialog({ open: true, mode: 'create', gallery: null });
  };

  const openEditDialog = (gallery: Gallery) => {
    setFormData({
      title: gallery.title,
      description: gallery.description,
      category_id: String(gallery.category_id),
      date: formatDateForInput(gallery.date),
      location: gallery.location,
    });
    setImageFile(null);
    setImagePreview(gallery.image);
    setAdditionalImages([]);
    setAdditionalPreviews([]);
    setExistingImages(gallery.images || []);
    setFormDialog({ open: true, mode: 'edit', gallery });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setAdditionalImages((prev) => [...prev, ...newFiles]);
      setAdditionalPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (!formDialog.gallery) return;
    try {
      await galleryService.deleteImage(formDialog.gallery.id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      setSnackbar({ open: true, message: 'Image deleted successfully!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete image',
        severity: 'error',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category_id', formData.category_id);
      data.append('date', formData.date);
      data.append('location', formData.location);
      if (imageFile) {
        data.append('image', imageFile);
      }

      // Append additional images
      additionalImages.forEach((file) => {
        data.append('additional_images[]', file);
      });

      if (formDialog.mode === 'create') {
        await galleryService.create(data);
        setSnackbar({ open: true, message: 'Gallery created successfully!', severity: 'success' });
      } else if (formDialog.gallery) {
        await galleryService.update(formDialog.gallery.id, data);
        setSnackbar({ open: true, message: 'Gallery updated successfully!', severity: 'success' });
      }

      setFormDialog({ open: false, mode: 'create', gallery: null });
      loadGalleries(currentPage, searchQuery, categoryFilter);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save gallery',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.gallery) return;
    try {
      setSubmitting(true);
      await galleryService.delete(deleteDialog.gallery.id);
      setSnackbar({ open: true, message: 'Gallery deleted successfully!', severity: 'success' });
      setDeleteDialog({ open: false, gallery: null });
      loadGalleries(currentPage, searchQuery, categoryFilter);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete gallery',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Galleries Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={openCreateDialog}
        >
          New Gallery
        </Button>
      </Stack>

      {/* Search & Filter */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Search galleries..."
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
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => handleCategoryChange(e.target.value as number | '')}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
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
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Images</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : galleries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No galleries found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                galleries.map((gallery) => (
                  <TableRow key={gallery.id} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={gallery.image}
                        sx={{ width: 80, height: 60, borderRadius: 1, objectFit: 'cover' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{gallery.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={gallery.category?.name || '-'} size="small" />
                    </TableCell>
                    <TableCell>{gallery.location}</TableCell>
                    <TableCell>{new Date(gallery.date).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${(gallery.images?.length || 0) + 1}`}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => openEditDialog(gallery)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, gallery })}
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {formDialog.mode === 'create' ? 'Create Gallery' : 'Edit Gallery'}
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
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category_id}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Main Image {formDialog.mode === 'create' && '*'}
              </Typography>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  sx={{ mt: 1, width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 1 }}
                />
              )}
            </Box>

            {/* Additional Images */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Additional Images
              </Typography>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
              />

              {/* New images to upload */}
              {additionalPreviews.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: 'block' }}
                  >
                    New images to upload:
                  </Typography>
                  <ImageList cols={3} gap={8}>
                    {additionalPreviews.map((preview, index) => (
                      <ImageListItem key={index}>
                        <Box
                          component="img"
                          src={preview}
                          alt={`New image ${index + 1}`}
                          sx={{ height: 100, objectFit: 'cover', borderRadius: 1 }}
                        />
                        <ImageListItemBar
                          position="top"
                          sx={{ background: 'transparent' }}
                          actionIcon={
                            <IconButton
                              size="small"
                              sx={{ bgcolor: 'error.main', color: 'white', m: 0.5 }}
                              onClick={() => handleRemoveAdditionalImage(index)}
                            >
                              <Iconify icon="mingcute:close-line" width={16} />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {/* Existing images (edit mode) */}
              {formDialog.mode === 'edit' && existingImages.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: 'block' }}
                  >
                    Existing additional images:
                  </Typography>
                  <ImageList cols={3} gap={8}>
                    {existingImages.map((img) => (
                      <ImageListItem key={img.id}>
                        <Box
                          component="img"
                          src={img.image_url || ''}
                          alt={img.caption || `Image ${img.id}`}
                          sx={{ height: 100, objectFit: 'cover', borderRadius: 1 }}
                        />
                        <ImageListItemBar
                          position="top"
                          sx={{ background: 'transparent' }}
                          actionIcon={
                            <IconButton
                              size="small"
                              sx={{ bgcolor: 'error.main', color: 'white', m: 0.5 }}
                              onClick={() => handleDeleteExistingImage(img.id)}
                            >
                              <Iconify icon="mingcute:close-line" width={16} />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
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
        onClose={() => setDeleteDialog({ open: false, gallery: null })}
      >
        <DialogTitle>Delete Gallery</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteDialog.gallery?.title}&quot;? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, gallery: null })}>Cancel</Button>
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
