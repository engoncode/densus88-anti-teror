import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';

import { paymentSimulatorService, type SimulatorOrder } from 'src/services/paymentSimulatorService';

// ----------------------------------------------------------------------

export function PaymentSimulatorView() {
  const [orders, setOrders] = useState<SimulatorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SimulatorOrder | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Simulate dialog
  const [simulateDialogOpen, setSimulateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SimulatorOrder | null>(null);
  const [simulateAmount, setSimulateAmount] = useState<number>(0);
  const [simulating, setSimulating] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const fetchRecentOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await paymentSimulatorService.getRecentOrders();
      setOrders(response.orders || []);
    } catch (error: any) {
      console.error('Failed to fetch recent orders:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch recent orders',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      setSearchResult(null);

      // Detect if it's VA number or order number
      const isVaNumber = searchQuery.length > 10 && /^\d+$/.test(searchQuery);
      const params = isVaNumber ? { va_number: searchQuery } : { order_number: searchQuery };

      const response = await paymentSimulatorService.searchOrder(params);
      setSearchResult(response.order || null);
    } catch (error: any) {
      setSearchError(error.response?.data?.message || 'Order not found');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOpenSimulateDialog = (order: SimulatorOrder) => {
    setSelectedOrder(order);
    setSimulateAmount(order.amount);
    setSimulateDialogOpen(true);
  };

  const handleCloseSimulateDialog = () => {
    setSimulateDialogOpen(false);
    setSelectedOrder(null);
    setSimulateAmount(0);
  };

  const handleSimulatePayment = async () => {
    if (!selectedOrder) return;

    try {
      setSimulating(true);
      const response = await paymentSimulatorService.simulatePayment(
        selectedOrder.order_number,
        simulateAmount
      );

      setSnackbar({
        open: true,
        message: response.message || 'Payment simulation sent successfully!',
        severity: 'success',
      });

      handleCloseSimulateDialog();

      // Refresh after a delay to allow webhook processing
      setTimeout(() => {
        fetchRecentOrders();
      }, 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Simulation failed',
        severity: 'error',
      });
    } finally {
      setSimulating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
      case 'failed':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getBankIcon = (bank: string) => {
    switch (bank?.toLowerCase()) {
      case 'bca':
        return 'simple-icons:bca';
      case 'bni':
        return 'simple-icons:bni';
      case 'bri':
        return 'simple-icons:bri';
      case 'mandiri':
        return 'simple-icons:mandiri';
      default:
        return 'solar:card-bold-duotone';
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Payment Simulator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Simulate Xendit Virtual Account payments for testing purposes (Development/Staging only)
        </Typography>
      </Box>

      {/* Warning Alert */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>Development Tool:</strong> This simulator sends real requests to Xendit sandbox API.
        Only use this in development or staging environments.
      </Alert>

      {/* Search Section */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Search Order
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter VA Number or Order Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="solar:magnifer-bold-duotone" width={20} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searchLoading || !searchQuery.trim()}
            sx={{ minWidth: 120 }}
          >
            {searchLoading ? <CircularProgress size={20} /> : 'Search'}
          </Button>
        </Stack>

        {/* Search Result */}
        {searchError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {searchError}
          </Alert>
        )}

        {searchResult && (
          <Card variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'background.neutral' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Icon icon={getBankIcon(searchResult.bank)} width={24} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {searchResult.order_number}
                  </Typography>
                  <Label color={getStatusColor(searchResult.payment_status)}>
                    {searchResult.payment_status}
                  </Label>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  VA: {searchResult.va_number} • Customer: {searchResult.customer}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {searchResult.amount_formatted}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="success"
                startIcon={<Icon icon="solar:card-send-bold-duotone" />}
                onClick={() => handleOpenSimulateDialog(searchResult)}
                disabled={searchResult.payment_status !== 'pending'}
              >
                Simulate Payment
              </Button>
            </Stack>
          </Card>
        )}
      </Card>

      {/* Recent Pending Orders */}
      <Card>
        <Box sx={{ p: 3, pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Recent Pending Orders</Typography>
            <Button
              size="small"
              startIcon={<Icon icon="solar:refresh-bold-duotone" />}
              onClick={fetchRecentOrders}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>VA Number</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Box>
                      <Icon
                        icon="solar:clipboard-check-bold-duotone"
                        width={48}
                        style={{ opacity: 0.5 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        No pending orders found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {order.order_number}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Icon icon={getBankIcon(order.bank)} width={20} />
                        <span>{order.bank?.toUpperCase()}</span>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {order.va_number}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {order.amount_formatted}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Label color={getStatusColor(order.payment_status)}>
                        {order.payment_status}
                      </Label>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Simulate Payment">
                        <IconButton
                          color="success"
                          onClick={() => handleOpenSimulateDialog(order)}
                          disabled={order.payment_status !== 'pending'}
                        >
                          <Icon icon="solar:card-send-bold-duotone" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Simulate Payment Dialog */}
      <Dialog open={simulateDialogOpen} onClose={handleCloseSimulateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon icon="solar:card-send-bold-duotone" width={24} />
            <span>Simulate Payment</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                This will send a payment simulation request to Xendit sandbox API. The webhook will
                be triggered automatically.
              </Alert>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Order Number
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedOrder.order_number}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Virtual Account
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedOrder.bank?.toUpperCase()} - {selectedOrder.va_number}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body1">{selectedOrder.customer}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Expected Amount
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {selectedOrder.amount_formatted}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Simulate Amount"
                  type="number"
                  value={simulateAmount}
                  onChange={(e) => setSimulateAmount(Number(e.target.value))}
                  helperText="You can simulate a different amount to test partial/over payment scenarios"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                />

                {simulateAmount !== selectedOrder.amount && (
                  <Alert severity="warning">
                    {simulateAmount < selectedOrder.amount
                      ? `Underpayment: Rp ${(selectedOrder.amount - simulateAmount).toLocaleString('id-ID')}`
                      : `Overpayment: Rp ${(simulateAmount - selectedOrder.amount).toLocaleString('id-ID')}`}
                  </Alert>
                )}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseSimulateDialog} disabled={simulating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSimulatePayment}
            disabled={simulating || simulateAmount <= 0}
            startIcon={
              simulating ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Icon icon="solar:card-send-bold-duotone" />
              )
            }
          >
            {simulating ? 'Simulating...' : 'Simulate Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
