import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Avatar,
  Stack,
  Checkbox,
  Tooltip,
  Alert,
} from '@mui/material';
import { Icon } from '@iconify/react';

import { DashboardContent } from 'src/layouts/dashboard';

import { reviewService, Review, ReviewStatistics } from '../../services/reviewService';

export default function ReviewsView() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [selected, setSelected] = useState<number[]>([]);

  // Dialogs
  const [detailDialog, setDetailDialog] = useState<Review | null>(null);
  const [rejectDialog, setRejectDialog] = useState<Review | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<Review | null>(null);
  const [bulkRejectDialog, setBulkRejectDialog] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reviewService.getReviews({
        page: page + 1,
        per_page: rowsPerPage,
        search: search || undefined,
        status: statusFilter || undefined,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
      });
      setReviews(response.data.data);
      setTotalRows(response.data.total);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter, ratingFilter]);

  const fetchStatistics = async () => {
    try {
      const stats = await reviewService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await reviewService.approveReview(id);
      fetchReviews();
      fetchStatistics();
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    try {
      await reviewService.rejectReview(rejectDialog.id, rejectReason);
      setRejectDialog(null);
      setRejectReason('');
      fetchReviews();
      fetchStatistics();
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await reviewService.deleteReview(deleteDialog.id);
      setDeleteDialog(null);
      fetchReviews();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleBulkApprove = async () => {
    try {
      await reviewService.bulkApprove(selected);
      setSelected([]);
      fetchReviews();
      fetchStatistics();
    } catch (error) {
      console.error('Error bulk approving:', error);
    }
  };

  const handleBulkReject = async () => {
    try {
      await reviewService.bulkReject(selected, bulkRejectReason);
      setSelected([]);
      setBulkRejectDialog(false);
      setBulkRejectReason('');
      fetchReviews();
      fetchStatistics();
    } catch (error) {
      console.error('Error bulk rejecting:', error);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(reviews.map((r) => r.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Review Management
      </Typography>

      {/* Statistics Cards */}
      {statistics && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, mb: 3 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Reviews
            </Typography>
            <Typography variant="h4">{statistics.total_reviews}</Typography>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Pending
            </Typography>
            <Typography variant="h4" color="warning.main">
              {statistics.pending_reviews}
            </Typography>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Approved
            </Typography>
            <Typography variant="h4" color="success.main">
              {statistics.approved_reviews}
            </Typography>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Rejected
            </Typography>
            <Typography variant="h4" color="error.main">
              {statistics.rejected_reviews}
            </Typography>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Avg Rating
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4">{statistics.average_rating}</Typography>
              <Icon icon="solar:star-bold" color="#faaf00" width={24} />
            </Stack>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="solar:magnifer-linear" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Rating</InputLabel>
            <Select
              value={ratingFilter}
              label="Rating"
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {[5, 4, 3, 2, 1].map((r) => (
                <MenuItem key={r} value={r}>
                  {r} Stars
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selected.length > 0 && (
            <>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<Icon icon="solar:check-circle-bold" />}
                onClick={handleBulkApprove}
              >
                Approve ({selected.length})
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<Icon icon="solar:close-circle-bold" />}
                onClick={() => setBulkRejectDialog(true)}
              >
                Reject ({selected.length})
              </Button>
            </>
          )}
        </Stack>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < reviews.length}
                    checked={reviews.length > 0 && selected.length === reviews.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Artwork</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(review.id)}
                        onChange={() => handleSelect(review.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          src={review.user?.avatar || undefined}
                          sx={{ width: 32, height: 32 }}
                        >
                          {review.user?.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{review.user?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {review.user?.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {review.artwork?.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Rating value={review.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {review.comment || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={review.status}
                        color={getStatusColor(review.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setDetailDialog(review)}>
                          <Icon icon="solar:eye-bold" />
                        </IconButton>
                      </Tooltip>
                      {review.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(review.id)}
                            >
                              <Icon icon="solar:check-circle-bold" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setRejectDialog(review)}
                            >
                              <Icon icon="solar:close-circle-bold" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteDialog(review)}
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
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 15, 25, 50]}
        />
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent>
          {detailDialog && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  User
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar src={detailDialog.user?.avatar || undefined}>
                    {detailDialog.user?.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography>{detailDialog.user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {detailDialog.user?.email}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Artwork
                </Typography>
                <Typography>{detailDialog.artwork?.title}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Overall Rating
                </Typography>
                <Rating value={detailDialog.rating} readOnly />
              </Box>
              {detailDialog.quality_rating && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quality Rating
                  </Typography>
                  <Rating value={detailDialog.quality_rating} readOnly size="small" />
                </Box>
              )}
              {detailDialog.packaging_rating && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Packaging Rating
                  </Typography>
                  <Rating value={detailDialog.packaging_rating} readOnly size="small" />
                </Box>
              )}
              {detailDialog.shipping_rating && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Shipping Rating
                  </Typography>
                  <Rating value={detailDialog.shipping_rating} readOnly size="small" />
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Comment
                </Typography>
                <Typography>{detailDialog.comment || '-'}</Typography>
              </Box>
              {detailDialog.photos && detailDialog.photos.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Photos
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {detailDialog.photos.map((photo, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={photo}
                        sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={detailDialog.status}
                  color={getStatusColor(detailDialog.status)}
                  size="small"
                />
              </Box>
              {detailDialog.rejection_reason && (
                <Alert severity="error">
                  <Typography variant="subtitle2">Rejection Reason:</Typography>
                  {detailDialog.rejection_reason}
                </Alert>
              )}
              {detailDialog.is_verified_purchase && (
                <Chip
                  icon={<Icon icon="solar:verified-check-bold" />}
                  label="Verified Purchase"
                  color="info"
                  size="small"
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onClose={() => setRejectDialog(null)}>
        <DialogTitle>Reject Review</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Are you sure you want to reject this review?</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(null)}>Cancel</Button>
          <Button onClick={handleReject} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Reject Dialog */}
      <Dialog open={bulkRejectDialog} onClose={() => setBulkRejectDialog(false)}>
        <DialogTitle>Reject {selected.length} Reviews</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to reject {selected.length} reviews?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason (optional)"
            value={bulkRejectReason}
            onChange={(e) => setBulkRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkRejectDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkReject} color="error" variant="contained">
            Reject All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete this review? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
