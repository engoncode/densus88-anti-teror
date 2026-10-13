// AI Insight Box — shared component for chart-line & chart-pie
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import apiClient from 'src/services/apiService';

export type ChartInsightType =
  | 'chart_line'
  | 'chart_pie'
  | 'chart_keyword'
  | 'chart_sna'
  | 'chart_connection';

interface Props {
  topicId: number;
  platform: string;
  type: ChartInsightType;
  /** Data chart yang sudah ada di komponen parent — dikirim ke AI saat generate */
  chartData: Record<string, unknown>;
}

interface InsightState {
  found: boolean;
  isStale: boolean;
  insight: string | null;
  status: 'generating' | 'ready' | 'failed' | null;
  updatedAgo: string | null;
  updatedAt: string | null;
}

const EMPTY: InsightState = {
  found: false,
  isStale: true,
  insight: null,
  status: null,
  updatedAgo: null,
  updatedAt: null,
};

/** Hitung relative time secara live dari ISO timestamp */
function useRelativeTime(isoString: string | null): string | null {
  const tick = useRef(0);
  const [label, setLabel] = useState<string | null>(null);

  const compute = useCallback(() => {
    if (!isoString) { setLabel(null); return; }
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60)         setLabel('baru saja');
    else if (diffSec < 3600)  setLabel(`${Math.floor(diffSec / 60)} menit yang lalu`);
    else if (diffSec < 86400) setLabel(`${Math.floor(diffSec / 3600)} jam yang lalu`);
    else                      setLabel(`${Math.floor(diffSec / 86400)} hari yang lalu`);
  }, [isoString]);

  useEffect(() => {
    compute();
    tick.current = window.setInterval(compute, 60_000);
    return () => clearInterval(tick.current);
  }, [compute]);

  return label;
}

const POLL_INTERVAL_MS = 4000;

export default function ChartInsightBox({ topicId, platform, type, chartData }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [state, setState] = useState<InsightState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveTime = useRelativeTime(state.updatedAt);

  // ------------------------------------------------------------------ //
  // Fetch existing insight from cache                                   //
  // ------------------------------------------------------------------ //
  const fetchInsight = useCallback(async () => {
    if (!topicId || !platform) return;
    try {
      const { data } = await apiClient.get('/chart-insights', {
        params: { topic_id: topicId, platform, type },
      });
      setState({
        found: data.found,
        isStale: data.is_stale ?? true,
        insight: data.insight ?? null,
        status: data.status ?? null,
        updatedAgo: data.updated_ago ?? null,
        updatedAt: data.updated_at ?? null,
      });
      // Jika masih generating, lanjutkan polling
      if (data.status === 'generating') {
        startPolling();
      } else {
        stopPolling();
      }
    } catch {
      // Diam-diam gagal — jangan ganggu UX chart utama
    }
  }, [topicId, platform, type]);

  useEffect(() => {
    fetchInsight();
    return () => stopPolling();
  }, [fetchInsight]);

  // ------------------------------------------------------------------ //
  // Polling ketika status = generating                                  //
  // ------------------------------------------------------------------ //
  const startPolling = () => {
    if (pollRef.current) return;
    pollRef.current = setInterval(fetchInsight, POLL_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // ------------------------------------------------------------------ //
  // Generate / refresh                                                  //
  // ------------------------------------------------------------------ //
  const handleGenerate = async (force = false) => {
    if (loading || state.status === 'generating') return;
    setLoading(true);
    try {
      const { data } = await apiClient.post('/chart-insights/generate', {
        topic_id: topicId,
        platform,
        type,
        chart_data: chartData,
        force,
      });

      setState({
        found: true,
        isStale: data.is_stale ?? false,
        insight: data.insight,
        status: data.status,
        updatedAgo: data.updated_ago ?? null,
        updatedAt: data.updated_at ?? null,
      });

      if (data.status === 'generating') {
        startPolling();
      }
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------ //
  // Render helpers                                                      //
  // ------------------------------------------------------------------ //
  const isGenerating = state.status === 'generating' || loading;

  const bgColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.04)';

  const borderColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.20)';

  return (
    <Box
      sx={{
        mt: 2,
        border: `1px solid ${borderColor}`,
        borderRadius: 2,
        bgcolor: bgColor,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography variant="caption" fontWeight="bold" color="primary.main">
            AI Insight
          </Typography>

          {/* Timestamp — selalu tampil saat insight tersedia */}
          {state.found && state.status === 'ready' && liveTime && (
            <Chip
              label={`Diperbarui ${liveTime}`}
              size="small"
              color={state.isStale ? 'warning' : 'default'}
              variant="outlined"
              sx={{ fontSize: 10, height: 18 }}
            />
          )}

          {/* Badge generating */}
          {isGenerating && (
            <Chip
              label="Sedang diproses…"
              size="small"
              color="info"
              variant="outlined"
              sx={{ fontSize: 10, height: 18 }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Tombol refresh jika stale */}
          {state.found && state.isStale && !isGenerating && (
            <Tooltip title="Perbarui insight">
              <IconButton size="small" onClick={() => handleGenerate(true)}>
                <RefreshIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Expand/collapse */}
          {state.found && state.insight && (
            <IconButton size="small" onClick={() => setExpanded((v) => !v)}>
              {expanded ? (
                <ExpandLessIcon sx={{ fontSize: 16 }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          )}
        </Box>
      </Box>

      <Divider sx={{ opacity: 0.4 }} />

      {/* Body */}
      <Box sx={{ px: 2, py: 1.5 }}>
        {/* Belum pernah di-generate */}
        {!state.found && !isGenerating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Belum ada analisis AI untuk chart ini.
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
              onClick={() => handleGenerate(false)}
              sx={{ fontSize: 11, py: 0.5, px: 1.5 }}
            >
              Generate
            </Button>
          </Box>
        )}

        {/* Loading / generating */}
        {isGenerating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              AI sedang menganalisa data chart…
            </Typography>
          </Box>
        )}

        {/* Insight tersedia */}
        {state.found && state.insight && !isGenerating && (
          <Collapse in={expanded}>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: 13 }}
            >
              {state.insight}
            </Typography>
            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                onClick={() => handleGenerate(true)}
                sx={{ fontSize: 11, py: 0.5, px: 1.5 }}
              >
                Regenerate
              </Button>
            </Box>
          </Collapse>
        )}

        {/* Status failed */}
        {state.status === 'failed' && !isGenerating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="error">
              Gagal generate insight. Coba lagi.
            </Typography>
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
              onClick={() => handleGenerate(true)}
              sx={{ fontSize: 11, py: 0.5, px: 1.5 }}
            >
              Coba Lagi
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
