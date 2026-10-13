// Top Media Share Chart (for Web content)
import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, useTheme } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import apiClient from 'src/services/apiService';
import { mergeChartOptions } from 'src/utils/chart-theme';

interface ChartTopShareProps {
  id: number;
  type: string;
  startDate?: string;
  endDate?: string;
  onBarClick?: (media: string, dateFrom: string, dateTo: string) => void;
}

interface MediaShareData {
  media: string;
  percentage: number;
  article_count: number;
}

export default function ChartTopShare({
  id,
  type,
  startDate,
  endDate,
  onBarClick,
}: ChartTopShareProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [chartData, setChartData] = useState<{
    categories: string[];
    series: { name: string; data: number[] }[];
  }>({
    categories: [],
    series: [{ name: 'Total Berita', data: [] }],
  });
  const [loading, setLoading] = useState<boolean>(true);

  const getLastMonthRange = () => {
    // Use provided dates if available, otherwise calculate
    if (startDate && endDate) {
      return { dateFrom: startDate, dateTo: endDate };
    }
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);

    const fmt = (d: Date) => {
      const YYYY = d.getFullYear();
      const MM = String(d.getMonth() + 1).padStart(2, '0');
      const DD = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
    };

    return {
      dateFrom: fmt(start),
      dateTo: fmt(end),
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/media-share/${id}/${type}`);
        const data = response.data.data as MediaShareData[];

        const categories = data.map((item) => item.media);
        const counts = data.map((item) => item.article_count);

        setChartData({
          categories,
          series: [
            {
              name: 'Total Berita',
              data: counts,
            },
          ],
        });
      } catch (error) {
        console.error('[ChartTopShare] Error fetching data:', error);
        setChartData({ categories: [], series: [{ name: 'Total Berita', data: [] }] });
      } finally {
        setLoading(false);
      }
    };

    if (id && type) {
      fetchData();
    }
  }, [id, type, startDate, endDate]);

  const options: ApexOptions = mergeChartOptions(isDarkMode, {
    chart: {
      type: 'bar',
      height: 400,
      toolbar: {
        show: false,
      },
      fontFamily: 'inherit',
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const idx = config.dataPointIndex;
          if (idx == null) return;

          const mediaClicked = chartData.categories[idx];
          const { dateFrom, dateTo } = getLastMonthRange();

          if (onBarClick) {
            onBarClick(mediaClicked, dateFrom, dateTo);
          }
        },
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: '12px',
        },
        rotate: -45,
        rotateAlways: false,
      },
    },
    yaxis: {
      title: {
        text: 'Jumlah Berita',
      },
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
      style: {
        fontSize: '10px',
        colors: ['#fff'],
      },
    },
    fill: {
      opacity: 1,
    },
    colors: ['#2196F3'],
    title: {
      text: '',
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} berita`,
      },
    },
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold" textAlign="center">
          Media Share
        </Typography>

        {loading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}
          >
            <CircularProgress />
          </Box>
        ) : chartData.series[0].data.length > 0 ? (
          <ReactApexChart
            key={`top-share-${isDarkMode ? 'dark' : 'light'}`}
            options={options}
            series={chartData.series}
            type="bar"
            height={400}
          />
        ) : (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}
          >
            <Typography color="text.secondary">No media share data available</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
