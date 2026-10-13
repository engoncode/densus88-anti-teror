// Expression Timeline Chart (for Social Media content)
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  useTheme,
} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import apiClient from 'src/services/apiService';
import { mergeChartOptions } from 'src/utils/chart-theme';

interface ChartData {
  date: string;
  [expression: string]: string | number;
}

interface ChartLineExpressionProps {
  id: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  onDataPointClick?: (date: string, expression: string, platform: string) => void;
}

const toNumberSafe = (val: unknown) => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

const defaultColors: Record<string, string> = {
  bingung: '#00BFA6',
  marah: '#FF5252',
  sedih: '#2196F3',
  senang: '#4CAF50',
  takut: '#FF9800',
  terharu: '#BA68C8',
  terimakasih: '#81C784',
  salut: '#3F51B5',
};

export default function ChartLineExpression({
  id,
  type = 'tweet',
  startDate,
  endDate,
  onDataPointClick,
}: ChartLineExpressionProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [chartData, setChartData] = useState<{
    series: { name: string; data: number[] }[];
    categories: string[];
    rawDates: string[];
    expressions: string[];
  }>({
    series: [],
    categories: [],
    rawDates: [],
    expressions: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<'month' | 'week'>('month');

  const getRange = (p: 'month' | 'week') => {
    // Use provided dates if available, otherwise calculate
    if (startDate && endDate) {
      return { startDate, endDate };
    }
    const end = new Date();
    const start = new Date();
    if (p === 'month') {
      start.setMonth(start.getMonth() - 1);
    } else {
      start.setDate(start.getDate() - 7);
    }
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    return { startDate: fmt(start), endDate: fmt(end) };
  };

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      const { startDate, endDate } = getRange(period);

      try {
        const response = await apiClient.post('/expression-summary', {
          start_date: startDate,
          end_date: endDate,
          post_type: type,
          topic_id: id,
        });

        const rows: ChartData[] = response.data.data || [];
        const rawDates = rows.map((r) => r.date);
        const categories = rows.map((r) => {
          const d = new Date(r.date);
          return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
        });

        // Collect expression names
        const exprSet = new Set<string>();
        rows.forEach((r) => {
          Object.keys(r).forEach((k) => {
            if (k !== 'date') exprSet.add(k);
          });
        });
        const expressions = Array.from(exprSet);

        // Resolve colors
        const resolvedColors = expressions.map((expr) => {
          const key = expr.toLowerCase().trim();
          return defaultColors[key] || '#888';
        });

        // Build series
        const series = expressions.map((expr) => ({
          name: expr,
          data: rows.map((r) => toNumberSafe(r[expr])),
        }));

        setChartData({ series, categories, rawDates, expressions });
      } catch (e) {
        console.error('[ChartLineExpression] fetch error', e);
        setChartData({ series: [], categories: [], rawDates: [], expressions: [] });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, type, period, startDate, endDate]);

  const apexOpts: ApexOptions = mergeChartOptions(isDarkMode, {
    chart: {
      type: 'line',
      height: 335,
      toolbar: { show: false },
      fontFamily: 'inherit',
      events: {
        click: (_e, _ctx, cfg) => {
          const idx = cfg.dataPointIndex;
          const seriesIdx = cfg.seriesIndex;
          const raw = chartData.rawDates[idx] || null;
          const expr = chartData.expressions[seriesIdx] || null;
          if (raw && expr && onDataPointClick) {
            onDataPointClick(raw, expr, type);
          }
        },
      },
    },
    colors: chartData.expressions.map((expr) => {
      const key = expr.toLowerCase().trim();
      return defaultColors[key] || '#888';
    }),
    stroke: { width: 2, curve: 'smooth' },
    markers: { size: 0 },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: '12px',
          colors: isDarkMode ? '#E5E7EB' : '#6B7280',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Expression Count',
        style: {
          color: isDarkMode ? '#E5E7EB' : '#6B7280',
        },
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: isDarkMode ? '#E5E7EB' : '#6B7280',
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '13px',
      labels: {
        colors: isDarkMode ? '#F3F4F6' : '#777c83',
      },
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 5,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `${val} posts`,
      },
    },
  });

  return (
    <Card sx={{ height: '100%', minHeight: 500 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Expression Timeline
          </Typography>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, newValue) => {
              if (newValue) setPeriod(newValue);
            }}
            size="small"
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 335 }}
          >
            <CircularProgress />
          </Box>
        ) : chartData.series.length > 0 ? (
          <ReactApexChart
            key={`line-expr-${isDarkMode ? 'dark' : 'light'}`}
            options={apexOpts}
            series={chartData.series}
            type="line"
            height={335}
          />
        ) : (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 335 }}
          >
            <Typography color="text.secondary">No expression data available</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
