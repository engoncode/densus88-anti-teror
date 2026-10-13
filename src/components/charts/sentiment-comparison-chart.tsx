import { Card, CardContent, Typography, Box } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

// Types
interface Topic {
  id: number;
  name: string;
}

interface NetworkData {
  percentage?: {
    data: { sentiment: string; percentage: number }[];
  };
}

interface TopicData {
  topic_id: number;
  topic_name: string;
  networks: {
    [networkName: string]: NetworkData;
  };
  active_networks: string[];
}

interface ComparisonData {
  success: boolean;
  data: {
    [topicId: string]: TopicData;
  };
  total_topics: number;
}

interface SentimentComparisonChartProps {
  chartData: ComparisonData;
  topics: Topic[];
}

export default function SentimentComparisonChart({
  chartData,
  topics,
}: SentimentComparisonChartProps) {
  // Prepare data for chart
  const topicEntries = Object.entries(chartData.data || {});
  const topicNames = topicEntries.map(([_, topicData]) => topicData.topic_name);

  const positiveData = topicEntries.map(([_, topicData]) => {
    const firstNetwork = topicData.active_networks[0];
    const networkData = topicData.networks[firstNetwork];
    const sentiment = networkData?.percentage?.data?.find((p) => p.sentiment === 'positive');
    return sentiment ? sentiment.percentage : 0;
  });

  const neutralData = topicEntries.map(([_, topicData]) => {
    const firstNetwork = topicData.active_networks[0];
    const networkData = topicData.networks[firstNetwork];
    const sentiment = networkData?.percentage?.data?.find((p) => p.sentiment === 'neutral');
    return sentiment ? sentiment.percentage : 0;
  });

  const negativeData = topicEntries.map(([_, topicData]) => {
    const firstNetwork = topicData.active_networks[0];
    const networkData = topicData.networks[firstNetwork];
    const sentiment = networkData?.percentage?.data?.find((p) => p.sentiment === 'negative');
    return sentiment ? sentiment.percentage : 0;
  });

  // Define series and options for ApexCharts
  const series = [
    { name: 'Positif', data: positiveData },
    { name: 'Netral', data: neutralData },
    { name: 'Negatif', data: negativeData },
  ];

  const options: ApexOptions = {
    colors: ['#10B981', '#FBBF24', '#EF4444'], // Green, Yellow, Red
    chart: {
      type: 'bar',
      height: 350,
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: true },
      fontFamily: 'inherit',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '60%',
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#304758'],
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontWeight: 500,
      fontSize: '14px',
    },
    xaxis: {
      categories: topicNames,
      labels: { style: { colors: '#6B7280' } },
    },
    yaxis: {
      title: { text: 'Persentase (%)', style: { color: '#6B7280' } },
      min: 0,
      max: 100,
      labels: { formatter: (val) => `${val}%`, style: { colors: '#6B7280' } },
    },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Perbandingan Sentimen
        </Typography>
        <Box>
          <ReactApexChart options={options} series={series} type="bar" height={350} />
        </Box>
      </CardContent>
    </Card>
  );
}
