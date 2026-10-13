// src/sections/user-management/view/users-view.tsx
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import userService, { type AdminUser, type UserStatistics } from 'src/services/userService';

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ----------------------------------------------------------------------

export function UsersView() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
  }>({
    open: false,
    user: null,
  });
  const [suspendDialog, setSuspendDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
  }>({
    open: false,
    user: null,
  });
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
  }>({
    open: false,
    user: null,
  });
  const [changeRoleDialog, setChangeRoleDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
  }>({
    open: false,
    user: null,
  });

  // Form state
  const [suspendReason, setSuspendReason] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState<'art_lover' | 'artist' | 'admin'>('art_lover');
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
      const data = await userService.getStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }, []);

  const loadUsers = useCallback(async (page = 1, search = '', role = 'all', status = 'all') => {
    try {
      setLoading(true);
      const response = await userService.getUsers({
        page,
        search: search || undefined,
        role: role !== 'all' ? role : undefined,
        status: status !== 'all' ? status : undefined,
      });
      setUsers(response.data.data);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
    loadUsers();
  }, [loadStatistics, loadUsers]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers(1, searchQuery, roleFilter, statusFilter);
  };

  const handleFilterChange = (newRole: string, newStatus: string) => {
    setRoleFilter(newRole);
    setStatusFilter(newStatus);
    setCurrentPage(1);
    loadUsers(1, searchQuery, newRole, newStatus);
  };

  const handlePageChange = (_: any, page: number) => {
    setCurrentPage(page);
    loadUsers(page, searchQuery, roleFilter, statusFilter);
  };

  const handleViewDetail = async (user: AdminUser) => {
    try {
      const fullUser = await userService.getUser(user.id);
      setDetailDialog({ open: true, user: fullUser });
    } catch (error) {
      console.error('Failed to load user detail:', error);
    }
  };

  const handleSuspend = async () => {
    if (!suspendDialog.user) return;
    try {
      setSubmitting(true);
      await userService.suspendUser(suspendDialog.user.id, suspendReason);
      setSnackbar({ open: true, message: 'User suspended successfully', severity: 'success' });
      setSuspendDialog({ open: false, user: null });
      setSuspendReason('');
      loadUsers(currentPage, searchQuery, roleFilter, statusFilter);
      loadStatistics();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to suspend user',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnsuspend = async (user: AdminUser) => {
    try {
      await userService.unsuspendUser(user.id);
      setSnackbar({ open: true, message: 'User unsuspended successfully', severity: 'success' });
      loadUsers(currentPage, searchQuery, roleFilter, statusFilter);
      loadStatistics();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to unsuspend user',
        severity: 'error',
      });
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordDialog.user) return;
    try {
      setSubmitting(true);
      await userService.resetPassword(resetPasswordDialog.user.id, newPassword);
      setSnackbar({ open: true, message: 'Password reset successfully', severity: 'success' });
      setResetPasswordDialog({ open: false, user: null });
      setNewPassword('');
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to reset password',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async () => {
    if (!changeRoleDialog.user) return;
    try {
      setSubmitting(true);
      await userService.changeRole(changeRoleDialog.user.id, newRole);
      setSnackbar({ open: true, message: 'Role changed successfully', severity: 'success' });
      setChangeRoleDialog({ open: false, user: null });
      loadUsers(currentPage, searchQuery, roleFilter, statusFilter);
      loadStatistics();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to change role',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleChip = (role: string) => {
    switch (role) {
      case 'admin':
        return <Chip label="Admin" size="small" color="error" />;
      case 'artist':
        return <Chip label="Artist" size="small" color="primary" />;
      default:
        return <Chip label="Art Lover" size="small" color="default" />;
    }
  };

  const getStatusChip = (user: AdminUser) => {
    if (user.suspended_at) {
      return <Chip label="Suspended" size="small" color="error" />;
    }
    if (user.email_verified_at) {
      return <Chip label="Verified" size="small" color="success" />;
    }
    return <Chip label="Unverified" size="small" color="warning" />;
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4">User Management</Typography>
      </Stack>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Users
                </Typography>
                {statistics ? (
                  <Typography variant="h4">{statistics.total_users}</Typography>
                ) : (
                  <Skeleton width={60} height={40} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Art Lovers
                </Typography>
                {statistics ? (
                  <Typography variant="h4">{statistics.art_lovers}</Typography>
                ) : (
                  <Skeleton width={60} height={40} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Artists
                </Typography>
                {statistics ? (
                  <Typography variant="h4" color="primary.main">
                    {statistics.artists}
                  </Typography>
                ) : (
                  <Skeleton width={60} height={40} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Admins
                </Typography>
                {statistics ? (
                  <Typography variant="h4" color="error.main">
                    {statistics.admins}
                  </Typography>
                ) : (
                  <Skeleton width={60} height={40} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Suspended
                </Typography>
                {statistics ? (
                  <Typography variant="h4" color="warning.main">
                    {statistics.suspended_users}
                  </Typography>
                ) : (
                  <Skeleton width={60} height={40} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  New (Month)
                </Typography>
                {statistics ? (
                  <Typography variant="h4" color="success.main">
                    {statistics.new_users_this_month}
                  </Typography>
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
              placeholder="Search by name or email..."
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
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => handleFilterChange(e.target.value, statusFilter)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="art_lover">Art Lover</MenuItem>
                <MenuItem value="artist">Artist</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => handleFilterChange(roleFilter, e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
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
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar src={user.avatar || ''} alt={user.name}>
                          {user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle2">{user.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>{getRoleChip(user.role)}</TableCell>
                    <TableCell>{getStatusChip(user)}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(user.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetail(user)}>
                          <Icon icon="solar:eye-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Change Role">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setNewRole(user.role);
                            setChangeRoleDialog({ open: true, user });
                          }}
                        >
                          <Icon icon="solar:user-check-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Password">
                        <IconButton
                          size="small"
                          onClick={() => setResetPasswordDialog({ open: true, user })}
                        >
                          <Icon icon="solar:key-bold" />
                        </IconButton>
                      </Tooltip>
                      {user.suspended_at ? (
                        <Tooltip title="Unsuspend">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleUnsuspend(user)}
                          >
                            <Icon icon="solar:check-circle-bold" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Suspend">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setSuspendDialog({ open: true, user })}
                            disabled={user.role === 'admin'}
                          >
                            <Icon icon="solar:close-circle-bold" />
                          </IconButton>
                        </Tooltip>
                      )}
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

      {/* Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, user: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {detailDialog.user && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar src={detailDialog.user.avatar || ''} sx={{ width: 64, height: 64 }}>
                  {detailDialog.user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{detailDialog.user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detailDialog.user.email}
                  </Typography>
                </Box>
              </Stack>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Role
                </Typography>
                {getRoleChip(detailDialog.user.role)}
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                {getStatusChip(detailDialog.user)}
                {detailDialog.user.suspension_reason && (
                  <Typography variant="caption" display="block" color="error">
                    Reason: {detailDialog.user.suspension_reason}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body2">{detailDialog.user.phone || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body2">{detailDialog.user.address || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Joined
                </Typography>
                <Typography variant="body2">{formatDate(detailDialog.user.created_at)}</Typography>
              </Box>
              {detailDialog.user.orders_count !== undefined && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="body2">{detailDialog.user.orders_count}</Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, user: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog
        open={suspendDialog.open}
        onClose={() => setSuspendDialog({ open: false, user: null })}
      >
        <DialogTitle>Suspend User</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to suspend <strong>{suspendDialog.user?.name}</strong>?
          </Typography>
          <TextField
            fullWidth
            label="Reason for suspension"
            required
            multiline
            rows={3}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialog({ open: false, user: null })}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSuspend}
            disabled={submitting || !suspendReason}
          >
            {submitting ? 'Suspending...' : 'Suspend'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialog.open}
        onClose={() => setResetPasswordDialog({ open: false, user: null })}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Set a new password for <strong>{resetPasswordDialog.user?.name}</strong>
          </Typography>
          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Icon icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="Minimum 8 characters"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleResetPassword}
            disabled={submitting || newPassword.length < 8}
          >
            {submitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog
        open={changeRoleDialog.open}
        onClose={() => setChangeRoleDialog({ open: false, user: null })}
      >
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Change role for <strong>{changeRoleDialog.user?.name}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              label="Role"
              onChange={(e) => setNewRole(e.target.value as 'art_lover' | 'artist' | 'admin')}
            >
              <MenuItem value="art_lover">Art Lover</MenuItem>
              <MenuItem value="artist">Artist</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangeRoleDialog({ open: false, user: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleChangeRole} disabled={submitting}>
            {submitting ? 'Changing...' : 'Change Role'}
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
