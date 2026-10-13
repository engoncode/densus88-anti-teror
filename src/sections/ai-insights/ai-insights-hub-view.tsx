import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  Alert,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import PollIcon from '@mui/icons-material/Poll';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TagIcon from '@mui/icons-material/Tag';
import HubIcon from '@mui/icons-material/Hub';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import apiClient from 'src/services/apiService';

// ------------------------------------------------------------------ //
// Simple Markdown renderer (no extra deps)                           //
// ------------------------------------------------------------------ //
function SimpleMarkdown({ text }: { text: string }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  const renderInline = (str: string) => {
    // Bold: **text**
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**') ? (
        <strong key={i}>{p.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{p}</span>
      )
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line.trim()) {
      elements.push(<Box key={key++} sx={{ height: 6 }} />);
      continue;
    }

    // ## Heading 2
    if (line.startsWith('## ')) {
      elements.push(
        <Typography
          key={key++}
          variant="subtitle2"
          fontWeight={700}
          sx={{
            mt: 1.5,
            mb: 0.5,
            pb: 0.5,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            color: 'primary.main',
          }}
        >
          {renderInline(line.slice(3))}
        </Typography>
      );
      continue;
    }

    // # Heading 1
    if (line.startsWith('# ')) {
      elements.push(
        <Typography key={key++} variant="subtitle1" fontWeight={700} sx={{ mt: 1, mb: 0.5 }}>
          {renderInline(line.slice(2))}
        </Typography>
      );
      continue;
    }

    // Ordered list: 1. 2. 3.
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      elements.push(
        <Box key={key++} sx={{ display: 'flex', gap: 1, mb: 0.4, pl: 1 }}>
          <Typography variant="body2" sx={{ minWidth: 18, color: 'primary.main', fontWeight: 700, fontSize: 13 }}>
            {orderedMatch[1]}.
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7, fontSize: 13 }}>
            {renderInline(orderedMatch[2])}
          </Typography>
        </Box>
      );
      continue;
    }

    // Unordered list: - or *
    if (line.match(/^[-*]\s+/)) {
      elements.push(
        <Box key={key++} sx={{ display: 'flex', gap: 1, mb: 0.4, pl: 1 }}>
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1.7 }}>
            •
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7, fontSize: 13 }}>
            {renderInline(line.replace(/^[-*]\s+/, ''))}
          </Typography>
        </Box>
      );
      continue;
    }

    // Normal paragraph
    elements.push(
      <Typography key={key++} variant="body2" sx={{ lineHeight: 1.8, fontSize: 13, mb: 0.3 }}>
        {renderInline(line)}
      </Typography>
    );
  }

  return <Box>{elements}</Box>;
}

// ------------------------------------------------------------------ //
// Types                                                               //
// ------------------------------------------------------------------ //
type ChartInsightType =
  | 'chart_line'
  | 'chart_pie'
  | 'chart_keyword'
  | 'chart_sna'
  | 'chart_connection'
  | 'chart_expression_dist'
  | 'chart_expression_timeline'
  | 'strategic_action';

interface InsightState {
  found: boolean;
  insight: string | null;
  status: 'generating' | 'ready' | 'failed' | null;
  isStale: boolean;
  updatedAt: string | null;
  updatedAgo: string | null;
}

interface CardConfig {
  type: ChartInsightType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  twitterOnly?: boolean;
  noWeb?: boolean;
  fullWidth?: boolean;
}

