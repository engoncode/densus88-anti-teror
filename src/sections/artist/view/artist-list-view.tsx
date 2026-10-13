// src/sections/artist/view/artist-list-view.tsx
import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { ArtistProfile, CreateArtistWithUserData, UpdateArtistData } from 'src/types/artist';

import artistService from 'src/services/artistService';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const initialFormData: CreateArtistWithUserData = {
  name: '',
  email: '',
  password: '',
  bio: '',
  specialization: '',
  artist_category: '',
  artistic_statement: '',
  phone: '',
  address: '',
  city: '',
  country: 'Indonesia',
  website: '',
  instagram: '',
  facebook: '',
};

export function ArtistListView() {
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; artist: ArtistProfile | null }>({
    open: false,
    artist: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; artist: ArtistProfile | null }>(
    {
      open: false,
      artist: null,
    }
  );

  // Form state
  const [formData, setFormData] = useState<CreateArtistWithUserData>(initialFormData);
  const [editFormData, setEditFormData] = useState<UpdateArtistData>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadArtists = useCallback(async (page = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const response = await artistService.getAll({
        page,
        search: searchQuery || undefined,
      });

      // Handle PaginatedResponse structure
      const paginatedData = response.data;
      setArtists(paginatedData.data);
      setCurrentPage(paginatedData.current_page || 1);
      setTotalPages(paginatedData.last_page || 1);
    } catch (error) {
      console.error('Failed to load artists:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load artists',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArtists(currentPage, search);
  }, [loadArtists, currentPage, search]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setCreateDialog(true);
  };

  const handleCloseCreate = () => {
    setCreateDialog(false);
    setFormData(initialFormData);
    setShowPassword(false);
  };

  const handleOpenEdit = (artist: ArtistProfile) => {
    setEditFormData({
      name: artist.name,
      bio: artist.bio || '',
      specialization: artist.specialization || '',
      artist_category: artist.artist_category || '',
      artistic_statement: artist.artistic_statement || '',
      phone: artist.phone || '',
      address: artist.address || '',
      city: artist.city || '',
      country: artist.country || 'Indonesia',
      website: artist.website || '',
      instagram: artist.instagram || '',
      facebook: artist.facebook || '',
    });
    setEditDialog({ open: true, artist });
  };

  const handleCloseEdit = () => {
    setEditDialog({ open: false, artist: null });
    setEditFormData({});
  };

  const handleOpenDelete = (artist: ArtistProfile) => {
    setDeleteDialog({ open: true, artist });
  };

  const handleCloseDelete = () => {
    setDeleteDialog({ open: false, artist: null });
  };

  const handleCreateSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setSnackbar({
        open: true,
        message: 'Please fill in required fields (name, email, password)',
        severity: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      await artistService.createWithUser(formData);
      setSnackbar({
        open: true,
        message: 'Artist created successfully',
        severity: 'success',
      });
      handleCloseCreate();
      loadArtists(currentPage, search);
    } catch (error: unknown) {
      console.error('Failed to create artist:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Failed to create artist';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editDialog.artist) return;

    try {
      setSubmitting(true);
      await artistService.update(editDialog.artist.id, editFormData);
      setSnackbar({
        open: true,
        message: 'Artist updated successfully',
        severity: 'success',
      });
      handleCloseEdit();
      loadArtists(currentPage, search);
    } catch (error: unknown) {
      console.error('Failed to update artist:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Failed to update artist';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteDialog.artist) return;

    try {
      setSubmitting(true);
      await artistService.delete(deleteDialog.artist.id);
      setSnackbar({
        open: true,
        message: 'Artist deleted successfully',
        severity: 'success',
      });
      handleCloseDelete();
      loadArtists(currentPage, search);
    } catch (error: unknown) {
      console.error('Failed to delete artist:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Failed to delete artist';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Artists</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          Create Artist
        </Button>
      </Stack>

      <Card>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search artists..."
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : artists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No artists found
                  </TableCell>
                </TableRow>
              ) : (
                artists.map((artist) => (
                  <TableRow key={artist.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{artist.name}</Typography>
                    </TableCell>
                    <TableCell>{artist.user?.email || '-'}</TableCell>
                    <TableCell>{artist.specialization || '-'}</TableCell>
                    <TableCell>{artist.artist_category || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={artist.user_id ? 'User-linked' : 'Manual'}
                        color={artist.user_id ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(artist)}
                          title="Edit"
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDelete(artist)}
                          title="Delete"
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Create Artist Dialog */}
      <Dialog open={createDialog} onClose={handleCloseCreate} maxWidth="md" fullWidth>
        <DialogTitle>Create New Artist</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                Account Information
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, color: 'text.secondary' }}>
                Artist Profile
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Oil Painting, Sculpture"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Artist Category"
                value={formData.artist_category}
                onChange={(e) => setFormData({ ...formData, artist_category: e.target.value })}
                placeholder="e.g., Contemporary, Traditional"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Artistic Statement"
                value={formData.artistic_statement}
                onChange={(e) => setFormData({ ...formData, artistic_statement: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, color: 'text.secondary' }}>
                Location & Social
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@username"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Facebook"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCreateSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Artist'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Artist Dialog */}
      <Dialog open={editDialog.open} onClose={handleCloseEdit} maxWidth="md" fullWidth>
        <DialogTitle>Edit Artist</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Specialization"
                value={editFormData.specialization || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, specialization: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Artist Category"
                value={editFormData.artist_category || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, artist_category: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Bio"
                value={editFormData.bio || ''}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Artistic Statement"
                value={editFormData.artistic_statement || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, artistic_statement: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="City"
                value={editFormData.city || ''}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Country"
                value={editFormData.country || ''}
                onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Website"
                type="url"
                value={editFormData.website || ''}
                onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Instagram"
                value={editFormData.instagram || ''}
                onChange={(e) => setEditFormData({ ...editFormData, instagram: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Facebook"
                value={editFormData.facebook || ''}
                onChange={(e) => setEditFormData({ ...editFormData, facebook: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDelete} maxWidth="sm">
        <DialogTitle>Delete Artist</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog.artist?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. Artists with existing artworks cannot be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSubmit}
            variant="contained"
            color="error"
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
