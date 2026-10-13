// Top Issues / Concern Issues Chart (for Web content)
import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, useTheme } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { ChecklistRtl as ListChecksIcon } from '@mui/icons-material';
import apiClient from 'src/services/apiService';
import { mergeChartOptions } from 'src/utils/chart-theme';

interface TopIssuesProps {
  id: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  onBarClick?: (sentence: string, dateFrom: string, dateTo: string) => void;
}

interface IssueData {
  sentence: string;
  count: number;
}

export default function TopIssues({
  id,
  type = 'web',
  startDate,
  endDate,
  onBarClick,
}: TopIssuesProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [data, setData] = useState<IssueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getOneMonthRange = (): { startDate: string; endDate: string } => {
    // Use provided dates if available, otherwise calculate
    if (startDate && endDate) {
      return { startDate, endDate };
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

    return { startDate: fmt(start), endDate: fmt(end) };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get('/posts/top-issues', {
          params: { topic_id: id, post_type: type, days: 30 },
        });

        if (response.data?.data) {
          setData(response.data.data);
        } else {
          setError('No data available.');
        }
      } catch (err) {
        console.error('[TopIssues] Error fetching data:', err);
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, type, startDate, endDate]);

  // Merge duplicate sentences
  const mergedData = data.reduce((acc, cur) => {
    const found = acc.find((d) => d.sentence === cur.sentence);
    if (found) {
      found.count += cur.count;
    } else {
      acc.push({ ...cur });
    }
    return acc;
  }, [] as IssueData[]);

  // Filter: count >= 1, max 14 items
  const filteredData = mergedData.filter((i) => i.count >= 1).slice(0, 14);

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

          const chosenSentence = filteredData[idx].sentence;
          const { startDate, endDate } = getOneMonthRange();

          if (onBarClick) {
            onBarClick(chosenSentence, startDate, endDate);
          }
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '70%',
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
    xaxis: {
      categories: filteredData.map((i) => i.sentence),
      labels: {
        style: {
          fontSize: '11px',
          colors: '#666',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '11px',
          colors: '#666',
        },
      },
    },
    colors: ['#2196F3'],
    grid: {
      borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    tooltip: {
      y: {
        formatter: (val) => `Count: ${val}`,
      },
    },
  });

  const series = [
    {
      name: 'Count',
      data: filteredData.map((i) => i.count),
    },
  ];

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        {/* Header with icon */}
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}
        >
          <ListChecksIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Concern Issue
          </Typography>
        </Box>

        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
              borderRadius: 1,
            }}
          >
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        )}

        {/* Content */}
        {!loading && (
          <>
            {error ? (
              <Typography color="error" textAlign="center">
                {error}
              </Typography>
            ) : filteredData.length > 0 ? (
              <Box sx={{ height: 400 }}>
                <ReactApexChart
                  key={`issues-${isDarkMode ? 'dark' : 'light'}`}
                  options={options}
                  series={series}
                  type="bar"
                  height={400}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                }}
              >
                <Typography color="text.secondary">No issue data available</Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
