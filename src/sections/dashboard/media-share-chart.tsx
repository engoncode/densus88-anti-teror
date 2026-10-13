import { Card, CardContent, CardHeader, Box } from '@mui/material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

// ----------------------------------------------------------------------

interface MediaShareChartProps {
  data: Array<{
    platform: string;
    count: number;
  }>;
}

export function MediaShareChart({ data }: MediaShareChartProps) {
  const series = data.map((item) => item.count);
  const labels = data.map((item) => item.platform);

  const options: ApexOptions = {
    chart: {
      type: 'pie',
    },
    labels,
    colors: ['#3b82f6', '#0ea5e9', '#ec4899', '#8b5cf6', '#f59e0b'],
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return (
    <Card>
      <CardHeader title="Media Share" />
      <CardContent>
        <Box sx={{ width: '100%', height: 300 }}>
          <Chart options={options} series={series} type="pie" height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}
