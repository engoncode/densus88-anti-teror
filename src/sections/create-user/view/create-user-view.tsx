import { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';

import { usersApi, rolesApi, type User } from 'src/services/apiService';
import { useAuth } from 'src/contexts/AuthContext';

// Roles that an Operator is allowed to create
const ALLOWED_ROLE_NAMES = ['Operator', 'Viewer'];

// ----------------------------------------------------------------------

export function CreateUserView() {
  const { user: authUser } = useAuth();
  const operatorWorkspaceId = authUser?.workspace?.id ?? null;
  const operatorWorkspaceName = authUser?.workspace?.name ?? '-';

  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Edit dialog state
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editData, setEditData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role_id: 0,
    expired: '',
  });
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const defaultFormData = useCallback(
    (roleId: number) => ({
      name: '',
      username: '',
      email: '',
      password: '',
      role_id: roleId,
      expired: '',
    }),
    []
  );

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role_id: 0,
    expired: '',
  });

  const loadRoles = useCallback(async () => {
    try {
      const rolesRes = await rolesApi.getAll();
      const allRoles: Array<{ id: number; name: string }> = Array.isArray(rolesRes.data)
        ? rolesRes.data
        : [];
      const filteredRoles = allRoles.filter((r) => ALLOWED_ROLE_NAMES.includes(r.name));
      setRoles(filteredRoles);
      const defaultRole = filteredRoles.find((r) => r.name === 'Operator');
      if (defaultRole) {
        setFormData((prev) => ({ ...prev, role_id: defaultRole.id }));
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await usersApi.getAll();
      const allUsers: User[] = Array.isArray(res.data) ? res.data : [];
      // Filter users belonging to the operator's workspace
      const filtered = allUsers.filter(
        (u) => u.workspace?.id === operatorWorkspaceId
      );
      setUsers(filtered);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [operatorWorkspaceId]);

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, [loadRoles, loadUsers]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.role_id) {
      setSnackbar({ open: true, message: 'Harap isi semua field yang wajib diisi.', severity: 'error' });
      return;
    }

    try {
      setLoadingForm(true);
      await usersApi.create({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role_id: formData.role_id,
        workspace_id: operatorWorkspaceId,
        expired: formData.expired || undefined,
      });

      setSnackbar({ open: true, message: 'User berhasil dibuat!', severity: 'success' });
      const defaultRole = roles.find((r) => r.name === 'Operator');
      setFormData(defaultFormData(defaultRole?.id || 0));
      loadUsers();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Gagal membuat user.';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setLoadingForm(false);
    }
  };

  const handleOpenEdit = (u: User) => {
    setEditUser(u);
    setEditData({
      name: u.name,
      username: u.username,
      email: u.email,
      password: '',
      role_id: u.role.id,
      expired: u.expired ? u.expired.split('T')[0] : '',
    });
  };

  const handleCloseEdit = () => {
    setEditUser(null);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      setLoadingEdit(true);
      await usersApi.update(editUser.id, {
        name: editData.name,
        username: editData.username,
        email: editData.email,
        ...(editData.password ? { password: editData.password } : {}),
        role_id: editData.role_id,
        workspace_id: operatorWorkspaceId,
        expired: editData.expired || undefined,
      });
      setSnackbar({ open: true, message: 'User berhasil diperbarui!', severity: 'success' });
      handleCloseEdit();
      loadUsers();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Gagal memperbarui user.';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleBlockToggle = async (u: User) => {
    try {
      if (u.is_blocked) {
        await usersApi.unblock(u.id);
      } else {
        await usersApi.block(u.id);
      }
      loadUsers();
    } catch (error) {
      console.error('Failed to toggle block:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h4">Buat User Baru</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Workspace: <strong>{operatorWorkspaceName}</strong> — hanya dapat membuat user dengan
            role Operator atau Viewer.
          </Typography>
        </Box>
      </Stack>

      {/* Form */}
      <Card sx={{ p: 4, mb: 5 }}>
        <Typography variant="h6" mb={3}>
          Form Buat User
        </Typography>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Nama Lengkap"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Username"
              fullWidth
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role_id || ''}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Workspace"
              fullWidth
              value={operatorWorkspaceName}
              InputProps={{ readOnly: true }}
              helperText="Otomatis dari workspace Anda"
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <TextField
              label="Tanggal Kedaluwarsa"
              type="date"
              sx={{ minWidth: 220 }}
              value={formData.expired}
              onChange={(e) => setFormData({ ...formData, expired: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<Icon icon="mingcute:add-line" />}
              onClick={handleSubmit}
              disabled={loadingForm}
              sx={{ height: 56, px: 4 }}
            >
              {loadingForm ? 'Menyimpan...' : 'Buat User'}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Users List */}
      <Typography variant="h6" mb={2}>
        Daftar User — {operatorWorkspaceName}
      </Typography>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nama</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Kedaluwarsa</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingUsers ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Belum ada user di workspace ini.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Stack>
                        <Typography variant="subtitle2">{u.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{u.username}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role.name}
                        size="small"
                        color={u.role.name === 'Operator' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.is_blocked ? 'Diblokir' : 'Aktif'}
                        size="small"
                        color={u.is_blocked ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      {u.expired ? new Date(u.expired).toLocaleDateString('id-ID') : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="default"
                        title="Edit"
                        onClick={() => handleOpenEdit(u)}
                      >
                        <Icon icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={u.is_blocked ? 'success' : 'error'}
                        title={u.is_blocked ? 'Aktifkan' : 'Blokir'}
                        onClick={() => handleBlockToggle(u)}
                      >
                        <Icon
                          icon={
                            u.is_blocked
                              ? 'solar:check-circle-bold'
                              : 'solar:close-circle-bold'
                          }
                        />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Nama Lengkap"
                fullWidth
                required
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
              <TextField
                label="Username"
                fullWidth
                required
                value={editData.username}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
              <TextField
                label="Password Baru"
                type="password"
                fullWidth
                value={editData.password}
                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                helperText="Kosongkan jika tidak ingin mengubah password"
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editData.role_id || ''}
                  label="Role"
                  onChange={(e) => setEditData({ ...editData, role_id: Number(e.target.value) })}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Tanggal Kedaluwarsa"
                type="date"
                fullWidth
                value={editData.expired}
                onChange={(e) => setEditData({ ...editData, expired: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseEdit}>Batal</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={loadingEdit}>
            {loadingEdit ? 'Menyimpan...' : 'Simpan'}
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