// ------------------------------------------------------------------ //
// Card definitions                                                    //
// ------------------------------------------------------------------ //
const CARDS: CardConfig[] = [
  {
    type: 'chart_pie',
    title: 'Ringkasan Sentimen',
    description: 'Distribusi opini positif, negatif, dan netral',
    icon: <PollIcon sx={{ fontSize: 20 }} />,
    color: '#8338ec',
  },
  {
    type: 'chart_line',
    title: 'Tren Waktu',
    description: 'Pola puncak aktivitas dan anomali dari waktu ke waktu',
    icon: <ShowChartIcon sx={{ fontSize: 20 }} />,
    color: '#3a86ff',
  },
  {
    type: 'chart_expression_timeline',
    title: 'Timeline Ekspresi',
    description: 'Tren dinamika emosi dari waktu ke waktu',
    icon: <StackedLineChartIcon sx={{ fontSize: 20 }} />,
    color: '#2ec4b6',
    noWeb: true,
  },
  {
    type: 'chart_expression_dist',
    title: 'Distribusi Ekspresi',
    description: 'Profil emosi & ekspresi dominan dari percakapan',
    icon: <EmojiEmotionsIcon sx={{ fontSize: 20 }} />,
    color: '#fb5607',
    noWeb: true,
  },
  {
    type: 'chart_sna',
    title: 'Peta Jaringan (SNA)',
    description: 'Node & akun paling berpengaruh dalam percakapan',
    icon: <HubIcon sx={{ fontSize: 20 }} />,
    color: '#06d6a0',
    twitterOnly: true,
  },
  {
    type: 'chart_connection',
    title: 'Peta Koneksi',
    description: 'Relasi dan cluster antar akun atau konten',
    icon: <AccountTreeIcon sx={{ fontSize: 20 }} />,
    color: '#ff9e00',
    twitterOnly: true,
  },
  {
    type: 'chart_keyword',
    title: 'Kata Kunci Dominan',
    description: 'Tema & kata yang paling banyak dibicarakan',
    icon: <TagIcon sx={{ fontSize: 20 }} />,
    color: '#ff006e',
  },
  {
    type: 'strategic_action',
    title: 'Rekomendasi & Aksi Strategis',
    description: 'Langkah tindak lanjut berdasarkan seluruh wawasan AI',
    icon: <LightbulbIcon sx={{ fontSize: 20 }} />,
    color: '#ffd166',
    fullWidth: true,
  },
];

const EMPTY_INSIGHT: InsightState = {
  found: false,
  insight: null,
  status: null,
  isStale: true,
  updatedAt: null,
  updatedAgo: null,
};

const POLL_MS = 4000;

// SNA & Connection selalu pakai platform tweet (data hanya ada di Twitter)
const effectivePlatform = (type: ChartInsightType, platform: string): string =>
  (type === 'chart_sna' || type === 'chart_connection') && platform === 'allplatform'
    ? 'tweet'
    : platform;

// ------------------------------------------------------------------ //
// Relative time hook                                                  //
// ------------------------------------------------------------------ //
function useRelativeTime(iso: string | null): string | null {
  const tick = useRef(0);
  const [label, setLabel] = useState<string | null>(null);
  const compute = useCallback(() => {
    if (!iso) { setLabel(null); return; }
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60)        setLabel('baru saja');
    else if (s < 3600) setLabel(`${Math.floor(s / 60)} mnt lalu`);
    else if (s < 86400) setLabel(`${Math.floor(s / 3600)} jam lalu`);
    else               setLabel(`${Math.floor(s / 86400)} hari lalu`);
  }, [iso]);
  useEffect(() => {
    compute();
    tick.current = window.setInterval(compute, 60_000);
    return () => clearInterval(tick.current);
  }, [compute]);
  return label;
}

