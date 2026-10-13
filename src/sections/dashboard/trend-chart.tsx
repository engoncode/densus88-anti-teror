import { Card, CardContent, CardHeader, Box } from '@mui/material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

// ----------------------------------------------------------------------

interface TrendChartProps {
  data: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
}

export function TrendChart({ data }: TrendChartProps) {
  const categories = data.map((item) => item.date);

  const series = [
    {
      name: 'Positive',
      data: data.map((item) => item.positive),
    },
    {
      name: 'Neutral',
      data: data.map((item) => item.neutral),
    },
    {
      name: 'Negative',
      data: data.map((item) => item.negative),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    colors: ['#10b981', '#6b7280', '#ef4444'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: {
      title: {
        text: 'Count',
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 4,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => val.toFixed(0),
      },
    },
  };

  return (
    <Card>
      <CardHeader title="Sentiment Trend Over Time" />
      <CardContent>
        <Box sx={{ width: '100%', height: 400 }}>
          <Chart options={options} series={series} type="line" height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}
