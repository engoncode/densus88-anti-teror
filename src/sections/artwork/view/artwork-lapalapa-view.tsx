// src/sections/artwork/view/artwork-lapalapa-view.tsx
import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Pagination from '@mui/material/Pagination';

import { Iconify } from 'src/components/iconify';
import type { Artwork, Category, Medium } from 'src/types/artwork';
import type { ArtistProfile } from 'src/types/artist';
import artworkService from 'src/services/artworkService';
import artistService from 'src/services/artistService';

// Helper function to format currency
const formatRupiah = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return numValue.toLocaleString('id-ID');
};

// ----------------------------------------------------------------------

export function ArtworkLapalapaView() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    artwork: Artwork | null;
  }>({
    open: false,
    mode: 'create',
    artwork: null,
  });

  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);

  const [formData, setFormData] = useState({
    artist_id: 0,
    title: '',
    description: '',
    category_id: 0,
    medium_id: 0,
    price: 0,
    stock: 1,
    year_created: new Date().getFullYear(),
    orientation: 'portrait' as 'portrait' | 'landscape' | 'square',
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    is_for_sale: true,
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [priceDisplay, setPriceDisplay] = useState<string>('0');

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    artwork: Artwork | null;
  }>({
    open: false,
    artwork: null,
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filter states
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  const [filterMedium, setFilterMedium] = useState<Medium | null>(null);
  const [filterArtist, setFilterArtist] = useState<ArtistProfile | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadArtworks = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await artworkService.getAll({ vendor_type: 'lapalapa', page });
      setArtworks(response.data.data);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || response.data.data.length);
    } catch (error) {
      console.error('Failed to load artworks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFormData = useCallback(async () => {
    try {
      const [artistsData, categoriesData, mediumsData] = await Promise.all([
        artistService.getAll(),
        artworkService.getCategories(),
        artworkService.getMediums(),
      ]);
      setArtists(artistsData.data.data);
      setCategories(categoriesData);
      setMediums(mediumsData);
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  }, []);

  useEffect(() => {
    loadArtworks();
    loadFormData();
  }, [loadArtworks, loadFormData]);

  // Auto-format price display when formData.price changes
  useEffect(() => {
    if (formDialog.open && formDialog.mode === 'edit' && formData.price > 0) {
      setPriceDisplay(formatRupiah(formData.price));
    }
  }, [formData.price, formDialog.open, formDialog.mode]);

  const handleOpenCreate = () => {
    setPriceDisplay('0');
    setFormData({
      artist_id: 0,
      title: '',
      description: '',
      category_id: 0,
      medium_id: 0,
      price: 0,
      stock: 1,
      year_created: new Date().getFullYear(),
      orientation: 'portrait',
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      is_for_sale: true,
    });
    setMainImage(null);
    setAdditionalImages([]);
    setImagePreview('');
    setAdditionalImagePreviews([]);
    setFormDialog({ open: true, mode: 'create', artwork: null });
  };

  const handleEdit = (artwork: Artwork) => {
    const priceNum = typeof artwork.price === 'string' ? parseFloat(artwork.price) : artwork.price;
    setPriceDisplay(formatRupiah(priceNum));
    setFormData({
      artist_id: artwork.artist_id,
      title: artwork.title,
      description: artwork.description || '',
      category_id: artwork.category_id,
      medium_id: artwork.medium_id,
      price: priceNum,
      stock: artwork.stock,
      year_created: artwork.year_created || new Date().getFullYear(),
      orientation: artwork.orientation || 'portrait',
      length: artwork.length || 0,
      width: artwork.width || 0,
      height: artwork.height || 0,
      weight: typeof artwork.weight === 'string' ? parseFloat(artwork.weight) : artwork.weight,
      is_for_sale: artwork.is_for_sale,
    });
    setMainImage(null);
    setAdditionalImages([]);
    setImagePreview('');
    setAdditionalImagePreviews([]);
    setFormDialog({ open: true, mode: 'edit', artwork });
  };

  const handleCloseDialog = () => {
    setFormDialog({ open: false, mode: 'create', artwork: null });
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdditionalImages(files);

    // Generate preview URLs
    const previews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setAdditionalImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    try {
      if (formDialog.mode === 'create') {
        if (!mainImage) {
          setSnackbar({
            open: true,
            message: 'Main image is required',
            severity: 'error',
          });
          return;
        }

        const createData: any = {
          ...formData,
          main_image: mainImage,
          additional_images: additionalImages,
        };

        await artworkService.create(createData);
        setSnackbar({
          open: true,
          message: 'Artwork created successfully!',
          severity: 'success',
        });
      } else {
        // Update basic info
        await artworkService.update(formDialog.artwork!.id, formData);

        // Upload new main image if provided
        if (mainImage) {
          await artworkService.uploadImage(formDialog.artwork!.id, mainImage, true);
        }

        // Upload additional images if provided
        if (additionalImages.length > 0) {
          for (const img of additionalImages) {
            await artworkService.uploadImage(formDialog.artwork!.id, img, false);
          }
        }

        setSnackbar({
          open: true,
          message: 'Artwork updated successfully!',
          severity: 'success',
        });
      }

      await loadArtworks();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Failed to save artwork:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save artwork',
        severity: 'error',
      });
    }
  };

  const getImageUrl = (artwork: Artwork) => {
    // Use main image from artworks.image field
    if (artwork.image) {
      return artwork.image?.startsWith('http')
        ? artwork.image
        : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${artwork.image}`;
    }
    return '/assets/images/cover/cover-1.jpg';
  };

  const canEdit = (artwork: Artwork) => {
    // Can edit if stock > 0 (not sold out)
    return artwork.stock > 0;
  };

  const handleDeleteClick = (artwork: Artwork) => {
    setDeleteDialog({ open: true, artwork });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.artwork) return;

    try {
      await artworkService.delete(deleteDialog.artwork.id);
      await loadArtworks();
      setSnackbar({
        open: true,
        message: 'Artwork deleted successfully!',
        severity: 'success',
      });
      setDeleteDialog({ open: false, artwork: null });
    } catch (error: any) {
      console.error('Failed to delete artwork:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete artwork',
        severity: 'error',
      });
    }
  };

  // Filter artworks based on selected filters
  const filteredArtworks = artworks.filter((artwork) => {
    if (filterCategory && artwork.category_id !== filterCategory.id) return false;
    if (filterMedium && artwork.medium_id !== filterMedium.id) return false;
    if (filterArtist && artwork.artist_id !== filterArtist.id) return false;
    return true;
  });

  // Clear all filters
  const handleClearFilters = () => {
    setFilterCategory(null);
    setFilterMedium(null);
    setFilterArtist(null);
  };

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    loadArtworks(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Image with loading skeleton component
  const ImageWithSkeleton = ({ src, alt }: { src: string; alt: string }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
      <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
        {!imageLoaded && !imageError && (
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        )}
        <CardMedia
          component="img"
          height="300"
          image={imageError ? '/assets/images/cover/cover-1.jpg' : src}
          alt={alt}
          sx={{
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
      </Box>
    );
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">LaPalapa Artworks Gallery</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon={'solar:gallery-add-bold' as any} />}
          onClick={handleOpenCreate}
        >
          Add Artwork
        </Button>
      </Stack>

      {/* Filter Section */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Iconify icon={'solar:filter-bold' as any} width={20} />
          <Typography variant="subtitle1">Filter Artworks</Typography>
        </Stack>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              size="small"
              options={categories}
              getOptionLabel={(option) => option.name}
              value={filterCategory}
              onChange={(_, value) => setFilterCategory(value)}
              renderInput={(params) => (
                <TextField {...params} label="Category" placeholder="All Categories" />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              size="small"
              options={mediums}
              getOptionLabel={(option) => option.name}
              value={filterMedium}
              onChange={(_, value) => setFilterMedium(value)}
              renderInput={(params) => (
                <TextField {...params} label="Medium" placeholder="All Mediums" />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              size="small"
              options={artists}
              getOptionLabel={(option) => option.name}
              value={filterArtist}
              onChange={(_, value) => setFilterArtist(value)}
              renderInput={(params) => (
                <TextField {...params} label="Artist" placeholder="All Artists" />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleClearFilters}
              startIcon={<Iconify icon={'solar:refresh-bold' as any} />}
              disabled={!filterCategory && !filterMedium && !filterArtist}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
        {(filterCategory || filterMedium || filterArtist) && (
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Active filters:
            </Typography>
            {filterCategory && (
              <Chip
                label={`Category: ${filterCategory.name}`}
                size="small"
                onDelete={() => setFilterCategory(null)}
              />
            )}
            {filterMedium && (
              <Chip
                label={`Medium: ${filterMedium.name}`}
                size="small"
                onDelete={() => setFilterMedium(null)}
              />
            )}
            {filterArtist && (
              <Chip
                label={`Artist: ${filterArtist.name}`}
                size="small"
                onDelete={() => setFilterArtist(null)}
              />
            )}
          </Stack>
        )}
      </Card>

      {/* Results count */}
      {!loading && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {filteredArtworks.length} of {artworks.length} artworks
        </Typography>
      )}

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid key={item} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card>
                <Skeleton variant="rectangular" height={300} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : artworks.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center" color="text.secondary">
              No artworks found
            </Typography>
          </CardContent>
        </Card>
      ) : filteredArtworks.length === 0 ? (
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={2} py={4}>
              <Iconify
                icon={'solar:gallery-remove-bold' as any}
                width={64}
                sx={{ color: 'text.disabled' }}
              />
              <Typography align="center" color="text.secondary">
                No artworks match the selected filters
              </Typography>
              <Button variant="outlined" size="small" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredArtworks.map((artwork) => (
            <Grid key={artwork.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <ImageWithSkeleton src={getImageUrl(artwork)} alt={artwork.title} />
                  {canEdit(artwork) && (
                    <>
                      <IconButton
                        onClick={() => handleEdit(artwork)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'background.paper' },
                          boxShadow: 2,
                        }}
                      >
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(artwork)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 56,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' },
                          boxShadow: 2,
                        }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </>
                  )}
                  <Chip
                    label={artwork.status}
                    size="small"
                    color={artwork.status === 'active' ? 'success' : 'default'}
                    sx={{ position: 'absolute', top: 8, left: 8 }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2" noWrap>
                    {artwork.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    by {artwork.artist?.name || 'Unknown Artist'}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="h6" color="primary">
                      Rp {formatRupiah(artwork.price)}
                    </Typography>
                    <Chip
                      label={`Stock: ${artwork.stock}`}
                      size="small"
                      color={artwork.stock > 0 ? 'success' : 'error'}
                    />
                  </Stack>
                  {artwork.category && (
                    <Typography variant="caption" color="text.secondary" mt={1} display="block">
                      {artwork.category.name}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {!loading && filteredArtworks.length > 0 && totalPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Page {currentPage} of {totalPages} ({totalItems} total artworks)
          </Typography>
        </Stack>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formDialog.open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {formDialog.mode === 'create' ? 'Add New Artwork' : 'Edit Artwork'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Artist Selection */}
            <Autocomplete
              options={artists}
              getOptionLabel={(option) => option.name}
              value={artists.find((a) => a.id === formData.artist_id) || null}
              onChange={(_, value) => setFormData({ ...formData, artist_id: value?.id || 0 })}
              renderInput={(params) => (
                <TextField {...params} label="Artist *" placeholder="Select artist" />
              )}
            />

            {/* Basic Info */}
            <TextField
              label="Title *"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Category *"
                  fullWidth
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: Number(e.target.value) })
                  }
                >
                  <MenuItem value={0}>Select category</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Medium *"
                  fullWidth
                  value={formData.medium_id}
                  onChange={(e) => setFormData({ ...formData, medium_id: Number(e.target.value) })}
                >
                  <MenuItem value={0}>Select medium</MenuItem>
                  {mediums.map((med) => (
                    <MenuItem key={med.id} value={med.id}>
                      {med.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Divider />

            {/* Pricing & Stock */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Price *"
                  fullWidth
                  value={priceDisplay}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const numValue = value === '' ? 0 : Number(value);
                    setFormData({ ...formData, price: numValue });
                    setPriceDisplay(numValue === 0 ? '0' : numValue.toLocaleString('id-ID'));
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Stock *"
                  type="number"
                  fullWidth
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Artwork Details */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Year Created"
                  type="number"
                  fullWidth
                  value={formData.year_created}
                  onChange={(e) =>
                    setFormData({ ...formData, year_created: Number(e.target.value) })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Orientation"
                  fullWidth
                  value={formData.orientation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      orientation: e.target.value as 'portrait' | 'landscape' | 'square',
                    })
                  }
                >
                  <MenuItem value="portrait">Portrait</MenuItem>
                  <MenuItem value="landscape">Landscape</MenuItem>
                  <MenuItem value="square">Square</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* Dimensions */}
            <Typography variant="subtitle2" color="text.secondary">
              Dimensions (cm)
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Length"
                  type="number"
                  fullWidth
                  value={formData.length === 0 ? '' : formData.length}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      length: e.target.value === '' ? 0 : Number(e.target.value),
                    })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Width"
                  type="number"
                  fullWidth
                  value={formData.width === 0 ? '' : formData.width}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      width: e.target.value === '' ? 0 : Number(e.target.value),
                    })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Height"
                  type="number"
                  fullWidth
                  value={formData.height === 0 ? '' : formData.height}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: e.target.value === '' ? 0 : Number(e.target.value),
                    })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Weight *"
              type="number"
              fullWidth
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
              InputProps={{
                endAdornment: <InputAdornment position="end">g</InputAdornment>,
              }}
            />

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_for_sale}
                  onChange={(e) => setFormData({ ...formData, is_for_sale: e.target.checked })}
                />
              }
              label="For Sale"
            />

            <Divider />

            {/* Image Upload */}
            <Typography variant="subtitle2" color="text.secondary">
              Main Image {formDialog.mode === 'create' ? '*' : '(Optional)'}
            </Typography>

            {/* Show existing image in edit mode */}
            {formDialog.mode === 'edit' && formDialog.artwork && !imagePreview && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: 'block' }}
                >
                  Current Image:
                </Typography>
                <Box
                  component="img"
                  src={getImageUrl(formDialog.artwork)}
                  sx={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 1 }}
                />
              </Box>
            )}

            <Button variant="outlined" component="label" fullWidth>
              <Iconify icon={'solar:gallery-add-bold' as any} sx={{ mr: 1 }} />
              {formDialog.mode === 'create' ? 'Upload Main Image' : 'Change Main Image'}
              <input type="file" hidden accept="image/*" onChange={handleMainImageChange} />
            </Button>
            {imagePreview && (
              <Box
                component="img"
                src={imagePreview}
                sx={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 1 }}
              />
            )}

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Additional Images (Optional, max 5)
            </Typography>

            {/* Show existing additional images in edit mode */}
            {formDialog.mode === 'edit' && formDialog.artwork?.images && (
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {formDialog.artwork.images
                  .sort((a, b) => a.position - b.position)
                  .map((img) => (
                    <Grid key={img.id} size={{ xs: 6, sm: 4 }}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={
                            img.image_url?.startsWith('http')
                              ? img.image_url
                              : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${img.image_url || ''}`
                          }
                          sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={async () => {
                            try {
                              await artworkService.deleteImage(formDialog.artwork!.id, img.id);
                              await loadArtworks();
                              // Refresh artwork data in dialog
                              const response = await artworkService.getAll({
                                vendor_type: 'lapalapa',
                              });
                              const updatedArtwork = response.data.data.find(
                                (a) => a.id === formDialog.artwork!.id
                              );
                              if (updatedArtwork) {
                                setFormDialog({ ...formDialog, artwork: updatedArtwork });
                              }
                              setSnackbar({
                                open: true,
                                message: 'Image deleted successfully!',
                                severity: 'success',
                              });
                            } catch (error) {
                              setSnackbar({
                                open: true,
                                message: 'Failed to delete image',
                                severity: 'error',
                              });
                            }
                          }}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                          }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
              </Grid>
            )}

            <Button variant="outlined" component="label" fullWidth>
              <Iconify icon={'solar:gallery-add-bold' as any} sx={{ mr: 1 }} />
              Upload Additional Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleAdditionalImagesChange}
              />
            </Button>
            {additionalImages.length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary">
                  {additionalImages.length} file(s) selected
                </Typography>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {additionalImagePreviews.map((preview, index) => (
                    <Grid key={index} size={{ xs: 6, sm: 4 }}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={preview}
                          sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                        <Chip
                          label={`New ${index + 1}`}
                          size="small"
                          color="primary"
                          sx={{ position: 'absolute', top: 4, left: 4 }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {formDialog.mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, artwork: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Artwork</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.artwork?.title}"? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, artwork: null })}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
