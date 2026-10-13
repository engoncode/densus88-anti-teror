import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import { Icon } from '@iconify/react';

import { workspacesApi, type Workspace } from 'src/services/apiService';
import topicsApi, { type Topic } from 'src/services/topicsService';

// ----------------------------------------------------------------------

export function AnalystWorkspacesView() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [workspacesRes, topicsRes] = await Promise.all([
        workspacesApi.getAll(),
        topicsApi.getAll(),
      ]);
      console.log('Workspaces Response:', workspacesRes);
      console.log('Topics Response:', topicsRes);

      const topicsData = (topicsRes.data as any)?.data || topicsRes.data;

      setWorkspaces(Array.isArray(workspacesRes.data) ? workspacesRes.data : []);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setWorkspaces([]);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getActiveTopicsCount = (workspaceId: number) => {
    return topics.filter((topic) => topic.workspace_id === workspaceId && topic.monitoring === 'Y')
      .length;
  };

  const getTotalTopicsCount = (workspaceId: number) => {
    return topics.filter((topic) => topic.workspace_id === workspaceId).length;
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">My Workspaces</Typography>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Workspace Name</TableCell>
                <TableCell>Total Topics</TableCell>
                <TableCell>Active Topics</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : workspaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      You are not assigned to any workspace yet. Please contact your administrator.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                workspaces.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{workspace.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={getTotalTopicsCount(workspace.id)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getActiveTopicsCount(workspace.id)}
                        size="small"
                        color="success"
                      />
                    </TableCell>
                    <TableCell>{new Date(workspace.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
}