// ------------------------------------------------------------------ //
// Single Insight Card                                                 //
// ------------------------------------------------------------------ //
function InsightCard({
  config,
  state,
  onRegenerate,
}: {
  config: CardConfig;
  state: InsightState;
  onRegenerate: () => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const liveTime = useRelativeTime(state.updatedAt);
  const isGenerating = state.status === 'generating';

  const borderLeft = `4px solid ${config.color}`;
  const bgColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)';

  return (
    <Card
      sx={{
        height: '100%',
        borderLeft,
        bgcolor: bgColor,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 4 },
      }}
    >
      <CardContent sx={{ pb: '12px !important' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${config.color}22`,
                color: config.color,
                flexShrink: 0,
              }}
            >
              {config.icon}
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {config.title}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1 }}>
                {config.description}
              </Typography>
            </Box>
          </Box>

          {/* Status chip */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
            {isGenerating && (
              <Chip label="Memproses…" size="small" color="info" variant="outlined" sx={{ fontSize: 10, height: 18 }} />
            )}
            {state.status === 'ready' && liveTime && !isGenerating && (
              <Chip
                label={liveTime}
                size="small"
                color={state.isStale ? 'warning' : 'default'}
                variant="outlined"
                sx={{ fontSize: 10, height: 18 }}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5, opacity: 0.4 }} />

        {/* Body */}
        {isGenerating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              AI sedang menganalisis data…
            </Typography>
          </Box>
        )}

        {!state.found && !isGenerating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
            <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              Belum ada wawasan. Klik Regenerate untuk memulai.
            </Typography>
          </Box>
        )}

        {state.status === 'failed' && !isGenerating && (
          <Typography variant="caption" color="error">
            Gagal generate. Coba lagi.
          </Typography>
        )}

        {state.found && state.insight && !isGenerating && (
          <SimpleMarkdown text={state.insight} />
        )}

        {/* Regenerate button */}
        {!isGenerating && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
            <Button
              size="small"
              variant={state.found ? 'outlined' : 'contained'}
              startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
              onClick={onRegenerate}
              sx={{ fontSize: 11, py: 0.4, px: 1.5 }}
            >
              {state.found ? 'Regenerate' : 'Generate'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------ //
// Main Hub View                                                       //
// ------------------------------------------------------------------ //
interface Props {
  topicId: number;
  platform: string;
}

export function AiInsightsHubView({ topicId, platform }: Props) {
  const [insights, setInsights] = useState<Record<ChartInsightType, InsightState>>(
    () =>
      Object.fromEntries(CARDS.map((c) => [c.type, { ...EMPTY_INSIGHT }])) as Record<
        ChartInsightType,
        InsightState
      >
  );
  const [loadingCard, setLoadingCard] = useState<ChartInsightType | null>(null);
  const [regeneratingAll, setRegeneratingAll] = useState(false);
  const pollRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Visible cards: hide twitterOnly if platform != tweet
  const visibleCards = CARDS.filter((c) => {
    if (c.twitterOnly && platform !== 'tweet' && platform !== 'allplatform') return false;
    if (c.noWeb && platform === 'web') return false;
    return true;
  });

  // ------------------------------------------------------------------ //
  // Fetch all insights on mount / platform change                      //
  // ------------------------------------------------------------------ //
  const fetchAll = useCallback(async () => {
    const types = visibleCards.map((c) => c.type);
    const results = await Promise.allSettled(
      types.map((type) =>
        apiClient.get('/chart-insights', { params: { topic_id: topicId, platform: effectivePlatform(type, platform), type } })
      )
    );

    const newInsights = { ...insights };
    results.forEach((res, i) => {
      const type = types[i];
      if (res.status === 'fulfilled') {
        const d = res.value.data;
        newInsights[type] = {
          found: d.found,
          insight: d.insight ?? null,
          status: d.status ?? null,
          isStale: d.is_stale ?? true,
          updatedAt: d.updated_at ?? null,
          updatedAgo: d.updated_ago ?? null,
        };
        if (d.status === 'generating') startPoll(type);
      }
    });
    setInsights({ ...newInsights });
  }, [topicId, platform]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAll();
    return () => {
      Object.values(pollRef.current).forEach(clearInterval);
      pollRef.current = {};
    };
  }, [fetchAll]);

  // ------------------------------------------------------------------ //
  // Polling                                                             //
  // ------------------------------------------------------------------ //
  const startPoll = (type: ChartInsightType) => {
    if (pollRef.current[type]) return;
    pollRef.current[type] = setInterval(async () => {
      try {
        const { data } = await apiClient.get('/chart-insights', {
          params: { topic_id: topicId, platform: effectivePlatform(type, platform), type },
        });
        if (data.status !== 'generating') {
          clearInterval(pollRef.current[type]);
          delete pollRef.current[type];
          setInsights((prev) => ({
            ...prev,
            [type]: {
              found: data.found,
              insight: data.insight ?? null,
              status: data.status ?? null,
              isStale: data.is_stale ?? true,
              updatedAt: data.updated_at ?? null,
              updatedAgo: data.updated_ago ?? null,
            },
          }));
        }
      } catch {/* silent */}
    }, POLL_MS);
  };

  // ------------------------------------------------------------------ //
  // Generate one card                                                   //
  // ------------------------------------------------------------------ //
  const generateOne = useCallback(
    async (type: ChartInsightType) => {
      if (loadingCard || regeneratingAll) return;
      setLoadingCard(type);

      // For strategic_action, pass all current insights as context
      const chartData =
        type === 'strategic_action'
          ? {
              insights: {
                sentimen:           insights.chart_pie.insight              ?? '-',
                tren:               insights.chart_line.insight             ?? '-',
                keyword:            insights.chart_keyword.insight          ?? '-',
                sna:                insights.chart_sna.insight              ?? '-',
                koneksi:            insights.chart_connection.insight       ?? '-',
                ekspresi_dist:      insights.chart_expression_dist.insight  ?? null,
                ekspresi_timeline:  insights.chart_expression_timeline.insight ?? null,
              },
            }
          : {};

      setInsights((prev) => ({
        ...prev,
        [type]: { ...prev[type], status: 'generating' },
      }));

      try {
        const { data } = await apiClient.post('/chart-insights/generate', {
          topic_id: topicId,
          platform: effectivePlatform(type, platform),
          type,
          chart_data: chartData,
          force: true,
        });
        setInsights((prev) => ({
          ...prev,
          [type]: {
            found: true,
            insight: data.insight ?? null,
            status: data.status ?? null,
            isStale: data.is_stale ?? false,
            updatedAt: data.updated_at ?? null,
            updatedAgo: data.updated_ago ?? null,
          },
        }));
        if (data.status === 'generating') startPoll(type);
      } catch {
        setInsights((prev) => ({
          ...prev,
          [type]: { ...prev[type], status: 'failed' },
        }));
      } finally {
        setLoadingCard(null);
      }
    },
    [topicId, platform, insights, loadingCard, regeneratingAll] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ------------------------------------------------------------------ //
  // Regenerate All                                                      //
  // ------------------------------------------------------------------ //
  const regenerateAll = useCallback(async () => {
    setRegeneratingAll(true);
    // Generate non-strategic cards first, then strategic
    const normalTypes = visibleCards.filter((c) => c.type !== 'strategic_action').map((c) => c.type);
    const updatedInsights = { ...insights };

    for (const type of normalTypes) {
      setInsights((prev) => ({
        ...prev,
        [type]: { ...prev[type], status: 'generating' },
      }));
      try {
        const { data } = await apiClient.post('/chart-insights/generate', {
          topic_id: topicId,
          platform: effectivePlatform(type, platform),
          type,
          chart_data: {},
          force: true,
        });
        updatedInsights[type] = {
          found: true,
          insight: data.insight ?? null,
          status: data.status ?? null,
          isStale: data.is_stale ?? false,
          updatedAt: data.updated_at ?? null,
          updatedAgo: data.updated_ago ?? null,
        };
        setInsights({ ...updatedInsights });
        if (data.status === 'generating') {
          startPoll(type);
          // Wait for poll to complete before proceeding
          await new Promise<void>((resolve) => {
            const check = setInterval(() => {
              if (updatedInsights[type].status === 'ready' || updatedInsights[type].status === 'failed') {
                clearInterval(check);
                resolve();
              }
            }, POLL_MS);
          });
        }
      } catch {
        updatedInsights[type] = { ...updatedInsights[type], status: 'failed' };
        setInsights({ ...updatedInsights });
      }
    }

    // Now generate strategic_action with all insights available
    if (visibleCards.some((c) => c.type === 'strategic_action')) {
      setInsights((prev) => ({ ...prev, strategic_action: { ...prev.strategic_action, status: 'generating' } }));
      try {
        const { data } = await apiClient.post('/chart-insights/generate', {
          topic_id: topicId,
          platform,
          type: 'strategic_action',
          chart_data: {
            insights: {
              sentimen:           updatedInsights.chart_pie.insight              ?? '-',
              tren:               updatedInsights.chart_line.insight             ?? '-',
              keyword:            updatedInsights.chart_keyword.insight          ?? '-',
              sna:                updatedInsights.chart_sna.insight              ?? '-',
              koneksi:            updatedInsights.chart_connection.insight       ?? '-',
              ekspresi_dist:      updatedInsights.chart_expression_dist.insight  ?? null,
              ekspresi_timeline:  updatedInsights.chart_expression_timeline.insight ?? null,
            },
          },
          force: true,
        });
        setInsights((prev) => ({
          ...prev,
          strategic_action: {
            found: true,
            insight: data.insight ?? null,
            status: data.status ?? null,
            isStale: data.is_stale ?? false,
            updatedAt: data.updated_at ?? null,
            updatedAgo: data.updated_ago ?? null,
          },
        }));
        if (data.status === 'generating') startPoll('strategic_action');
      } catch {
        setInsights((prev) => ({ ...prev, strategic_action: { ...prev.strategic_action, status: 'failed' } }));
      }
    }

    setRegeneratingAll(false);
  }, [topicId, platform, insights, visibleCards]); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------------------------ //
  // Progress                                                            //
  // ------------------------------------------------------------------ //
  const readyCount = visibleCards.filter((c) => insights[c.type].status === 'ready').length;
  const generatingCount = visibleCards.filter((c) => insights[c.type].status === 'generating').length;
  const progress = Math.round((readyCount / visibleCards.length) * 100);

  // ------------------------------------------------------------------ //
  // Print                                                               //
  // ------------------------------------------------------------------ //
  const handlePrint = () => window.print();

  // Split cards: non-full-width + full-width
  const normalCards = visibleCards.filter((c) => !c.fullWidth);
  const fullWidthCards = visibleCards.filter((c) => c.fullWidth);

  return (
    <Box>
      {/* ---- Header toolbar ---- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {readyCount}/{visibleCards.length} wawasan tersedia
          </Typography>
          {generatingCount > 0 && (
            <Chip
              label={`${generatingCount} sedang diproses`}
              size="small"
              color="info"
              variant="outlined"
              sx={{ fontSize: 10, height: 18 }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Cetak / Export PDF">
            <IconButton size="small" onClick={handlePrint}>
              <PrintIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="contained"
            startIcon={regeneratingAll ? <CircularProgress size={12} color="inherit" /> : <AutoAwesomeIcon sx={{ fontSize: 14 }} />}
            onClick={regenerateAll}
            disabled={regeneratingAll || generatingCount > 0}
            sx={{ fontSize: 11, py: 0.5 }}
          >
            {regeneratingAll ? 'Memproses…' : 'Regenerate Semua'}
          </Button>
        </Box>
      </Box>

      {/* Progress bar */}
      {(regeneratingAll || generatingCount > 0) && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, height: 4 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {readyCount} dari {visibleCards.length} wawasan selesai
          </Typography>
        </Box>
      )}

      {/* ---- Normal cards (responsive 2-col grid) ---- */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        {normalCards.map((card) => (
          <Box key={card.type}>
            <InsightCard
              config={card}
              state={insights[card.type]}
              onRegenerate={() => generateOne(card.type)}
            />
          </Box>
        ))}
      </Box>

      {/* ---- Full-width cards (strategic_action) ---- */}
      {fullWidthCards.map((card) => (
        <Box key={card.type} sx={{ mb: 2 }}>
          <InsightCard
            config={card}
            state={insights[card.type]}
            onRegenerate={() => generateOne(card.type)}
          />
        </Box>
      ))}

      {/* ---- Completion banner ---- */}
      {readyCount === visibleCards.length && !regeneratingAll && (
        <Alert
          icon={<CheckCircleIcon fontSize="small" />}
          severity="success"
          sx={{ mt: 1 }}
        >
          Semua wawasan AI tersedia. Gunakan tombol <strong>Cetak</strong> untuk export PDF.
        </Alert>
      )}
    </Box>
  );
}
