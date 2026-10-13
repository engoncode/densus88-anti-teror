// src/sections/finance/view/finance-view.tsx
import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
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
import Divider from '@mui/material/Divider';

import { Iconify } from 'src/components/iconify';
import financeService, {
  type Withdrawal,
  type FinanceStatistics,
  type XenditBalance,
  type OrderItemCommission,
} from 'src/services/financeService';

// Helper function to format currency
const formatRupiah = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0';
  return numValue.toLocaleString('id-ID');
};

// Helper function for date formatting
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get date range presets
const getDatePresets = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  return {
    today: { start: formatDate(today), end: formatDate(today) },
    thisWeek: { start: formatDate(startOfWeek), end: formatDate(today) },
    thisMonth: { start: formatDate(startOfMonth), end: formatDate(today) },
    thisYear: { start: formatDate(startOfYear), end: formatDate(today) },
  };
};

type DatePreset = 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';

// ----------------------------------------------------------------------

export function FinanceView() {
  const [xenditBalance, setXenditBalance] = useState<XenditBalance | null>(null);
  const [statistics, setStatistics] = useState<FinanceStatistics | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Search & Filter & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Date Range Filter
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dialog states
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'complete' | 'reject' | null;
    withdrawal: Withdrawal | null;
  }>({
    open: false,
    type: null,
    withdrawal: null,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Order Items Modal
  const [orderItemsModal, setOrderItemsModal] = useState<{
    open: boolean;
    vendorType: 'artist' | 'lapalapa' | null;
  }>({
    open: false,
    vendorType: null,
  });
  const [orderItems, setOrderItems] = useState<OrderItemCommission[]>([]);
  const [orderItemsLoading, setOrderItemsLoading] = useState(false);
  const [orderItemsPage, setOrderItemsPage] = useState(1);
  const [orderItemsTotalPages, setOrderItemsTotalPages] = useState(1);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadXenditBalance = useCallback(async () => {
    try {
      setBalanceLoading(true);
      const data = await financeService.getXenditBalance();
      setXenditBalance(data);
    } catch (error) {
      console.error('Failed to load Xendit balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const loadStatistics = useCallback(async (start?: string, end?: string) => {
    try {
      const params: { start_date?: string; end_date?: string } = {};
      if (start && end) {
        params.start_date = start;
        params.end_date = end;
      }
      const data = await financeService.getStatistics(params);
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }, []);

  const loadWithdrawals = useCallback(async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true);
      const response = await financeService.getWithdrawals({
        page,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
      });
      setWithdrawals(response.data.data);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || response.data.data.length);
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrderItems = useCallback(
    async (vendorType: 'artist' | 'lapalapa', page = 1) => {
      try {
        setOrderItemsLoading(true);
        const response = await financeService.getOrderItems({
          vendor_type: vendorType,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          page,
          per_page: 10,
        });
        setOrderItems(response.data.data);
        setOrderItemsPage(response.data.current_page || 1);
        setOrderItemsTotalPages(response.data.last_page || 1);
      } catch (error) {
        console.error('Failed to load order items:', error);
      } finally {
        setOrderItemsLoading(false);
      }
    },
    [startDate, endDate]
  );

  const handleOpenOrderItemsModal = (vendorType: 'artist' | 'lapalapa') => {
    setOrderItemsModal({ open: true, vendorType });
    loadOrderItems(vendorType, 1);
  };

  const handleCloseOrderItemsModal = () => {
    setOrderItemsModal({ open: false, vendorType: null });
    setOrderItems([]);
    setOrderItemsPage(1);
  };

  const handleOrderItemsPageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    if (orderItemsModal.vendorType) {
      loadOrderItems(orderItemsModal.vendorType, page);
    }
  };

  useEffect(() => {
    loadXenditBalance();
    loadStatistics();
    loadWithdrawals(1, '', 'all');
  }, [loadXenditBalance, loadStatistics, loadWithdrawals]);

  // Handle date preset change
  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const presets = getDatePresets();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      loadStatistics();
    } else if (preset === 'custom') {
      // Don't auto-load, wait for user to set dates
    } else {
      const { start, end } = presets[preset];
      setStartDate(start);
      setEndDate(end);
      loadStatistics(start, end);
    }
  };

  // Handle custom date change
  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      loadStatistics(startDate, endDate);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadWithdrawals(1, searchQuery, statusFilter);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setStatusFilter(value);
    setCurrentPage(1);
    loadWithdrawals(1, searchQuery, value);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    loadWithdrawals(page, searchQuery, statusFilter);
  };

  const getStatusColor = (status: Withdrawal['status']) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'error',
      cancelled: 'default',
    };
    return colors[status] as any;
  };

  const handleOpenAction = (type: 'approve' | 'complete' | 'reject', withdrawal: Withdrawal) => {
    setActionDialog({ open: true, type, withdrawal });
    setRejectReason('');
    setAdminNotes('');
  };

  const handleCloseAction = () => {
    setActionDialog({ open: false, type: null, withdrawal: null });
    setRejectReason('');
    setAdminNotes('');
  };

  const handleSubmitAction = async () => {
    if (!actionDialog.withdrawal || !actionDialog.type) return;

    try {
      setSubmitting(true);

      if (actionDialog.type === 'approve') {
        await financeService.approveWithdrawal(actionDialog.withdrawal.id);
        setSnackbar({
          open: true,
          message: 'Withdrawal approved successfully!',
          severity: 'success',
        });
      } else if (actionDialog.type === 'complete') {
        await financeService.completeWithdrawal(
          actionDialog.withdrawal.id,
          adminNotes || undefined
        );
        setSnackbar({
          open: true,
          message: 'Withdrawal completed successfully!',
          severity: 'success',
        });
      } else if (actionDialog.type === 'reject') {
        if (!rejectReason.trim()) {
          setSnackbar({
            open: true,
            message: 'Please provide a rejection reason',
            severity: 'error',
          });
          return;
        }
        await financeService.rejectWithdrawal(actionDialog.withdrawal.id, rejectReason);
        setSnackbar({
          open: true,
          message: 'Withdrawal rejected and funds refunded to artist',
          severity: 'success',
        });
      }

      handleCloseAction();
      loadWithdrawals(currentPage, searchQuery, statusFilter);
      loadStatistics(startDate || undefined, endDate || undefined);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Action failed',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Finance Management</Typography>

        {/* Date Range Filter */}
        <Stack direction="row" spacing={2} alignItems="center">
          <ButtonGroup size="small" variant="outlined">
            <Button
              onClick={() => handleDatePresetChange('all')}
              variant={datePreset === 'all' ? 'contained' : 'outlined'}
            >
              All Time
            </Button>
            <Button
              onClick={() => handleDatePresetChange('today')}
              variant={datePreset === 'today' ? 'contained' : 'outlined'}
            >
              Today
            </Button>
            <Button
              onClick={() => handleDatePresetChange('thisWeek')}
              variant={datePreset === 'thisWeek' ? 'contained' : 'outlined'}
            >
              This Week
            </Button>
            <Button
              onClick={() => handleDatePresetChange('thisMonth')}
              variant={datePreset === 'thisMonth' ? 'contained' : 'outlined'}
            >
              This Month
            </Button>
            <Button
              onClick={() => handleDatePresetChange('thisYear')}
              variant={datePreset === 'thisYear' ? 'contained' : 'outlined'}
            >
              This Year
            </Button>
            <Button
              onClick={() => handleDatePresetChange('custom')}
              variant={datePreset === 'custom' ? 'contained' : 'outlined'}
            >
              Custom
            </Button>
          </ButtonGroup>
        </Stack>
      </Stack>

      {/* Custom Date Range Picker */}
      {datePreset === 'custom' && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="date"
              label="Start Date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              type="date"
              label="End Date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button
              variant="contained"
              onClick={handleCustomDateApply}
              disabled={!startDate || !endDate}
            >
              Apply Filter
            </Button>
            {statistics?.date_range?.filtered && (
              <Chip
                label={`${startDate} - ${endDate}`}
                onDelete={() => handleDatePresetChange('all')}
                color="primary"
                size="small"
              />
            )}
          </Stack>
        </Card>
      )}

      {/* Date Range Indicator */}
      {datePreset !== 'all' && datePreset !== 'custom' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing statistics for:{' '}
          <strong>
            {datePreset === 'today'
              ? 'Today'
              : datePreset === 'thisWeek'
                ? 'This Week'
                : datePreset === 'thisMonth'
                  ? 'This Month'
                  : 'This Year'}
          </strong>{' '}
          ({startDate} - {endDate})
        </Alert>
      )}

      {/* Balance Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Xendit Balance */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={'solar:wallet-bold' as any} width={24} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
                    Xendit Balance
                  </Typography>
                  {balanceLoading ? (
                    <Skeleton
                      variant="text"
                      width={120}
                      sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}
                    />
                  ) : (
                    <Typography variant="h5">
                      Rp {formatRupiah(xenditBalance?.balance || 0)}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Withdrawals */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={'solar:clock-circle-bold' as any} width={24} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
                    Pending Withdrawals ({statistics?.pending_count || 0})
                  </Typography>
                  <Typography variant="h5">
                    Rp {formatRupiah(statistics?.pending_withdrawals || 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Processing Withdrawals */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={'solar:refresh-bold' as any} width={24} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
                    Processing ({statistics?.processing_count || 0})
                  </Typography>
                  <Typography variant="h5">
                    Rp {formatRupiah(statistics?.processing_withdrawals || 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Artist Wallets */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={'solar:users-group-rounded-bold' as any} width={24} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
                    Total Artist Balance
                  </Typography>
                  <Typography variant="h5">
                    Rp {formatRupiah(statistics?.total_artist_balance || 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Revenue Overview
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Order Revenue
                </Typography>
                <Iconify icon={'solar:wallet-money-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">
                Rp {formatRupiah(statistics?.total_revenue || 0)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                {statistics?.paid_orders_count || 0} paid orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Product Sales
                </Typography>
                <Iconify icon={'solar:bag-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">
                Rp {formatRupiah(statistics?.total_product_sales || 0)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Artwork sales only
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Shipping Revenue
                </Typography>
                <Iconify icon={'solar:delivery-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">
                Rp {formatRupiah(statistics?.total_shipping_revenue || 0)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Shipping costs collected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Completed Withdrawals
                </Typography>
                <Iconify icon={'solar:check-circle-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">
                Rp {formatRupiah(statistics?.completed_withdrawals || 0)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Total paid to artists
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales by Vendor Type */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Sales by Vendor Type
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Artist Sales */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon={'solar:palette-bold' as any} width={24} color="info.main" />
                  <Typography variant="h6">Artist Sales</Typography>
                  <Chip
                    label={`${statistics?.artist_orders_count || 0} orders`}
                    size="small"
                    color="info"
                  />
                </Stack>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpenOrderItemsModal('artist')}
                  startIcon={<Iconify icon="solar:eye-bold" width={16} />}
                >
                  View Details
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total Sales:
                  </Typography>
                  <Typography variant="subtitle1">
                    Rp {formatRupiah(statistics?.artist_sales || 0)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Artist Earnings:
                  </Typography>
                  <Typography variant="subtitle1" color="info.main">
                    Rp {formatRupiah(statistics?.artist_earnings || 0)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    LaPalapa Commission:
                  </Typography>
                  <Typography variant="subtitle1" color="success.main">
                    Rp {formatRupiah(statistics?.lapalapa_commission || 0)}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* LaPalapa Sales */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon={'solar:shop-bold' as any} width={24} color="primary.main" />
                  <Typography variant="h6">LaPalapa Direct Sales</Typography>
                  <Chip
                    label={`${statistics?.lapalapa_orders_count || 0} orders`}
                    size="small"
                    color="primary"
                  />
                </Stack>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpenOrderItemsModal('lapalapa')}
                  startIcon={<Iconify icon="solar:eye-bold" width={16} />}
                >
                  View Details
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total Sales:
                  </Typography>
                  <Typography variant="subtitle1">
                    Rp {formatRupiah(statistics?.lapalapa_direct_revenue || 0)}
                  </Typography>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ bgcolor: 'success.lighter', p: 1, borderRadius: 1 }}
                >
                  <Typography variant="subtitle2">Total LaPalapa Revenue:</Typography>
                  <Typography variant="h6" color="success.main">
                    Rp {formatRupiah(statistics?.total_lapalapa_revenue || 0)}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Artist Wallet Stats */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Artist Wallet Summary
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Artist Earnings
                </Typography>
                <Iconify icon={'solar:palette-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">
                Rp {formatRupiah(statistics?.artist_earnings || 0)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Total earnings from artist sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  LaPalapa Revenue
                </Typography>
                <Iconify icon={'solar:shop-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">
                Rp {formatRupiah(statistics?.lapalapa_direct_revenue || 0)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                100% from direct LaPalapa sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Artist Withdrawable
                </Typography>
                <Iconify icon={'solar:wallet-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">
                Rp {formatRupiah(statistics?.total_artist_balance || 0)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Saldo artist siap ditarik
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Artist Pending
                </Typography>
                <Iconify icon={'solar:clock-circle-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">
                Rp {formatRupiah(statistics?.total_pending_balance || 0)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Menunggu order selesai
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Withdrawals Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Artist Withdrawal Requests
      </Typography>

      {/* Search & Filter */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Search by artist name, email, or bank account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon={'eva:search-fill' as any} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                      loadWithdrawals(1, '', statusFilter);
                    }}
                  >
                    <Iconify icon={'eva:close-fill' as any} width={18} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
          <Button variant="contained" onClick={handleSearch} sx={{ minWidth: 100 }}>
            Search
          </Button>
        </Stack>
        {!loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Showing {withdrawals.length} of {totalItems} withdrawals
            {searchQuery && ` for "${searchQuery}"`}
            {statusFilter !== 'all' && ` (${statusFilter})`}
          </Typography>
        )}
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Artist</TableCell>
                <TableCell>Bank Account</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
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
              ) : withdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No withdrawal requests found
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {withdrawal.user?.artist_profile?.name || withdrawal.user?.name || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {withdrawal.user?.email || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {withdrawal.bank_account?.bank_name || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {withdrawal.bank_account?.account_number} -{' '}
                        {withdrawal.bank_account?.account_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="primary">
                        Rp {formatRupiah(withdrawal.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={withdrawal.status}
                        size="small"
                        color={getStatusColor(withdrawal.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(withdrawal.created_at).toLocaleDateString('id-ID')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(withdrawal.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {withdrawal.status === 'pending' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleOpenAction('complete', withdrawal)}
                            >
                              Complete
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleOpenAction('reject', withdrawal)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {withdrawal.status === 'processing' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleOpenAction('complete', withdrawal)}
                            >
                              Complete
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleOpenAction('reject', withdrawal)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {(withdrawal.status === 'completed' ||
                          withdrawal.status === 'failed' ||
                          withdrawal.status === 'cancelled') && (
                          <Typography variant="caption" color="text.secondary">
                            {withdrawal.admin_notes || 'No notes'}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && withdrawals.length > 0 && totalPages > 1 && (
          <Stack alignItems="center" sx={{ py: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Stack>
        )}
      </Card>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => !submitting && handleCloseAction()}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'approve' && 'Approve Withdrawal'}
          {actionDialog.type === 'complete' && 'Complete Withdrawal'}
          {actionDialog.type === 'reject' && 'Reject Withdrawal'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.withdrawal && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert
                severity={
                  actionDialog.type === 'reject'
                    ? 'warning'
                    : actionDialog.type === 'complete'
                      ? 'success'
                      : 'info'
                }
              >
                {actionDialog.type === 'approve' && 'This will mark the withdrawal as processing.'}
                {actionDialog.type === 'complete' &&
                  'Make sure you have transferred the funds before completing.'}
                {actionDialog.type === 'reject' &&
                  'The funds will be refunded to the artist wallet.'}
              </Alert>

              <Box sx={{ bgcolor: 'background.neutral', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Withdrawal Details
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Artist:
                    </Typography>
                    <Typography variant="body2">
                      {actionDialog.withdrawal.user?.artist_profile?.name ||
                        actionDialog.withdrawal.user?.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Bank:
                    </Typography>
                    <Typography variant="body2">
                      {actionDialog.withdrawal.bank_account?.bank_name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Account:
                    </Typography>
                    <Typography variant="body2">
                      {actionDialog.withdrawal.bank_account?.account_number} -{' '}
                      {actionDialog.withdrawal.bank_account?.account_name}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle2">Amount:</Typography>
                    <Typography variant="subtitle2" color="primary">
                      Rp {formatRupiah(actionDialog.withdrawal.amount)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {actionDialog.withdrawal.notes && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Artist Notes:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {actionDialog.withdrawal.notes}
                  </Typography>
                </Box>
              )}

              {actionDialog.type === 'reject' && (
                <TextField
                  label="Rejection Reason *"
                  fullWidth
                  multiline
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                />
              )}

              {actionDialog.type === 'complete' && (
                <TextField
                  label="Admin Notes (Optional)"
                  fullWidth
                  multiline
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this transaction..."
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAction} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitAction}
            variant="contained"
            color={actionDialog.type === 'reject' ? 'error' : 'success'}
            disabled={submitting}
          >
            {submitting
              ? 'Processing...'
              : actionDialog.type === 'approve'
                ? 'Approve'
                : actionDialog.type === 'complete'
                  ? 'Complete Transfer'
                  : 'Reject & Refund'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

      {/* Order Items Detail Modal */}
      <Dialog
        open={orderItemsModal.open}
        onClose={handleCloseOrderItemsModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify
              icon={
                orderItemsModal.vendorType === 'artist'
                  ? 'solar:palette-bold'
                  : ('solar:shop-bold' as any)
              }
              width={28}
              color={orderItemsModal.vendorType === 'artist' ? 'info.main' : 'primary.main'}
            />
            <Typography variant="h6">
              {orderItemsModal.vendorType === 'artist' ? 'Artist Sales' : 'LaPalapa Direct Sales'} -
              Commission Details
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {orderItemsLoading ? (
            <Stack spacing={2} sx={{ py: 3 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} />
              ))}
            </Stack>
          ) : orderItems.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography color="text.secondary">No order items found</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order</TableCell>
                      <TableCell>Artwork</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="center">Rate</TableCell>
                      <TableCell align="right">Artist Earnings</TableCell>
                      <TableCell align="right">Platform Fee</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" fontWeight={600}>
                              {item.order_number || '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.order_date
                                ? new Date(item.order_date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '-'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {item.artwork_image && (
                              <Box
                                component="img"
                                src={item.artwork_image}
                                alt={item.artwork_title}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                }}
                              />
                            )}
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {item.artwork_title}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">Rp {formatRupiah(item.price)}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>Rp {formatRupiah(item.subtotal)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${parseFloat(item.commission_rate)}%`}
                            size="small"
                            color={parseFloat(item.commission_rate) > 0 ? 'info' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="info.main" fontWeight={500}>
                            Rp {formatRupiah(item.artist_earnings)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="success.main" fontWeight={500}>
                            Rp {formatRupiah(item.platform_fee)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {orderItemsTotalPages > 1 && (
                <Stack alignItems="center" sx={{ mt: 2 }}>
                  <Pagination
                    count={orderItemsTotalPages}
                    page={orderItemsPage}
                    onChange={handleOrderItemsPageChange}
                    color="primary"
                  />
                </Stack>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderItemsModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
