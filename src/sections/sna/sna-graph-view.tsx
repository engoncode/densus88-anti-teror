import { useEffect, useRef, useState, useCallback } from 'react';
import { Network } from 'vis-network';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Iconify } from 'src/components/iconify';
import apiClient from 'src/services/apiService';

interface Node {
  id: string;
  label: string;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
  value?: number;
  tweet_id: string;
}

interface SnaGraphViewProps {
  topicId: number;
  topicName?: string;
}

interface SnaStats {
  totalNodes: number;
  totalEdges: number;
  topNodes: { id: string; degree: number; inDegree: number; outDegree: number }[];
  typeCounts: Record<string, number>;
  dateFrom: string;
  dateTo: string;
}

const typeColors: Record<string, string> = {
  mention: '#2196f3',
  retweet: '#4caf50',
  reply: '#ff9800',
  quote: '#f44336',
};

const normalize = (l?: string) => (l && typeColors[l.toLowerCase()] ? l.toLowerCase() : 'mention');

function daysAgoISO(d: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString().slice(0, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function htmlTitle(username: string, text: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = `<strong>@${username}</strong><br>${text ?? ''}`;
  el.style.whiteSpace = 'pre-wrap';
  el.style.wordBreak = 'break-word';
  el.style.maxWidth = '300px';
  return el;
}

export function SnaGraphView({ topicId, topicName }: SnaGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const edgesRef = useRef<Edge[]>([]);
  const tweetCache = useRef<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');
  const [from, setFrom] = useState<string>(daysAgoISO(30));
  const [to, setTo] = useState<string>(todayISO());
  const [minWeight, setMinWeight] = useState(1);
  const [snaStats, setSnaStats] = useState<SnaStats | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');

  const generateAI = useCallback(
    async (stats: SnaStats) => {
      setAiLoading(true);
      setAiResponse('');
      try {
        const totalInteractions = Object.values(stats.typeCounts).reduce((a, b) => a + b, 0);
        const chartData = {
          topik: topicName || 'Tidak diketahui',
          periode: `${stats.dateFrom} sampai ${stats.dateTo}`,
          total_pengguna: stats.totalNodes,
          total_interaksi: stats.totalEdges,
          akun_berpengaruh: stats.topNodes.slice(0, 5).map((n) => ({
            username: n.id,
            degree: n.degree,
            interaksi_masuk: n.inDegree,
            interaksi_keluar: n.outDegree,
          })),
          distribusi_tipe_interaksi: Object.fromEntries(
            Object.entries(stats.typeCounts).map(([k, v]) => [
              k,
              {
                jumlah: v,
                persentase:
                  totalInteractions > 0 ? `${((v / totalInteractions) * 100).toFixed(1)}%` : '0%',
              },
            ])
          ),
        };
        const { data } = await apiClient.post('/chart-insights/generate', {
          topic_id: topicId,
          platform: 'tweet',
          type: 'chart_sna',
          chart_data: chartData,
          force: true,
        });
        setAiResponse(data.insight || 'Tidak ada respons dari AI.');
      } catch {
        setAiResponse('Gagal menghubungi AI service. Pastikan Qwen server berjalan di VPS.');
      } finally {
        setAiLoading(false);
      }
    },
    [topicId, topicName]
  );

  const ensurePopup = useCallback(async (tweetId: string, nodeId: string) => {
    const netAny = networkRef.current as any;
    if (!netAny) return;

    let text = tweetCache.current[tweetId];
    if (!text) {
      try {
        const { data } = await apiClient.get(`/sna/tweet/${tweetId}`);
        text = data.text ?? '';
        tweetCache.current[tweetId] = text;
      } catch {
        text = '(failed to fetch tweet)';
      }
    }

    netAny.body.data.nodes.update({ id: nodeId, title: htmlTitle(nodeId, text) });
    netAny.showPopup?.(nodeId);
  }, []);

  const handleDownload = () => {
    const canvas = (networkRef.current as any)?.canvas?.frame?.canvas as
      | HTMLCanvasElement
      | undefined;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `sna_${topicId}_${Date.now()}.png`;
    link.click();
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/sna`, {
        params: { topic_id: topicId, type, from, to },
      });

      edgesRef.current = data.edges as Edge[];

      const nodeMap: Record<string, Node> = {};
      (data.nodes as Node[]).forEach((n) => (nodeMap[n.id] = n));
      const uniqueNodes = Object.values(nodeMap);
      const degree: Record<string, number> = {};
      const inDegree: Record<string, number> = {};
      const outDegree: Record<string, number> = {};
      const typeCounts: Record<string, number> = { mention: 0, retweet: 0, reply: 0, quote: 0 };
      (data.edges as Edge[]).forEach((e) => {
        degree[e.from] = (degree[e.from] || 0) + 1;
        degree[e.to] = (degree[e.to] || 0) + 1;
        outDegree[e.from] = (outDegree[e.from] || 0) + 1;
        inDegree[e.to] = (inDegree[e.to] || 0) + 1;
        const t = normalize(e.label);
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });

      // Compute top 10 influencers
      const topNodes = uniqueNodes
        .map((n) => ({
          id: n.id,
          degree: degree[n.id] || 0,
          inDegree: inDegree[n.id] || 0,
          outDegree: outDegree[n.id] || 0,
        }))
        .sort((a, b) => b.degree - a.degree)
        .slice(0, 10);

      setSnaStats({
        totalNodes: uniqueNodes.length,
        totalEdges: (data.edges as Edge[]).length,
        topNodes,
        typeCounts,
        dateFrom: from,
        dateTo: to,
      });

      const nodesVis = uniqueNodes.map((n) => ({
        id: n.id,
        label: n.label,
        value: degree[n.id] || 1,
        group: n.id.charAt(0),
      }));
      const edgesVis = (data.edges as Edge[])
        .filter((e) => (e.value || 1) >= minWeight)
        .map((e) => ({
          from: e.from,
          to: e.to,
          color: { color: typeColors[normalize(e.label)] || '#aaa', opacity: 0.3 },
          width: 0.15,
          arrows: 'to',
          smooth: true,
        }));

      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      const network = new Network(
        containerRef.current,
        { nodes: nodesVis, edges: edgesVis },
        {
          nodes: {
            shape: 'dot',
            scaling: { min: 10, max: 40 },
            font: { size: 14, color: '#888888' },
          },
          edges: {
            arrows: 'to',
            smooth: true,
            width: 0.15,
            font: { color: '#888888', align: 'middle', strokeWidth: 0 },
          },
          physics: { enabled: true, stabilization: { iterations: 200 } },
          interaction: { hover: true },
        }
      );
      networkRef.current = network;

      if (nodesVis.length) {
        const hot = nodesVis.reduce((a, b) => (a.value > b.value ? a : b));
        network.selectNodes([hot.id]);
        network.focus(hot.id, { scale: 1.5, animation: true });
      }

      network.on('doubleClick', () => {
        const el = containerRef.current;
        if (!el) return;
        !document.fullscreenElement ? el.requestFullscreen?.() : document.exitFullscreen?.();
      });

      network.on('hoverNode', (params) => {
        const nodeId = params.node as string;
        const edge = edgesRef.current.find((e) => e.from === nodeId || e.to === nodeId);
        if (edge) ensurePopup(edge.tweet_id, nodeId);
      });
      network.on('blurNode', () => (network as any).hidePopup?.());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [topicId, type, from, to, minWeight, ensurePopup]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          {/* Controls */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              mb: 3,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select value={type} label="Type" onChange={(e) => setType(e.target.value)}>
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="mention">Mention</MenuItem>
                <MenuItem value="retweet">Retweet</MenuItem>
                <MenuItem value="reply">Reply</MenuItem>
                <MenuItem value="quote">Quote</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="date"
              label="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              size="small"
              type="date"
              label="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
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

            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
              Download
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:document-text-bold" />}
              onClick={() => {
                setModalOpen(true);
                if (snaStats) generateAI(snaStats);
              }}
              disabled={!snaStats}
            >
              Buat Kesimpulan
            </Button>
          </Box>

          {/* Legend */}
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" fontWeight="bold" sx={{ mr: 1 }}>
              Legend:
            </Typography>
            {Object.entries(typeColors).map(([k, c]) => (
              <Chip
                key={k}
                label={k}
                size="small"
                sx={{
                  bgcolor: c,
                  color: 'white',
                  '& .MuiChip-label': { textTransform: 'capitalize' },
                }}
              />
            ))}
          </Box>

          {/* Graph */}
          <Box sx={{ position: 'relative', height: 600 }}>
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
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 1,
                }}
              >
                <CircularProgress />
                <Typography sx={{ mt: 2 }} variant="body2">
                  Loading...
                </Typography>
              </Box>
            )}

            <Box
              ref={containerRef}
              sx={{
                width: '100%',
                height: '100%',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Kesimpulan Modal */}
      {snaStats && (
        <KesimpulanModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          stats={snaStats}
          topicName={topicName}
          copied={copied}
          aiLoading={aiLoading}
          aiResponse={aiResponse}
          onRegenerate={() => generateAI(snaStats)}
          onCopy={() => {
            const text = aiResponse || buildKesimpulanText(snaStats, topicName);
            navigator.clipboard.writeText(text).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        />
      )}
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Helper: build kesimpulan text for copy
// ──────────────────────────────────────────────────────────────────────────────
function buildKesimpulanText(stats: SnaStats, topicName?: string): string {
  const topicLabel = topicName ? `"${topicName}"` : `Topic ID ${stats.dateFrom}`;
  const topInfluencer = stats.topNodes[0];
  const dominantType = Object.entries(stats.typeCounts).sort((a, b) => b[1] - a[1])[0];
  const totalInteractions = Object.values(stats.typeCounts).reduce((a, b) => a + b, 0);

  return `KESIMPULAN SOCIAL NETWORK ANALYSIS (SNA)
Topik      : ${topicLabel}
Periode    : ${stats.dateFrom} s.d. ${stats.dateTo}

RINGKASAN JARINGAN
- Total pengguna/node dalam jaringan  : ${stats.totalNodes.toLocaleString('id-ID')}
- Total interaksi/edge dalam jaringan : ${stats.totalEdges.toLocaleString('id-ID')}

PENGGUNA PALING BERPENGARUH (TOP 5)
${stats.topNodes
  .slice(0, 5)
  .map(
    (n, i) =>
      `${i + 1}. @${n.id} — Degree: ${n.degree} (masuk: ${n.inDegree}, keluar: ${n.outDegree})`
  )
  .join('\n')}

DISTRIBUSI TIPE INTERAKSI
${Object.entries(stats.typeCounts)
  .map(
    ([k, v]) =>
      `- ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v.toLocaleString('id-ID')} (${totalInteractions > 0 ? ((v / totalInteractions) * 100).toFixed(1) : 0}%)`
  )
  .join('\n')}

ANALISIS
Berdasarkan analisis jaringan sosial pada topik ${topicLabel} selama periode ${stats.dateFrom} hingga ${stats.dateTo}, ditemukan sebanyak ${stats.totalNodes.toLocaleString('id-ID')} pengguna yang terlibat dengan ${stats.totalEdges.toLocaleString('id-ID')} interaksi. ${topInfluencer ? `Pengguna @${topInfluencer.id} tercatat sebagai aktor paling berpengaruh dengan degree centrality tertinggi sebesar ${topInfluencer.degree} koneksi.` : ''} Tipe interaksi yang paling dominan adalah ${dominantType ? `${dominantType[0]} dengan ${dominantType[1].toLocaleString('id-ID')} kejadian (${totalInteractions > 0 ? ((dominantType[1] / totalInteractions) * 100).toFixed(1) : 0}% dari total interaksi)` : '-'}. Jaringan ini menunjukkan pola komunikasi yang ${stats.totalEdges / Math.max(stats.totalNodes, 1) > 3 ? 'padat dan aktif' : 'cukup tersebar'} di antara para pengguna.`;
}

// ──────────────────────────────────────────────────────────────────────────────
// KesimpulanModal component
// ──────────────────────────────────────────────────────────────────────────────
interface KesimpulanModalProps {
  open: boolean;
  onClose: () => void;
  stats: SnaStats;
  topicName?: string;
  copied: boolean;
  aiLoading: boolean;
  aiResponse: string;
  onRegenerate: () => void;
  onCopy: () => void;
}

function KesimpulanModal({
  open,
  onClose,
  stats,
  topicName,
  copied,
  aiLoading,
  aiResponse,
  onRegenerate,
  onCopy,
}: KesimpulanModalProps) {
  const totalInteractions = Object.values(stats.typeCounts).reduce((a, b) => a + b, 0);
  const dominantType = Object.entries(stats.typeCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify
            icon="solar:document-text-bold"
            sx={{ color: 'primary.main', width: 24, height: 24 }}
          />
          <Typography variant="h6">Kesimpulan Social Network Analysis</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="eva:close-fill" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Overview chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
          <Chip label={`Topik: ${topicName || `ID ${stats.dateFrom}`}`} color="primary" />
          <Chip label={`${stats.dateFrom} s.d. ${stats.dateTo}`} variant="outlined" />
          <Chip
            label={`${stats.totalNodes.toLocaleString('id-ID')} Pengguna`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={`${stats.totalEdges.toLocaleString('id-ID')} Interaksi`}
            color="success"
            variant="outlined"
          />
        </Box>

        {/* Top Influencers */}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Iconify icon="solar:cup-star-bold" sx={{ color: 'warning.main' }} />
          Pengguna Paling Berpengaruh (Top 10)
        </Typography>
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Username</TableCell>
              <TableCell align="center">Degree</TableCell>
              <TableCell align="center">Masuk</TableCell>
              <TableCell align="center">Keluar</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Pengaruh</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.topNodes.map((n, i) => {
              const maxDeg = stats.topNodes[0]?.degree || 1;
              return (
                <TableRow key={n.id} sx={{ bgcolor: i === 0 ? 'action.selected' : 'inherit' }}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={i < 3 ? 'bold' : 'normal'}>
                      @{n.id}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="bold">
                      {n.degree}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'success.main' }}>
                    {n.inDegree}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'warning.main' }}>
                    {n.outDegree}
                  </TableCell>
                  <TableCell>
                    <LinearProgress
                      variant="determinate"
                      value={(n.degree / maxDeg) * 100}
                      color={i === 0 ? 'secondary' : 'primary'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Interaction type breakdown */}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Iconify icon="solar:chart-2-bold" sx={{ color: 'info.main' }} />
          Distribusi Tipe Interaksi
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          {Object.entries(stats.typeCounts).map(([k, v]) => (
            <Box key={k} sx={{ minWidth: 140 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" textTransform="capitalize">
                  {k}
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {v.toLocaleString('id-ID')} (
                  {totalInteractions > 0 ? ((v / totalInteractions) * 100).toFixed(1) : 0}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalInteractions > 0 ? (v / totalInteractions) * 100 : 0}
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

        {/* AI-generated kesimpulan */}
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
            position: 'relative',
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
                  <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                    {children}
                  </Typography>
                ),
                h1: ({ children }) => (
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {children}
                  </Typography>
                ),
                h2: ({ children }) => (
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {children}
                  </Typography>
                ),
                h3: ({ children }) => (
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    {children}
                  </Typography>
                ),
                li: ({ children }) => (
                  <Typography component="li" variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                    {children}
                  </Typography>
                ),
                strong: ({ children }) => (
                  <Box component="span" fontWeight="bold">
                    {children}
                  </Box>
                ),
              }}
            >
              {aiResponse}
            </ReactMarkdown>
          ) : (
            <Typography variant="body2" color="text.disabled" fontStyle="italic">
              Klik "Buat Kesimpulan" untuk memulai.
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
