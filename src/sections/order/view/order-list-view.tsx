// src/sections/order/view/order-list-view.tsx
import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Pagination from '@mui/material/Pagination';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { Iconify } from 'src/components/iconify';
import type { Order } from 'src/types/order';

import orderService from 'src/services/orderService';

// Helper function to format currency
const formatRupiah = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return numValue.toLocaleString('id-ID');
};

// ----------------------------------------------------------------------

export function OrderListView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [pickupDialog, setPickupDialog] = useState<{
    open: boolean;
    order: Order | null;
  }>({
    open: false,
    order: null,
  });
  const [pickupNotes, setPickupNotes] = useState('');
  const [submittingPickup, setSubmittingPickup] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadOrders = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await orderService.getAll({ page, search: search || undefined });
      setOrders(response.data.data);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || response.data.data.length);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(1, '');
  }, [loadOrders]);

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  // Handle search submit
  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setCurrentPage(1);
      loadOrders(1, searchQuery);
    }
  };

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    loadOrders(page, searchQuery);
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] as any;
  };

  const hasLapalapaItems = (order: Order) => {
    return order.items?.some((item) => item.artwork?.vendor_type === 'lapalapa');
  };

  const canRequestPickup = (order: Order) => {
    return (
      hasLapalapaItems(order) &&
      order.status === 'processing' &&
      order.payment_status === 'paid' &&
      !order.tracking_number
    );
  };

  const handleRequestPickup = (order: Order) => {
    setPickupDialog({ open: true, order });
    setPickupNotes('');
  };

  const handlePickupSubmit = async () => {
    if (!pickupDialog.order) return;

    try {
      setSubmittingPickup(true);
      await orderService.requestPickup(pickupDialog.order.order_number, pickupNotes);

      setSnackbar({
        open: true,
        message: 'Pickup request submitted successfully!',
        severity: 'success',
      });

      setPickupDialog({ open: false, order: null });
      setPickupNotes('');
      await loadOrders();
    } catch (error: any) {
      console.error('Failed to request pickup:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to request pickup',
        severity: 'error',
      });
    } finally {
      setSubmittingPickup(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Orders Management</Typography>
      </Stack>

      {/* Search Section */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Search by order number, customer name, or email..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleSearchSubmit}
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
                      loadOrders(1, '');
                    }}
                  >
                    <Iconify icon={'eva:close-fill' as any} width={18} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={() => {
              setCurrentPage(1);
              loadOrders(1, searchQuery);
            }}
            sx={{ minWidth: 100 }}
          >
            Search
          </Button>
        </Stack>
        {!loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Showing {orders.length} of {totalItems} orders
            {searchQuery && ` for "${searchQuery}"`}
          </Typography>
        )}
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Order Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Vendor Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {orders.map((order) => (
                    <>
                      <TableRow key={order.id}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                            }
                          >
                            <Iconify
                              icon={
                                expandedOrderId === order.id
                                  ? 'eva:arrow-ios-downward-fill'
                                  : 'eva:arrow-ios-forward-fill'
                              }
                            />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{order.order_number}</Typography>
                          {order.tracking_number && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Tracking: {order.tracking_number}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{order.user?.name || '-'}</TableCell>
                        <TableCell>Rp {formatRupiah(order.total)}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.payment_status}
                            size="small"
                            color={order.payment_status === 'paid' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            size="small"
                            color={getStatusColor(order.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {order.vendor_types && order.vendor_types.length > 0 ? (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {order.vendor_types.map((type, idx) => (
                                <Chip
                                  key={idx}
                                  label={type}
                                  size="small"
                                  color={type === 'lapalapa' ? 'primary' : 'default'}
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {/* Show Request Pickup button for LaPalapa orders */}
                            {canRequestPickup(order) ? (
                              <Tooltip title="Request pickup for this LaPalapa order">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="warning"
                                  startIcon={<Iconify icon="solar:cart-3-bold" />}
                                  onClick={() => handleRequestPickup(order)}
                                >
                                  Request Pickup
                                </Button>
                              </Tooltip>
                            ) : hasLapalapaItems(order) && order.tracking_number ? (
                              <Chip
                                label="Pickup Requested"
                                size="small"
                                color="success"
                                icon={
                                  <Iconify icon="solar:check-circle-bold" sx={{ fontSize: 16 }} />
                                }
                              />
                            ) : null}

                            {/* Debug info - remove after testing */}
                            {hasLapalapaItems(order) &&
                              !canRequestPickup(order) &&
                              !order.tracking_number && (
                                <Tooltip
                                  title={`Status: ${order.status} | Payment: ${order.payment_status}`}
                                >
                                  <Chip
                                    label="Waiting Payment"
                                    size="small"
                                    color="default"
                                    variant="outlined"
                                  />
                                </Tooltip>
                              )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                          <Collapse in={expandedOrderId === order.id} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              <Typography variant="h6" gutterBottom component="div">
                                Order Items
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Artwork</TableCell>
                                    <TableCell>SKU</TableCell>
                                    <TableCell>Vendor Type</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">Subtotal</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {order.items?.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.artwork_title}</TableCell>
                                      <TableCell>{item.artwork_sku || '-'}</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={item.artwork?.vendor_type || '-'}
                                          size="small"
                                          color={
                                            item.artwork?.vendor_type === 'lapalapa'
                                              ? 'primary'
                                              : 'default'
                                          }
                                          variant="outlined"
                                        />
                                      </TableCell>
                                      <TableCell align="right">
                                        Rp {formatRupiah(item.price)}
                                      </TableCell>
                                      <TableCell align="right">{item.quantity}</TableCell>
                                      <TableCell align="right">
                                        Rp {formatRupiah(item.subtotal)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>

                              {/* Order Summary */}
                              <Box
                                sx={{
                                  mt: 3,
                                  p: 2,
                                  bgcolor: 'background.neutral',
                                  borderRadius: 1,
                                  maxWidth: 400,
                                  ml: 'auto',
                                }}
                              >
                                <Typography variant="subtitle2" gutterBottom>
                                  Order Summary
                                </Typography>
                                <Stack spacing={1}>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">
                                      Subtotal:
                                    </Typography>
                                    <Typography variant="body2">
                                      Rp {formatRupiah(order.subtotal)}
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">
                                      Shipping Cost:
                                    </Typography>
                                    <Typography variant="body2">
                                      Rp {formatRupiah(order.shipping_cost)}
                                    </Typography>
                                  </Stack>
                                  {Number(order.discount) > 0 && (
                                    <Stack direction="row" justifyContent="space-between">
                                      <Typography variant="body2" color="text.secondary">
                                        Discount:
                                      </Typography>
                                      <Typography variant="body2" color="error.main">
                                        - Rp {formatRupiah(order.discount)}
                                      </Typography>
                                    </Stack>
                                  )}
                                  {order.voucher_code && (
                                    <Stack direction="row" justifyContent="space-between">
                                      <Typography variant="caption" color="text.secondary">
                                        Voucher:
                                      </Typography>
                                      <Chip label={order.voucher_code} size="small" />
                                    </Stack>
                                  )}
                                  <Divider sx={{ my: 1 }} />
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle2">Total:</Typography>
                                    <Typography variant="subtitle2" color="primary">
                                      Rp {formatRupiah(order.total)}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </Box>

                              {/* Shipping Address */}
                              {order.shipping_address_snapshot && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Shipping Address:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {order.shipping_address_snapshot.name} -{' '}
                                    {order.shipping_address_snapshot.phone}
                                    <br />
                                    {order.shipping_address_snapshot.address}
                                    <br />
                                    {order.shipping_address_snapshot.district},{' '}
                                    {order.shipping_address_snapshot.regency},{' '}
                                    {order.shipping_address_snapshot.province}{' '}
                                    {order.shipping_address_snapshot.postal_code}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && orders.length > 0 && totalPages > 1 && (
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

      {/* Request Pickup Dialog */}
      <Dialog
        open={pickupDialog.open}
        onClose={() => !submittingPickup && setPickupDialog({ open: false, order: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Pickup</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              This will generate a tracking number and mark the order as shipped. Make sure the
              items are ready for pickup.
            </Alert>

            {pickupDialog.order && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Order: {pickupDialog.order.order_number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer: {pickupDialog.order.user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: Rp {formatRupiah(pickupDialog.order.total)}
                </Typography>
              </Box>
            )}

            <TextField
              label="Pickup Notes (Optional)"
              fullWidth
              multiline
              rows={3}
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="Add any special instructions or notes about this pickup..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPickupDialog({ open: false, order: null })}
            disabled={submittingPickup}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePickupSubmit}
            variant="contained"
            disabled={submittingPickup}
            startIcon={
              submittingPickup ? (
                <Iconify icon="solar:restart-bold" />
              ) : (
                <Iconify icon="solar:clock-circle-outline" />
              )
            }
          >
            {submittingPickup ? 'Requesting...' : 'Request Pickup'}
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
