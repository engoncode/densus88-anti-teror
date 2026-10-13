import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import { Icon } from '@iconify/react';

import {
  usersApi,
  rolesApi,
  workspacesApi,
  type User,
  type Workspace,
} from 'src/services/apiService';
import { useAuth } from 'src/contexts/AuthContext';

// ----------------------------------------------------------------------

export function UsersView() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role_id: 2, // Default to Operator
    workspace_id: null as number | null,
    expired: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, workspacesRes] = await Promise.all([
        usersApi.getAll(),
        rolesApi.getAll(),
        workspacesApi.getAll(),
      ]);
      console.log('Users Response:', usersRes);
      console.log('Roles Response:', rolesRes);
      console.log('Workspaces Response:', workspacesRes);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
      setWorkspaces(Array.isArray(workspacesRes.data) ? workspacesRes.data : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setUsers([]);
      setRoles([]);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditUser(user);
      setFormData({
        name: user.name,
        username: user.username,
        email: user.email,
        password: '',
        role_id: user.role.id,
        workspace_id: user.workspace?.id || null,
        expired: user.expired?.split('T')[0] || '',
      });
    } else {
      setEditUser(null);
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        role_id: 2,
        workspace_id: null,
        expired: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (editUser) {
        await usersApi.update(editUser.id, formData);
      } else {
        await usersApi.create(formData);
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleBlockToggle = async (user: User) => {
    try {
      if (user.is_blocked) {
        await usersApi.unblock(user.id);
      } else {
        await usersApi.block(user.id);
      }
      loadData();
    } catch (error) {
      console.error('Failed to toggle block status:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Users Management</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="mingcute:add-line" />}
          onClick={() => handleOpenDialog()}
        >
          New User
        </Button>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Workspace</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Expired</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Stack>
                        <Typography variant="subtitle2">{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{user.username}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.name}
                        size="small"
                        color={
                          user.role.name === 'Super Admin'
                            ? 'error'
                            : user.role.name === 'Operator'
                              ? 'primary'
                              : 'info'
                        }
                      />
                    </TableCell>
                    <TableCell>{user.workspace?.name || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_blocked ? 'Blocked' : 'Active'}
                        size="small"
                        color={user.is_blocked ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      {user.expired ? new Date(user.expired).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                        <Icon icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={user.is_blocked ? 'success' : 'error'}
                        onClick={() => handleBlockToggle(user)}
                      >
                        <Icon
                          icon={
                            user.is_blocked ? 'solar:check-circle-bold' : 'solar:close-circle-bold'
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

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editUser ? 'Edit User' : 'Create New User'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Username"
              fullWidth
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              helperText={editUser ? 'Leave empty to keep current password' : ''}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role_id}
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
            {formData.role_id === 2 && (
              <FormControl fullWidth>
                <InputLabel>Workspace (Operator only)</InputLabel>
                <Select
                  value={formData.workspace_id || ''}
                  label="Workspace (Operator only)"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workspace_id: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {workspaces.map((workspace) => (
                    <MenuItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label="Expired Date"
              type="date"
              fullWidth
              value={formData.expired}
              onChange={(e) => setFormData({ ...formData, expired: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
