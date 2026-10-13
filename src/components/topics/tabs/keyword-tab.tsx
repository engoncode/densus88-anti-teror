import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import WordCloud from 'react-d3-cloud';
import apiClient from 'src/services/apiService';
import ChartInsightBox from 'src/components/charts/chart-insight-box';

interface KeywordTabProps {
  topicId: number;
  network: string;
}

interface WordData {
  text: string;
  value: number;
}

const colorPalette = [
  '#ff4d6d',
  '#ff9e00',
  '#00bbf9',
  '#8338ec',
  '#ff006e',
  '#3a86ff',
  '#06d6a0',
  '#ef476f',
  '#ffd166',
  '#118ab2',
  '#073b4c',
  '#f72585',
  '#7209b7',
  '#3a0ca3',
  '#4361ee',
  '#4cc9f0',
];

const MAX_WORDS = 150;
const MAX_FONT_SIZE = 100;
const MIN_FONT_SIZE = 15;

export default function KeywordTab({ topicId, network }: KeywordTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [rawData, setRawData] = useState<WordData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        if (offsetWidth > 0) {
          setDimensions({
            width: offsetWidth,
            height: Math.max(offsetHeight, 500),
          });
        }
      }
    };

    // Initial dimension check
    updateDimensions();

    // Delayed check to ensure container is rendered
    const timeout = setTimeout(updateDimensions, 100);

    window.addEventListener('resize', updateDimensions);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    const fetchKeywords = async () => {
      setLoading(true);
      try {
        const response = await apiClient.post<{
          status: string;
          data: {
            id: number;
            platform: string;
            topic_id: number;
            keywords: Record<string, number>;
            created_at: string;
            updated_at: string;
          } | null;
        }>('/top-issues', {
          topic_id: topicId,
          network,
        });

        console.log('Full response:', response);
        console.log('Response data:', response.data);
        console.log('Keywords data:', response.data?.data);

        const keywordData = response.data?.data?.keywords;
        console.log('Extracted keywords:', keywordData);
        console.log('Type of keywordData:', typeof keywordData);
        console.log('Is keywordData object?', keywordData && typeof keywordData === 'object');

        if (keywordData && Object.keys(keywordData).length > 0) {
          const wordCloudData = Object.entries(keywordData)
            .map(([text, value]) => ({
              text,
              value: typeof value === 'number' ? value : parseFloat(value as string),
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, MAX_WORDS);

          console.log('Word cloud data length:', wordCloudData.length);
          console.log('Word cloud data sample:', wordCloudData.slice(0, 3));
          console.log('Setting rawData with:', wordCloudData);
          setRawData(wordCloudData);
          console.log('rawData set complete');

          // Force dimension update after data is set
          setTimeout(() => {
            if (containerRef.current) {
              const { offsetWidth, offsetHeight } = containerRef.current;
              console.log('Container actual size:', offsetWidth, offsetHeight);
              if (offsetWidth > 0) {
                setDimensions({
                  width: offsetWidth,
                  height: Math.max(offsetHeight, 500),
                });
              }
            }
          }, 200);
        } else {
          console.log('No keyword data found or empty');
          setRawData([]);
        }
      } catch (error) {
        console.error('Error fetching keywords:', error);
        setRawData([]);
      } finally {
        setLoading(false);
      }
    };

    if (topicId && network) {
      fetchKeywords();
    }
  }, [topicId, network]);

  const fontSizeMapper = useCallback(
    (word: WordData) => {
      if (rawData.length === 0) return MIN_FONT_SIZE;
      const maxValue = Math.max(...rawData.map((w) => w.value));
      const minValue = Math.min(...rawData.map((w) => w.value));
      const range = maxValue - minValue || 1;
      const normalized = (word.value - minValue) / range;
      return Math.floor(MIN_FONT_SIZE + normalized * (MAX_FONT_SIZE - MIN_FONT_SIZE));
    },
    [rawData]
  );

  const rotate = useCallback(() => 0, []);

  const fill = useCallback(() => colorPalette[Math.floor(Math.random() * colorPalette.length)], []);

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={8}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading keyword cloud...
        </Typography>
      </Box>
    );
  }

  if (rawData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Typography variant="body2" color="text.secondary">
          No keywords available
        </Typography>
      </Box>
    );
  }

  console.log('=== RENDER CHECK ===');
  console.log('Rendering with rawData length:', rawData.length);
  console.log('Dimensions:', dimensions);
  console.log('Loading state:', loading);
  console.log('First 3 items:', rawData.slice(0, 3));
  console.log('Will render WordCloud?', rawData.length > 0);

  return (
    <>
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          minHeight: 500,
          height: 500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.paper',
          borderRadius: 1,
          overflow: 'visible',
        }}
      >
        {rawData.length > 0 ? (
          <Box sx={{ width: '100%', height: '100%' }}>
            <WordCloud
              data={rawData}
              width={dimensions.width}
              height={dimensions.height}
              font="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              fontWeight="bold"
              fontSize={fontSizeMapper}
              spiral="archimedean"
              rotate={rotate}
              padding={5}
              random={Math.random}
              fill={fill}
            />
          </Box>
        ) : (
          <Typography>No data to render</Typography>
        )}
      </Box>
      <ChartInsightBox
        topicId={topicId}
        platform={network}
        type="chart_keyword"
        chartData={{
          keywords: Object.fromEntries(rawData.map((w) => [w.text, w.value])),
        }}
      />
    </>
  );
}
