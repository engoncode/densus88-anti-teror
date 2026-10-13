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
  IconButton,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import { Icon } from '@iconify/react';

import { workspacesApi, usersApi, type Workspace, type User } from 'src/services/apiService';
import topicsApi, { type Topic } from 'src/services/topicsService';
import { useAuth } from 'src/contexts/AuthContext';

// ----------------------------------------------------------------------

export function WorkspacesView() {
  const { isSuperAdmin } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [assignedAnalysts, setAssignedAnalysts] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [workspacesRes, usersRes, topicsRes] = await Promise.all([
        workspacesApi.getAll(),
        usersApi.getAll(),
        topicsApi.getAllTopics(),
      ]);
      console.log('Workspaces Response:', workspacesRes);
      console.log('Users Response:', usersRes);
      console.log('Topics Response:', topicsRes);

      const topicsData = (topicsRes.data as any)?.data || topicsRes.data;

      setWorkspaces(Array.isArray(workspacesRes.data) ? workspacesRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setWorkspaces([]);
      setUsers([]);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDialog = (workspace?: Workspace) => {
    if (workspace) {
      setEditWorkspace(workspace);
      setFormData({
        name: workspace.name,
      });
    } else {
      setEditWorkspace(null);
      setFormData({
        name: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditWorkspace(null);
  };

  const handleSubmit = async () => {
    try {
      if (editWorkspace) {
        await workspacesApi.update(editWorkspace.id, formData);
      } else {
        await workspacesApi.create(formData);
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Failed to save workspace:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      try {
        await workspacesApi.delete(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete workspace:', error);
      }
    }
  };

  const handleOpenAssignDialog = async (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setSelectedUsers([]);
    setAssignedAnalysts([]);
    setOpenAssignDialog(true);

    // Load already assigned analysts
    try {
      const response = await workspacesApi.getAnalysts(workspace.id);
      const analysts = response.data || [];
      setAssignedAnalysts(analysts);
      setSelectedUsers(analysts.map((a: User) => a.id));
    } catch (error) {
      console.error('Failed to load assigned analysts:', error);
    }
  };

  const handleAssignUsers = async () => {
    if (!selectedWorkspace) return;
    try {
      // Use assignAnalysts for many-to-many relationship
      await workspacesApi.assignAnalysts(selectedWorkspace.id, selectedUsers);
      setOpenAssignDialog(false);
      loadData();
    } catch (error) {
      console.error('Failed to assign analysts:', error);
    }
  };

  const analystUsers = users.filter((user) => user.role.name === 'Analyst');

  const getActiveTopicsCount = (workspaceId: number) => {
    return topics.filter((topic) => topic.workspace_id === workspaceId && topic.monitoring === 'Y')
      .length;
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Workspaces Management</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="mingcute:add-line" />}
          onClick={() => handleOpenDialog()}
        >
          New Workspace
        </Button>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Active Topics</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                workspaces.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{workspace.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getActiveTopicsCount(workspace.id)}
                        size="small"
                        color="success"
                      />
                    </TableCell>
                    <TableCell>{new Date(workspace.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      {isSuperAdmin && (
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenAssignDialog(workspace)}
                        >
                          <Icon icon="solar:users-group-rounded-bold" />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => handleOpenDialog(workspace)}>
                        <Icon icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(workspace.id)}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" />
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
        <DialogTitle>{editWorkspace ? 'Edit Workspace' : 'Create New Workspace'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editWorkspace ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Analysts Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Analysts to {selectedWorkspace?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {assignedAnalysts.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Currently Assigned Analysts:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {assignedAnalysts.map((analyst) => (
                    <Chip
                      key={analyst.id}
                      label={analyst.name}
                      size="small"
                      color="primary"
                      variant="outlined"
                      onDelete={() => {
                        setSelectedUsers((prev) => prev.filter((id) => id !== analyst.id));
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
            <FormControl fullWidth>
              <InputLabel>Select Analysts</InputLabel>
              <Select
                multiple
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(e.target.value as number[])}
                input={<OutlinedInput label="Select Analysts" />}
                renderValue={(selected) =>
                  selected.map((id) => analystUsers.find((u) => u.id === id)?.name).join(', ')
                }
              >
                {analystUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignUsers} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
