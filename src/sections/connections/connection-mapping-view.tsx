import { useEffect, useState, useRef, useCallback } from 'react';
import { Network } from 'vis-network';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Share as ShareIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  AccountTree as NetworkIcon,
  TrendingUp as TrendingUpIcon,
  ShowChart as ActivityIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Iconify } from 'src/components/iconify';
import apiClient from 'src/services/apiService';

interface Node {
  id: string;
  label: string;
  value: number;
  connections: number;
  image: string | null;
}

interface Edge {
  from: string;
  to: string;
  value: number;
  label: string;
  color: string;
}

interface ConnectionStats {
  total_nodes: number;
  total_edges: number;
  avg_connections: number;
  connection_types: Record<string, number>;
}

interface ConnectionMappingViewProps {
  topicId: number;
  topicName?: string;
}

// ── Kesimpulan Modal ─────────────────────────────────────────────────────────
interface KesimpulanModalProps {
  open: boolean;
  onClose: () => void;
  stats: ConnectionStats;
  topNodes: Node[];
  aiLoading: boolean;
  aiResponse: string;
  onRegenerate: () => void;
}

function KesimpulanModal({
  open,
  onClose,
  stats,
  topNodes,
  aiLoading,
  aiResponse,
  onRegenerate,
}: KesimpulanModalProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalConnections = stats.total_edges;
  const typeColors: Record<string, string> = {
    mention: '#2196f3',
    retweet: '#4caf50',
    reply: '#ff9800',
    quote: '#9c27b0',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:document-text-bold" sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            Buat Kesimpulan
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Overview */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          <Chip
            label={`${stats.total_nodes.toLocaleString()} Pengguna`}
            color="primary"
            size="small"
          />
          <Chip
            label={`${stats.total_edges.toLocaleString()} Koneksi`}
            color="secondary"
            size="small"
          />
          <Chip
            label={`Rata-rata ${stats.avg_connections.toFixed(1)} koneksi`}
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${Object.keys(stats.connection_types).length} Tipe Interaksi`}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Top connected users */}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Iconify icon="solar:cup-star-bold" sx={{ color: 'warning.main' }} />
          Pengguna Paling Terhubung (Top 10)
        </Typography>
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Username</TableCell>
              <TableCell align="center">Koneksi</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Pengaruh</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topNodes.slice(0, 10).map((n, i) => {
              const maxConn = topNodes[0]?.connections || 1;
              return (
                <TableRow key={n.id} sx={{ bgcolor: i === 0 ? 'action.selected' : 'inherit' }}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {n.image ? (
                        <Avatar src={n.image} alt={n.label} sx={{ width: 24, height: 24 }} />
                      ) : (
                        <Avatar
                          sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}
                        >
                          {i + 1}
                        </Avatar>
                      )}
                      <Typography variant="body2" fontWeight={i < 3 ? 'bold' : 'normal'}>
                        {n.label}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="bold">
                      {n.connections}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <LinearProgress
                      variant="determinate"
                      value={(n.connections / maxConn) * 100}
                      color={i === 0 ? 'secondary' : 'primary'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Connection type breakdown */}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Iconify icon="solar:chart-2-bold" sx={{ color: 'info.main' }} />
          Distribusi Tipe Koneksi
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          {Object.entries(stats.connection_types).map(([k, v]) => (
            <Box key={k} sx={{ minWidth: 140 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" textTransform="capitalize">
                  {k}
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {v.toLocaleString('id-ID')} (
                  {totalConnections > 0 ? ((v / totalConnections) * 100).toFixed(1) : 0}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalConnections > 0 ? (v / totalConnections) * 100 : 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': { bgcolor: typeColors[k] || '#aaa' },
                }}
              />
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* AI ringkasan */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:notes-bold" sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Ringkasan Analisis
            </Typography>
            {aiLoading && <CircularProgress size={14} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Generate ulang">
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:restart-bold" />}
                onClick={onRegenerate}
                disabled={aiLoading}
              >
                Ulang
              </Button>
            </Tooltip>
            <Tooltip title={copied ? 'Disalin!' : 'Salin teks'}>
              <Button
                size="small"
                variant={copied ? 'contained' : 'outlined'}
                color={copied ? 'success' : 'primary'}
                startIcon={<Iconify icon="eva:copy-fill" />}
                onClick={onCopy}
                disabled={aiLoading || !aiResponse}
              >
                {copied ? 'Disalin!' : 'Salin'}
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: 'action.hover',
            border: 1,
            borderColor: aiLoading ? 'primary.light' : 'divider',
            borderRadius: 1,
            p: 2,
            minHeight: 120,
            fontSize: 14,
            lineHeight: 1.8,
            color: 'text.primary',
            transition: 'border-color 0.3s',
          }}
        >
          {aiLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <LinearProgress sx={{ borderRadius: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Engine sedang menganalisa data...
              </Typography>
            </Box>
          ) : aiResponse ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <Typography variant="body2" paragraph sx={{ mb: 1, color: 'text.primary' }}>
                    {children}
                  </Typography>
                ),
                h1: ({ children }) => (
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ color: 'text.primary' }}
                  >
                    {children}
                  </Typography>
                ),
                h2: ({ children }) => (
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ color: 'text.primary' }}
                  >
                    {children}
                  </Typography>
                ),
                h3: ({ children }) => (
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ color: 'text.primary' }}
                  >
                    {children}
                  </Typography>
                ),
                ul: ({ children }) => (
                  <Box component="ul" sx={{ pl: 3, mb: 1, color: 'text.primary' }}>
                    {children}
                  </Box>
                ),
                ol: ({ children }) => (
                  <Box component="ol" sx={{ pl: 3, mb: 1, color: 'text.primary' }}>
                    {children}
                  </Box>
                ),
                li: ({ children }) => (
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.5, color: 'text.primary' }}
                  >
                    {children}
                  </Typography>
                ),
                strong: ({ children }) => (
                  <Box component="span" fontWeight="bold" sx={{ color: 'text.primary' }}>
                    {children}
                  </Box>
                ),
                code: ({ children }) => (
                  <Box
                    component="code"
                    sx={{
                      bgcolor: 'action.selected',
                      color: 'text.primary',
                      px: 0.5,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontSize: '0.85em',
                      fontFamily: 'monospace',
                    }}
                  >
                    {children}
                  </Box>
                ),
                blockquote: ({ children }) => (
                  <Box
                    component="blockquote"
                    sx={{
                      borderLeft: 3,
                      borderColor: 'primary.main',
                      pl: 2,
                      ml: 0,
                      color: 'text.secondary',
                      fontStyle: 'italic',
                    }}
                  >
                    {children}
                  </Box>
                ),
                a: ({ href, children }) => (
                  <Box
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'primary.main', textDecorationColor: 'primary.main' }}
                  >
                    {children}
                  </Box>
                ),
              }}
            >
              {aiResponse}
            </ReactMarkdown>
          ) : (
            <Typography variant="body2" color="text.disabled" fontStyle="italic">
              Klik &quot;Buat Kesimpulan&quot; untuk memulai.
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="contained"
          color={copied ? 'success' : 'primary'}
          startIcon={<Iconify icon="eva:copy-fill" />}
          onClick={onCopy}
          disabled={aiLoading || !aiResponse}
        >
          {copied ? 'Disalin!' : 'Salin Kesimpulan'}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ConnectionMappingView({ topicId, topicName }: ConnectionMappingViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [connectionType, setConnectionType] = useState<string>('all');
  const [minConnections, setMinConnections] = useState(2);
  const [showStats, setShowStats] = useState(true);

  // AI summary state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const generateAI = useCallback(
    async (currentStats: ConnectionStats, currentNodes: Node[]) => {
      setAiLoading(true);
      setAiResponse('');
      try {
        const topNodes = [...currentNodes]
          .sort((a, b) => b.connections - a.connections)
          .slice(0, 10);
        const chartData = {
          topik: topicName || `Topik ${topicId}`,
          total_nodes: currentStats.total_nodes,
          total_edges: currentStats.total_edges,
          avg_connections: currentStats.avg_connections,
          connection_types: currentStats.connection_types,
          top_users: topNodes.map((n) => ({
            id: n.id,
            label: n.label,
            connections: n.connections,
          })),
        };
        const res = await apiClient.post('/chart-insights/generate', {
          topic_id: topicId,
          platform: 'tweet',
          type: 'chart_connection',
          chart_data: chartData,
          force: true,
        });
        setAiResponse(res.data.insight || '');
      } catch (err) {
        setAiResponse('Gagal mengambil analisis dari engine. Coba lagi.');
      } finally {
        setAiLoading(false);
      }
    },
    [topicId, topicName]
  );

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();

      if (period === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else {
        startDate.setMonth(endDate.getMonth() - 1);
      }

      const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const res = await apiClient.get(`/sna/connections`, {
        params: {
          topic_id: topicId,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          type: connectionType === 'all' ? '' : connectionType,
          min_connections: minConnections,
        },
      });

      const responseNodes = res.data.nodes || [];
      const responseEdges = res.data.edges || [];

      setNodes(responseNodes);
      setEdges(responseEdges);

      const connectionTypes: Record<string, number> = {};
      responseEdges.forEach((edge: Edge) => {
        connectionTypes[edge.label] = (connectionTypes[edge.label] || 0) + 1;
      });

      const avgConnections =
        responseNodes.length > 0
          ? responseNodes.reduce((sum: number, n: Node) => sum + n.connections, 0) /
            responseNodes.length
          : 0;

      setStats({
        total_nodes: responseNodes.length,
        total_edges: responseEdges.length,
        avg_connections: Math.round(avgConnections * 10) / 10,
        connection_types: connectionTypes,
      });

      renderNetwork(responseNodes, responseEdges);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setNodes([]);
      setEdges([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const renderNetwork = (nodeData: Node[], edgeData: Edge[]) => {
    if (!containerRef.current || nodeData.length === 0) return;

    const visNodes = nodeData.map((node) => ({
      id: node.id,
      label: node.label,
      value: node.connections,
      title: `${node.label}<br/>Connections: ${node.connections}`,
      image: node.image || undefined,
      shape: node.image ? 'circularImage' : 'dot',
    }));

    const visEdges = edgeData.map((edge) => ({
      from: edge.from,
      to: edge.to,
      value: edge.value,
      title: `${edge.label}: ${edge.value}x`,
      color: { color: edge.color, opacity: 0.6 },
      width: Math.max(1, edge.value / 2),
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
    }));

    containerRef.current.innerHTML = '';
    const network = new Network(
      containerRef.current,
      { nodes: visNodes, edges: visEdges },
      {
        nodes: {
          shape: 'dot',
          scaling: { min: 15, max: 50 },
          font: { size: 14, color: '#374151' },
          borderWidth: 2,
          borderWidthSelected: 4,
        },
        edges: {
          smooth: { enabled: true, type: 'continuous', roundness: 0.5 },
          font: { size: 10, color: '#6B7280', strokeWidth: 0 },
        },
        physics: {
          enabled: true,
          stabilization: { iterations: 300 },
          barnesHut: {
            gravitationalConstant: -8000,
            springLength: 150,
            springConstant: 0.04,
          },
        },
        interaction: {
          hover: true,
          tooltipDelay: 100,
          hideEdgesOnDrag: true,
        },
      }
    );

    networkRef.current = network;

    if (nodeData.length > 0) {
      const topNode = nodeData.reduce((max, node) =>
        node.connections > max.connections ? node : max
      );
      network.selectNodes([topNode.id]);
      network.focus(topNode.id, {
        scale: 1.2,
        animation: { duration: 1000, easingFunction: 'easeInOutQuad' },
      });
    }

    network.on('doubleClick', () => {
      const el = containerRef.current;
      if (!el) return;
      !document.fullscreenElement ? el.requestFullscreen?.() : document.exitFullscreen?.();
    });
  };

  const handleDownload = () => {
    const canvas = (networkRef.current as any)?.canvas?.frame?.canvas as
      | HTMLCanvasElement
      | undefined;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `connection_map_${topicId}_${Date.now()}.png`;
    link.click();
  };

  useEffect(() => {
    if (topicId) {
      fetchConnections();
    }
  }, [topicId, period, connectionType, minConnections]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <ShareIcon color="primary" /> Connection Mapping
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Interactive network of user relationships and interactions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {stats && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:document-text-bold" />}
              size="small"
              onClick={() => {
                setAiModalOpen(true);
                if (stats) generateAI(stats, nodes);
              }}
            >
              Buat Kesimpulan
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<InfoIcon />}
            onClick={() => setShowStats(!showStats)}
            size="small"
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Collapse in={showStats}>
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Users
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                        {stats.total_nodes.toLocaleString()}
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Connections
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                        {stats.total_edges.toLocaleString()}
                      </Typography>
                    </Box>
                    <NetworkIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Avg Connections
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                        {stats.avg_connections.toFixed(1)}
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Interaction Types
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                        {Object.keys(stats.connection_types).length}
                      </Typography>
                    </Box>
                    <ActivityIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Collapse>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon fontSize="small" />
              <Typography variant="body2" fontWeight="medium">
                Filters:
              </Typography>
            </Box>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => setPeriod(e.target.value as 'week' | 'month')}
              >
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={connectionType}
                label="Type"
                onChange={(e) => setConnectionType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="mention">Mentions</MenuItem>
                <MenuItem value="retweet">Retweets</MenuItem>
                <MenuItem value="reply">Replies</MenuItem>
                <MenuItem value="quote">Quotes</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="number"
              label="Min Connections"
              value={minConnections}
              onChange={(e) => setMinConnections(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: 10 }}
              sx={{ width: 150 }}
            />

            <Box sx={{ flex: 1 }} />

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchConnections}
              disabled={loading}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              startIcon={<FullscreenIcon />}
              onClick={() => containerRef.current?.requestFullscreen?.()}
            >
              Fullscreen
            </Button>

            <Button
              variant="outlined"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold">
              Connection Types:
            </Typography>
            <Chip label="Mention" sx={{ bgcolor: '#2196f3', color: 'white' }} size="small" />
            <Chip label="Quote" sx={{ bgcolor: '#9c27b0', color: 'white' }} size="small" />
            <Chip label="Retweet" sx={{ bgcolor: '#4caf50', color: 'white' }} size="small" />
            <Chip label="Reply" sx={{ bgcolor: '#ff9800', color: 'white' }} size="small" />
          </Box>
        </CardContent>
      </Card>

      {/* Network Graph */}
      <Box sx={{ position: 'relative', height: 600, mb: 3 }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 1,
            }}
          >
            <CircularProgress />
            <Typography sx={{ mt: 2 }} variant="body2">
              Mapping connections...
            </Typography>
          </Box>
        )}

        {!loading && nodes.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <ShareIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No connections found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try adjusting filters or select a different period
            </Typography>
          </Box>
        ) : (
          <Box
            ref={containerRef}
            sx={{
              width: '100%',
              height: '100%',
              border: 2,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          />
        )}
      </Box>

      {/* Connection Type Breakdown */}
      {stats && stats.connection_types && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Connection Type Distribution
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(stats.connection_types).map(([type, count]) => (
                <Grid size={{ xs: 6, sm: 3 }} key={type}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="h4" fontWeight="bold">
                      {count}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {type}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Top Connected Users */}
      {nodes.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              🏆 Top Connected Users
            </Typography>
            <Grid container spacing={2}>
              {nodes
                .sort((a, b) => b.connections - a.connections)
                .slice(0, 3)
                .map((node, idx) => (
                  <Grid size={{ xs: 12, md: 4 }} key={node.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                      }}
                    >
                      {node.image ? (
                        <Avatar src={node.image} alt={node.label} />
                      ) : (
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{idx + 1}</Avatar>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight="bold" noWrap>
                          {node.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {node.connections} connections
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Kesimpulan Modal */}
      {stats && (
        <KesimpulanModal
          open={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          stats={stats}
          topNodes={[...nodes].sort((a, b) => b.connections - a.connections)}
          aiLoading={aiLoading}
          aiResponse={aiResponse}
          onRegenerate={() => generateAI(stats, nodes)}
        />
      )}
    </Box>
  );
}
