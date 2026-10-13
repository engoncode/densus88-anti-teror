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
  Avatar,
  Stack,
  Tooltip,
} from '@mui/material';
import { Icon } from '@iconify/react';
import dayjs, { Dayjs } from 'dayjs';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  activityLogService,
  ActivityLog,
  ActivityLogStatistics,
} from '../../services/activityLogService';

export default function ActivityLogsView() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [statistics, setStatistics] = useState<ActivityLogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  // Dialogs
  const [detailDialog, setDetailDialog] = useState<ActivityLog | null>(null);
  const [cleanupDialog, setCleanupDialog] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(90);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await activityLogService.getActivityLogs({
        page: page + 1,
        per_page: rowsPerPage,
        search: search || undefined,
        action: actionFilter || undefined,
        start_date: startDate?.format('YYYY-MM-DD'),
        end_date: endDate?.format('YYYY-MM-DD'),
      });
      setLogs(response.data || []);
      setTotalRows(response.total || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, actionFilter, startDate, endDate]);

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await activityLogService.getStatistics(
        startDate?.format('YYYY-MM-DD'),
        endDate?.format('YYYY-MM-DD')
      );
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, [startDate, endDate]);

  const fetchActions = async () => {
    try {
      const actions = await activityLogService.getActions();
      setAvailableActions(actions);
    } catch (error) {
      console.error('Error fetching actions:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // TODO: Uncomment when backend statistics endpoint is ready
  // useEffect(() => {
  //   fetchStatistics();
  // }, [fetchStatistics]);

  // TODO: Uncomment when backend actions endpoint is ready
  // useEffect(() => {
  //   fetchActions();
  // }, []);

  const handleCleanup = async () => {
    try {
      await activityLogService.cleanup(cleanupDays);
      setCleanupDialog(false);
      fetchLogs();
      fetchStatistics();
    } catch (error) {
      console.error('Error cleaning up logs:', error);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('approve')) return 'success';
    if (action.includes('delete') || action.includes('reject')) return 'error';
    if (action.includes('update') || action.includes('edit')) return 'warning';
    return 'default';
  };

  const formatProperties = (properties: Record<string, any> | null) => {
    if (!properties) return '-';
    return JSON.stringify(properties, null, 2);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Activity Logs</Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Icon icon="solar:trash-bin-minimalistic-bold" />}
          onClick={() => setCleanupDialog(true)}
        >
          Cleanup Old Logs
        </Button>
      </Stack>

      {/* Statistics Cards */}
      {statistics && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Activities
            </Typography>
            <Typography variant="h4">{statistics.total_activities}</Typography>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Top Actions
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {Object.entries(statistics.by_action)
                .slice(0, 3)
                .map(([action, count]) => (
                  <Stack key={action} direction="row" justifyContent="space-between">
                    <Typography variant="body2">{action}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {count as number}
                    </Typography>
                  </Stack>
                ))}
            </Stack>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Most Active Admins
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {statistics.most_active_admins.slice(0, 3).map((admin) => (
                <Stack
                  key={admin.user_id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar src={admin.user?.avatar || undefined} sx={{ width: 20, height: 20 }}>
                      {admin.user?.name?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">{admin.user?.name || 'Unknown'}</Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight="bold">
                    {admin.count}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Recent Activity
            </Typography>
            <Typography variant="h4">
              {statistics?.by_day ? Object.keys(statistics.by_day).length : 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Active days in period
            </Typography>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search logs..."
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={actionFilter}
              label="Action"
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <MenuItem value="">All Actions</MenuItem>
              {availableActions.map((action) => (
                <MenuItem key={action} value={action}>
                  {action}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            type="date"
            label="Start Date"
            value={startDate?.format('YYYY-MM-DD') || ''}
            onChange={(e) => setStartDate(e.target.value ? dayjs(e.target.value) : null)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label="End Date"
            value={endDate?.format('YYYY-MM-DD') || ''}
            onChange={(e) => setEndDate(e.target.value ? dayjs(e.target.value) : null)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>User Agent</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    No activity logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {log.user?.name?.charAt(0) || log.username?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {log.user?.name || log.username || 'System'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{log.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action.replace('_', ' ')}
                        color={getActionColor(log.action)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {log.ip_address || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 150 }}
                      >
                        {log.user_agent ? log.user_agent.substring(0, 50) + '...' : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(log.tanggal_action).format('DD MMM YYYY HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setDetailDialog(log)}>
                          <Icon icon="solar:eye-bold" />
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
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>Activity Log Details</DialogTitle>
        <DialogContent>
          {detailDialog && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  User
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {detailDialog.user?.name?.charAt(0) || detailDialog.username?.charAt(0) || '?'}
                  </Avatar>
                  <Box>
                    <Typography>
                      {detailDialog.user?.name || detailDialog.username || 'System'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{detailDialog.username} (ID: {detailDialog.user_id})
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Action
                </Typography>
                <Chip
                  label={detailDialog.action.replace('_', ' ')}
                  color={getActionColor(detailDialog.action)}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography>
                  {dayjs(detailDialog.tanggal_action).format('DD MMMM YYYY HH:mm:ss')}
                </Typography>
              </Box>
              {detailDialog.target_type && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Target
                  </Typography>
                  <Typography>
                    {detailDialog.target_type} #{detailDialog.target_id}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Metadata
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    bgcolor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 200,
                    fontSize: 12,
                  }}
                >
                  {formatProperties(detailDialog.metadata)}
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  IP Address
                </Typography>
                <Typography>{detailDialog.ip_address || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  User Agent
                </Typography>
                <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                  {detailDialog.user_agent || '-'}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cleanup Dialog */}
      <Dialog open={cleanupDialog} onClose={() => setCleanupDialog(false)}>
        <DialogTitle>Cleanup Old Logs</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will permanently delete activity logs older than the specified number of days.
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Days to keep"
            value={cleanupDays}
            onChange={(e) => setCleanupDays(Number(e.target.value))}
            inputProps={{ min: 30, max: 365 }}
            helperText="Logs older than this will be deleted (minimum 30 days)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCleanupDialog(false)}>Cancel</Button>
          <Button onClick={handleCleanup} color="error" variant="contained">
            Delete Old Logs
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
