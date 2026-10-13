// src/sections/voucher/view/vouchers-view.tsx
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import voucherService, {
  type Voucher,
  type VoucherStatistics,
  type VoucherFormData,
} from 'src/services/voucherService';

// Helper function to format currency
const formatRupiah = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0';
  return numValue.toLocaleString('id-ID');
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ----------------------------------------------------------------------

export function VouchersView() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [statistics, setStatistics] = useState<VoucherStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    voucher: Voucher | null;
  }>({
    open: false,
    mode: 'create',
    voucher: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    voucher: Voucher | null;
  }>({
    open: false,
    voucher: null,
  });

  // Form state
  const [formData, setFormData] = useState<VoucherFormData>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    discount_value: 0,
    min_purchase: 0,
    max_discount: 0,
    usage_limit: 0,
    usage_limit_per_user: 1,
    valid_from: '',
    valid_until: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadStatistics = useCallback(async () => {
    try {
      const data = await voucherService.getStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }, []);

  const loadVouchers = useCallback(async (page = 1, search = '', status = 'all', type = 'all') => {
    try {
      setLoading(true);
      const response = await voucherService.getVouchers({
        page,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        type: type !== 'all' ? type : undefined,
      });
      setVouchers(response.data.data);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Failed to load vouchers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
    loadVouchers();
  }, [loadStatistics, loadVouchers]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadVouchers(1, searchQuery, statusFilter, typeFilter);
  };

  const handleFilterChange = (newStatus: string, newType: string) => {
    setStatusFilter(newStatus);
    setTypeFilter(newType);
    setCurrentPage(1);
    loadVouchers(1, searchQuery, newStatus, newType);
  };

  const handlePageChange = (_: any, page: number) => {
    setCurrentPage(page);
    loadVouchers(page, searchQuery, statusFilter, typeFilter);
  };

  const handleOpenCreate = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      discount_value: 0,
      min_purchase: 0,
      max_discount: 0,
      usage_limit: 0,
      usage_limit_per_user: 1,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
    });
    setFormDialog({ open: true, mode: 'create', voucher: null });
  };

  const handleOpenEdit = (voucher: Voucher) => {
    setFormData({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      type: voucher.type,
      discount_value: parseFloat(voucher.discount_value),
      min_purchase: parseFloat(voucher.min_purchase),
      max_discount: voucher.max_discount ? parseFloat(voucher.max_discount) : 0,
      usage_limit: voucher.usage_limit || 0,
      usage_limit_per_user: voucher.usage_limit_per_user,
      valid_from: voucher.valid_from.split('T')[0],
      valid_until: voucher.valid_until.split('T')[0],
      is_active: voucher.is_active,
    });
    setFormDialog({ open: true, mode: 'edit', voucher });
  };

  const handleCloseForm = () => {
    setFormDialog({ open: false, mode: 'create', voucher: null });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (formDialog.mode === 'create') {
        await voucherService.createVoucher(formData);
        setSnackbar({ open: true, message: 'Voucher created successfully', severity: 'success' });
      } else if (formDialog.voucher) {
        await voucherService.updateVoucher(formDialog.voucher.id, formData);
        setSnackbar({ open: true, message: 'Voucher updated successfully', severity: 'success' });
      }
      handleCloseForm();
      loadVouchers(currentPage, searchQuery, statusFilter, typeFilter);
      loadStatistics();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Operation failed',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    try {
      await voucherService.toggleStatus(voucher.id);
      setSnackbar({
        open: true,
        message: voucher.is_active ? 'Voucher deactivated' : 'Voucher activated',
        severity: 'success',
      });
      loadVouchers(currentPage, searchQuery, statusFilter, typeFilter);
      loadStatistics();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to toggle status',
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.voucher) return;
    try {
      setSubmitting(true);
      await voucherService.deleteVoucher(deleteDialog.voucher.id);
      setSnackbar({ open: true, message: 'Voucher deleted successfully', severity: 'success' });
      setDeleteDialog({ open: false, voucher: null });
      loadVouchers(currentPage, searchQuery, statusFilter, typeFilter);
      loadStatistics();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete voucher',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (voucher: Voucher) => {
    const now = new Date();
    const validUntil = new Date(voucher.valid_until);

    if (!voucher.is_active) {
      return <Chip label="Inactive" size="small" color="default" />;
    }
    if (validUntil < now) {
      return <Chip label="Expired" size="small" color="error" />;
    }
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return <Chip label="Limit Reached" size="small" color="warning" />;
    }
    return <Chip label="Active" size="small" color="success" />;
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4">Voucher Management</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="solar:add-circle-bold" />}
          onClick={handleOpenCreate}
        >
          New Voucher
        </Button>
      </Stack>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Vouchers
                </Typography>
                {statistics ? (
                  <Typography variant="h4">{statistics.total_vouchers}</Typography>
                ) : (
                  <Skeleton width={60} height={40} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Active Vouchers
                </Typography>
                {statistics ? (
                  <Typography variant="h4" color="success.main">
                    {statistics.active_vouchers}
                  </Typography>
                ) : (
                  <Skeleton width={60} height={40} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Expired Vouchers
                </Typography>
                {statistics ? (
                  <Typography variant="h4" color="error.main">
                    {statistics.expired_vouchers}
                  </Typography>
                ) : (
                  <Skeleton width={60} height={40} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Usage
                </Typography>
                {statistics ? (
                  <Typography variant="h4">{statistics.total_usages}</Typography>
                ) : (
                  <Skeleton width={60} height={40} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              placeholder="Search by code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="solar:magnifer-bold" width={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => handleFilterChange(e.target.value, typeFilter)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => handleFilterChange(statusFilter, e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="fixed">Fixed Amount</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={handleSearch}>
              Search
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell>Valid Period</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : vouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No vouchers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                vouchers.map((voucher) => (
                  <TableRow key={voucher.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontFamily="monospace">
                        {voucher.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{voucher.name}</Typography>
                    </TableCell>
                    <TableCell>
                      {voucher.type === 'percentage' ? (
                        <Typography variant="body2" color="primary.main">
                          {parseFloat(voucher.discount_value)}%
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="success.main">
                          Rp {formatRupiah(voucher.discount_value)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {voucher.used_count}
                        {voucher.usage_limit ? ` / ${voucher.usage_limit}` : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(voucher.valid_from)} - {formatDate(voucher.valid_until)}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(voucher)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title={voucher.is_active ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(voucher)}
                          color={voucher.is_active ? 'warning' : 'success'}
                        >
                          <Icon
                            icon={voucher.is_active ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEdit(voucher)}>
                          <Icon icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, voucher })}
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
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" py={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formDialog.open} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formDialog.mode === 'create' ? 'Create New Voucher' : 'Edit Voucher'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Voucher Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Leave empty to auto-generate"
              helperText="Leave empty to auto-generate a random code"
            />
            <TextField
              fullWidth
              label="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Discount Type"
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })
                  }
                >
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="fixed">Fixed Amount (Rp)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Discount Value"
                type="number"
                required
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.type === 'percentage' ? '%' : 'Rp'}
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Min Purchase"
                type="number"
                value={formData.min_purchase}
                onChange={(e) =>
                  setFormData({ ...formData, min_purchase: parseFloat(e.target.value) || 0 })
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Max Discount"
                type="number"
                value={formData.max_discount}
                onChange={(e) =>
                  setFormData({ ...formData, max_discount: parseFloat(e.target.value) || 0 })
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
                helperText="For percentage type"
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Usage Limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) =>
                  setFormData({ ...formData, usage_limit: parseInt(e.target.value, 10) || 0 })
                }
                helperText="0 = unlimited"
              />
              <TextField
                fullWidth
                label="Per User Limit"
                type="number"
                value={formData.usage_limit_per_user}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usage_limit_per_user: parseInt(e.target.value, 10) || 1,
                  })
                }
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Valid From"
                type="date"
                required
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                label="Valid Until"
                type="date"
                required
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : formDialog.mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, voucher: null })}
      >
        <DialogTitle>Delete Voucher</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete voucher <strong>{deleteDialog.voucher?.code}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, voucher: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={submitting}>
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
