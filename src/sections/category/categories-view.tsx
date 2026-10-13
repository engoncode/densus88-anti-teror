import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import { Icon } from '@iconify/react';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  categoryService,
  ArtworkCategory,
  Medium,
  GalleryCategory,
  CategoryStatistics,
} from '../../services/categoryService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CategoriesView() {
  const [tabValue, setTabValue] = useState(0);
  const [statistics, setStatistics] = useState<CategoryStatistics | null>(null);

  // Artwork Categories
  const [artworkCategories, setArtworkCategories] = useState<ArtworkCategory[]>([]);
  const [artworkCategoryDialog, setArtworkCategoryDialog] = useState<{
    open: boolean;
    item?: ArtworkCategory;
  }>({ open: false });
  const [artworkCategoryName, setArtworkCategoryName] = useState('');

  // Mediums
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [mediumDialog, setMediumDialog] = useState<{ open: boolean; item?: Medium }>({
    open: false,
  });
  const [mediumName, setMediumName] = useState('');

  // Gallery Categories
  const [galleryCategories, setGalleryCategories] = useState<GalleryCategory[]>([]);
  const [galleryCategoryDialog, setGalleryCategoryDialog] = useState<{
    open: boolean;
    item?: GalleryCategory;
  }>({ open: false });
  const [galleryCategoryName, setGalleryCategoryName] = useState('');
  const [galleryCategoryDesc, setGalleryCategoryDesc] = useState('');

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; item: any }>({
    open: false,
    type: '',
    item: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [stats, categories, meds, galCats] = await Promise.all([
        categoryService.getStatistics(),
        categoryService.getArtworkCategories(),
        categoryService.getMediums(),
        categoryService.getGalleryCategories(),
      ]);
      setStatistics(stats);
      setArtworkCategories(categories);
      setMediums(meds);
      setGalleryCategories(galCats);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== ARTWORK CATEGORIES ====================
  const handleOpenArtworkCategoryDialog = (item?: ArtworkCategory) => {
    setArtworkCategoryName(item?.name || '');
    setArtworkCategoryDialog({ open: true, item });
  };

  const handleSaveArtworkCategory = async () => {
    try {
      if (artworkCategoryDialog.item) {
        await categoryService.updateArtworkCategory(
          artworkCategoryDialog.item.id,
          artworkCategoryName
        );
      } else {
        await categoryService.createArtworkCategory(artworkCategoryName);
      }
      setArtworkCategoryDialog({ open: false });
      fetchAll();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  // ==================== MEDIUMS ====================
  const handleOpenMediumDialog = (item?: Medium) => {
    setMediumName(item?.name || '');
    setMediumDialog({ open: true, item });
  };

  const handleSaveMedium = async () => {
    try {
      if (mediumDialog.item) {
        await categoryService.updateMedium(mediumDialog.item.id, mediumName);
      } else {
        await categoryService.createMedium(mediumName);
      }
      setMediumDialog({ open: false });
      fetchAll();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save medium');
    }
  };

  // ==================== GALLERY CATEGORIES ====================
  const handleOpenGalleryCategoryDialog = (item?: GalleryCategory) => {
    setGalleryCategoryName(item?.name || '');
    setGalleryCategoryDesc(item?.description || '');
    setGalleryCategoryDialog({ open: true, item });
  };

  const handleSaveGalleryCategory = async () => {
    try {
      const data = { name: galleryCategoryName, description: galleryCategoryDesc || undefined };
      if (galleryCategoryDialog.item) {
        await categoryService.updateGalleryCategory(galleryCategoryDialog.item.id, data);
      } else {
        await categoryService.createGalleryCategory(data);
      }
      setGalleryCategoryDialog({ open: false });
      fetchAll();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save gallery category');
    }
  };

  // ==================== DELETE ====================
  const handleDelete = async () => {
    try {
      const { type, item } = deleteDialog;
      if (type === 'artwork') {
        await categoryService.deleteArtworkCategory(item.id);
      } else if (type === 'medium') {
        await categoryService.deleteMedium(item.id);
      } else if (type === 'gallery') {
        await categoryService.deleteGalleryCategory(item.id);
      }
      setDeleteDialog({ open: false, type: '', item: null });
      fetchAll();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
      setDeleteDialog({ open: false, type: '', item: null });
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Category Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Artwork Categories
            </Typography>
            <Typography variant="h4">{statistics.artwork_categories}</Typography>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Mediums
            </Typography>
            <Typography variant="h4">{statistics.mediums}</Typography>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Gallery Categories
            </Typography>
            <Typography variant="h4">{statistics.gallery_categories}</Typography>
          </Card>
        </Box>
      )}

      <Card>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Artwork Categories" />
          <Tab label="Mediums" />
          <Tab label="Gallery Categories" />
        </Tabs>

        {/* Artwork Categories Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Icon icon="solar:add-circle-bold" />}
              onClick={() => handleOpenArtworkCategoryDialog()}
            >
              Add Category
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Artists</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : artworkCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  artworkCategories.map((cat) => (
                    <TableRow key={cat.id} hover>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>
                        <Chip label={cat.slug} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{cat.artists_count || 0}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenArtworkCategoryDialog(cat)}
                          >
                            <Icon icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setDeleteDialog({ open: true, type: 'artwork', item: cat })
                            }
                          >
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Mediums Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Icon icon="solar:add-circle-bold" />}
              onClick={() => handleOpenMediumDialog()}
            >
              Add Medium
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Artworks</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : mediums.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No mediums found
                    </TableCell>
                  </TableRow>
                ) : (
                  mediums.map((med) => (
                    <TableRow key={med.id} hover>
                      <TableCell>{med.name}</TableCell>
                      <TableCell>
                        <Chip label={med.slug} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{med.artworks_count || 0}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenMediumDialog(med)}>
                            <Icon icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setDeleteDialog({ open: true, type: 'medium', item: med })
                            }
                          >
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Gallery Categories Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Icon icon="solar:add-circle-bold" />}
              onClick={() => handleOpenGalleryCategoryDialog()}
            >
              Add Gallery Category
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Galleries</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : galleryCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No gallery categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  galleryCategories.map((cat) => (
                    <TableRow key={cat.id} hover>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>
                        <Chip label={cat.slug} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {cat.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{cat.galleries_count || 0}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenGalleryCategoryDialog(cat)}
                          >
                            <Icon icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setDeleteDialog({ open: true, type: 'gallery', item: cat })
                            }
                          >
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Artwork Category Dialog */}
      <Dialog
        open={artworkCategoryDialog.open}
        onClose={() => setArtworkCategoryDialog({ open: false })}
      >
        <DialogTitle>{artworkCategoryDialog.item ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={artworkCategoryName}
            onChange={(e) => setArtworkCategoryName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArtworkCategoryDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleSaveArtworkCategory} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Medium Dialog */}
      <Dialog open={mediumDialog.open} onClose={() => setMediumDialog({ open: false })}>
        <DialogTitle>{mediumDialog.item ? 'Edit Medium' : 'Add Medium'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Medium Name"
            value={mediumName}
            onChange={(e) => setMediumName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMediumDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleSaveMedium} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gallery Category Dialog */}
      <Dialog
        open={galleryCategoryDialog.open}
        onClose={() => setGalleryCategoryDialog({ open: false })}
      >
        <DialogTitle>
          {galleryCategoryDialog.item ? 'Edit Gallery Category' : 'Add Gallery Category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 400 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={galleryCategoryName}
              onChange={(e) => setGalleryCategoryName(e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description (optional)"
              value={galleryCategoryDesc}
              onChange={(e) => setGalleryCategoryDesc(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGalleryCategoryDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleSaveGalleryCategory} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: '', item: null })}
      >
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.item?.name}"? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: '', item: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
