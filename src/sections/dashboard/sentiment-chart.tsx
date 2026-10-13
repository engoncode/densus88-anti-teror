import { Card, CardContent, CardHeader, Box } from '@mui/material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

// ----------------------------------------------------------------------

interface SentimentChartProps {
  data: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export function SentimentChart({ data }: SentimentChartProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader title="Sentiment Distribution" />
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>No data available</Box>
        </CardContent>
      </Card>
    );
  }

  const series = [data.positive || 0, data.neutral || 0, data.negative || 0];
  const labels = ['Positive', 'Neutral', 'Negative'];

  const options: ApexOptions = {
    chart: {
      type: 'donut',
    },
    labels,
    colors: ['#10b981', '#6b7280', '#ef4444'],
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => {
                const total = (data.positive || 0) + (data.neutral || 0) + (data.negative || 0);
                return total.toString();
              },
            },
          },
        },
      },
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
      <CardHeader title="Sentiment Distribution" />
      <CardContent>
        <Box sx={{ width: '100%', height: 300 }}>
          <Chart options={options} series={series} type="donut" height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}
