// Expression Distribution Pie Chart (for Social Media content)
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

interface ExpressionData {
  expression: string;
  percentage: number;
}

interface ChartPieExpressionProps {
  id: number;
  type: string;
  startDate?: string;
  endDate?: string;
  onSliceClick?: (expression: string, dateFrom: string, dateTo: string) => void;
}

const defaultColors: Record<string, string> = {
  Positive: '#4CAF50',
  Fear: '#FFC107',
  Negative: '#F44336',
  Trust: '#3F51B5',
  Surprise: '#FF9800',
  Anger: '#9C27B0',
  Anticipate: '#00ACC1',
  Sadness: '#607D8B',
  Bingung: '#00BFA6',
  Marah: '#FF5252',
  Netral: '#9E9E9E',
  Salut: '#3F51B5',
  Sedih: '#2196F3',
  Senang: '#4CAF50',
  Takut: '#FF9800',
  Terharu: '#BA68C8',
  Terimakasih: '#81C784',
  unknown: '#BDBDBD',
};

export default function ChartPieExpression({
  id,
  type,
  startDate,
  endDate,
  onSliceClick,
}: ChartPieExpressionProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [chartState, setChartState] = useState<{
    series: number[];
    labels: string[];
    colors: string[];
  }>({
    series: [],
    labels: [],
    colors: [],
  });
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
    const fmt = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');
    return { startDate: fmt(start), endDate: fmt(end) };
  };

  const fetchExpressionData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(period);
      const url = `/search-results/${id}/${type}/expression-percentage?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
      const res = await apiClient.get(url);

      if (res.data.message === 'Sentiment data retrieved successfully') {
        const labels: string[] = [];
        const series: number[] = [];
        const colors: string[] = [];

        (res.data.data as ExpressionData[]).forEach((it) => {
          const label = it.expression.charAt(0).toUpperCase() + it.expression.slice(1);
          labels.push(label);
          series.push(it.percentage);
          colors.push(defaultColors[label] || '#999');
        });

        setChartState({ labels, series, colors });
      }
    } catch (err) {
      console.error('[ChartPieExpression] Error fetching data:', err);
      setChartState({ labels: [], series: [], colors: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchExpressionData();
    }
  }, [period, id, type, startDate, endDate]);

  const chartOptions: ApexOptions = mergeChartOptions(isDarkMode, {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const sliceIndex = config.dataPointIndex;
          if (sliceIndex == null) return;

          const clickedExpression = chartState.labels[sliceIndex];
          const { startDate, endDate } = getDateRange(period);

          if (onSliceClick) {
            onSliceClick(clickedExpression.toLowerCase(), startDate, endDate);
          }
        },
      },
    },
    labels: chartState.labels,
    colors: chartState.colors,
    legend: {
      position: 'bottom',
      fontSize: '13px',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: { show: true, fontSize: '14px' },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: 'bold',
              formatter: (val) => `${val}%`,
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              formatter: () => {
                const total = chartState.series.reduce((a, b) => a + b, 0);
                return `${total.toFixed(1)}%`;
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: any) => `${Number(val).toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}%`,
      },
    },
  });

  return (
    <Card sx={{ height: '100%', minHeight: 500 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Expression Distribution
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
        ) : chartState.series.length > 0 ? (
          <ReactApexChart
            key={`pie-expr-${isDarkMode ? 'dark' : 'light'}`}
            options={chartOptions}
            series={chartState.series}
            type="donut"
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
