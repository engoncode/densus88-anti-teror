// Sentiment Timeline Chart (for Web content)
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
import ChartInsightBox from './chart-insight-box';

interface ChartData {
  date: string;
  positive: string | number | null;
  neutral: string | number | null;
  negative: string | number | null;
}

interface ChartLineProps {
  id: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  onDataPointClick?: (date: string, platform: string) => void;
}

const toNumberSafe = (val: unknown) => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

export default function ChartLine({
  id,
  type = 'web',
  startDate,
  endDate,
  onDataPointClick,
}: ChartLineProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [chartData, setChartData] = useState<{
    series: { name: string; data: number[] }[];
    categories: string[];
    rawDates: string[];
  }>({
    series: [],
    categories: [],
    rawDates: [],
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
    (async () => {
      setLoading(true);
      const { startDate: start, endDate: end } = getRange(period);
      try {
        const { data } = await apiClient.post('/sentiment-summary', {
          topic_id: id,
          post_type: type,
          start_date: start,
          end_date: end,
        });

        const rows: ChartData[] = data.data ?? [];
        const rawDates = rows.map((r) => (r.date ?? '').toString().split(' ')[0]);
        const categories = rows.map((r) => {
          const d = new Date(r.date);
          return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
        });

        setChartData({
          rawDates,
          categories,
          series: [
            { name: 'Positive', data: rows.map((r) => toNumberSafe(r.positive)) },
            { name: 'Neutral', data: rows.map((r) => toNumberSafe(r.neutral)) },
            { name: 'Negative', data: rows.map((r) => toNumberSafe(r.negative)) },
          ],
        });
      } catch (e) {
        console.error('[ChartLine] fetch error', e);
        setChartData({ series: [], categories: [], rawDates: [] });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, type, period, startDate, endDate]);

  const apexOpts: ApexOptions = mergeChartOptions(isDarkMode, {
    chart: {
      type: 'area',
      height: 335,
      toolbar: { show: false },
      fontFamily: 'inherit',
      events: {
        click: (_e, _ctx, cfg) => {
          const idx = cfg.dataPointIndex;
          const raw = chartData.rawDates[idx] || null;
          if (raw && onDataPointClick) {
            onDataPointClick(raw, type);
          }
        },
      },
    },
    colors: ['#10B981', '#dd930a', '#EF4444'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    stroke: { width: 2, curve: 'smooth' },
    markers: { size: 0, hover: { size: 0 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: '12px',
          colors: isDarkMode ? '#FFFFFF' : '#6B7280',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Number of Posts',
        style: {
          color: isDarkMode ? '#FFFFFF' : '#6B7280',
        },
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: isDarkMode ? '#FFFFFF' : '#6B7280',
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '14px',
      labels: {
        colors: isDarkMode ? '#FFFFFF' : '#4B5563',
      },
    },
    grid: {
      borderColor: isDarkMode ? '#4B5563' : '#e0e0e0',
      strokeDashArray: 5,
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
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
            Sentiment Timeline
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
            key={`area-${isDarkMode ? 'dark' : 'light'}`}
            options={apexOpts}
            series={chartData.series}
            type="area"
            height={335}
          />
        ) : (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 335 }}
          >
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        )}

        {/* AI Insight Box — hanya tampil jika sudah ada data */}
        {!loading && chartData.series.length > 0 && (
          <ChartInsightBox
            topicId={id}
            platform={type}
            type="chart_line"
            chartData={{
              categories: chartData.categories,
              series: {
                positive: chartData.series.find((s) => s.name === 'Positive')?.data ?? [],
                neutral: chartData.series.find((s) => s.name === 'Neutral')?.data ?? [],
                negative: chartData.series.find((s) => s.name === 'Negative')?.data ?? [],
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
