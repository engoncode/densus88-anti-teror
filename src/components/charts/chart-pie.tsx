// Sentiment Proportion Pie Chart (for Web content)
import { useState, useEffect, useMemo } from 'react';
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
import ChartInsightBox from './chart-insight-box';

interface ChartPieProps {
  id: number;
  type: string;
  startDate?: string;
  endDate?: string;
  onSliceClick?: (
    sentiment: 'positive' | 'neutral' | 'negative',
    dateFrom: string,
    dateTo: string
  ) => void;
}

export default function ChartPie({ id, type, startDate, endDate, onSliceClick }: ChartPieProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [series, setSeries] = useState<number[]>([0, 0, 0]);
  const [period, setPeriod] = useState<'month' | 'week'>('month');
  const [loading, setLoading] = useState(true);

  const getDateRange = (p: 'month' | 'week') => {
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
    const fmt = (d: Date) => {
      const YYYY = d.getFullYear();
      const MM = String(d.getMonth() + 1).padStart(2, '0');
      const DD = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
    };
    return { startDate: fmt(start), endDate: fmt(end) };
  };

  const fetchSentimentData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(period);
      const url = `/search-results/${id}/${type}/sentiment-percentage?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
      const res = await apiClient.get(url);

      if (res.data.message === 'Sentiment data retrieved successfully') {
        const seriesData = ['positive', 'neutral', 'negative'].map((s) => {
          const found = res.data.data.find((it: any) => it.sentiment === s);
          return found ? found.percentage : 0;
        });
        setSeries(seriesData);
      }
    } catch (err) {
      console.error('[ChartPie] Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && type) {
      fetchSentimentData();
    }
  }, [period, id, type, startDate, endDate]);

  const chartOptions = useMemo<ApexOptions>(() => {
    return {
      chart: {
        type: 'donut',
        fontFamily: 'inherit',
        foreColor: isDarkMode ? '#FFFFFF' : '#1F2937',
        events: {
          dataPointSelection: (_event, _chartContext, config) => {
            const idx = config.dataPointIndex;
            let sentimentKey: 'positive' | 'neutral' | 'negative' = 'neutral';
            if (idx === 0) sentimentKey = 'positive';
            else if (idx === 1) sentimentKey = 'neutral';
            else if (idx === 2) sentimentKey = 'negative';

            const { startDate, endDate } = getDateRange(period);
            if (onSliceClick) {
              onSliceClick(sentimentKey, startDate, endDate);
            }
          },
        },
      },
      labels: ['Positive', 'Neutral', 'Negative'],
      colors: ['#10B981', '#dd930a', '#EF4444'],
      legend: {
        position: 'bottom',
        fontSize: '12px',
        labels: {
          colors: isDarkMode
            ? ['#FFFFFF', '#FFFFFF', '#FFFFFF']
            : ['#4B5563', '#4B5563', '#4B5563'],
        },
      },
      stroke: {
        show: !isDarkMode,
        width: isDarkMode ? 0 : 1,
        // colors: isDarkMode ? undefined : ['#fff'],
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                color: isDarkMode ? '#FFFFFF' : '#4B5563',
              },
              value: {
                show: true,
                fontSize: '24px',
                fontWeight: 'bold',
                formatter: (val) => `${val}%`,
                color: isDarkMode ? '#FFFFFF' : '#4B5563',
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '14px',
                formatter: () => {
                  const total = series.reduce((a, b) => a + b, 0);
                  return `${total.toFixed(1)}%`;
                },
                color: isDarkMode ? '#FFFFFF' : '#4B5563',
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: any) => `${Number(val).toFixed(1)}%`,
        style: {
          colors: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
        },
      },
      tooltip: {
        theme: isDarkMode ? 'dark' : 'light',
        y: {
          formatter: (val) => `${val}%`,
        },
      },
    };
  }, [series, period, onSliceClick, isDarkMode]);

  return (
    <Card sx={{ height: '100%', minHeight: 500 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Sentiment Distribution
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
        ) : (
          <ReactApexChart
            key={`pie-${isDarkMode ? 'dark' : 'light'}`}
            options={chartOptions}
            series={series}
            type="donut"
            height={335}
          />
        )}

        {/* AI Insight Box — hanya tampil jika sudah ada data */}
        {!loading && series.some((v) => v > 0) && (
          <ChartInsightBox
            topicId={id}
            platform={type}
            type="chart_pie"
            chartData={{
              positive: series[0],
              neutral: series[1],
              negative: series[2],
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
