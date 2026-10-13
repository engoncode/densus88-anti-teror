import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Box, Typography, Skeleton } from '@mui/material';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

// Type assertion to fix React type incompatibility
const HeatmapComponent = CalendarHeatmap as any;

import apiClient from 'src/services/apiService';

// ----------------------------------------------------------------------

interface HeatmapData {
  date: string;
  count: number;
}

interface ContributionHeatmapProps {
  workspaceId: string;
}

export function ContributionHeatmap({ workspaceId }: ContributionHeatmapProps) {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const response = await apiClient.get<HeatmapData[]>(`/heatmap?workspace_id=${workspaceId}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchHeatmapData();
    }
  }, [workspaceId]);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Mentions per Day" />
        <CardContent>
          <Skeleton variant="rectangular" height={150} />
        </CardContent>
      </Card>
    );
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1); // 1 year ago

  return (
    <Card>
      <CardHeader title="Mentions per Day" subheader="Last 12 months contribution activity" />
      <CardContent>
        <Box
          sx={{
            '& .react-calendar-heatmap': {
              width: '100%',
            },
            '& .react-calendar-heatmap-small-text': {
              fontSize: '8px',
            },
            '& .react-calendar-heatmap text': {
              fontSize: '8px',
              fill: 'currentColor',
            },
            '& .react-calendar-heatmap-month-label': {
              fontSize: '9px',
            },
            '& .react-calendar-heatmap-weekday-label': {
              fontSize: '8px',
            },
            '& .react-calendar-heatmap rect': {
              rx: '3px',
              ry: '3px',
            },
            '& .color-empty': {
              fill: '#e3f2fd',
            },
            '& .color-scale-1': {
              fill: '#90caf9',
            },
            '& .color-scale-2': {
              fill: '#42a5f5',
            },
            '& .color-scale-3': {
              fill: '#1e88e5',
            },
            '& .color-scale-4': {
              fill: '#1565c0',
            },
          }}
        >
          <HeatmapComponent
            startDate={startDate}
            endDate={endDate}
            values={data}
            classForValue={(value: HeatmapData | null) => {
              if (!value) {
                return 'color-empty';
              }
              if (value.count < 5) return 'color-scale-1';
              if (value.count < 10) return 'color-scale-2';
              if (value.count < 20) return 'color-scale-3';
              return 'color-scale-4';
            }}
            tooltipDataAttrs={(value: HeatmapData | null) => {
              const date = value?.date
                ? new Date(value.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '';
              const mentions = value?.count || 0;
              return {
                'data-tooltip-id': 'heatmap-tooltip',
                'data-tooltip-content': `${date} • ${mentions} mention${mentions !== 1 ? 's' : ''}`,
              };
            }}
            showWeekdayLabels
          />

          <ReactTooltip
            id="heatmap-tooltip"
            place="top"
            style={{
              backgroundColor: '#1e293b',
              color: '#fff',
              fontSize: '12px',
              borderRadius: '6px',
              padding: '6px 10px',
            }}
          />
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Less
          </Typography>
          {['#e3f2fd', '#90caf9', '#42a5f5', '#1e88e5', '#1565c0'].map((color) => (
            <Box
              key={color}
              sx={{
                width: 12,
                height: 12,
                bgcolor: color,
                border: '1px solid #ddd',
                borderRadius: '3px',
              }}
            />
          ))}
          <Typography variant="caption" color="text.secondary">
            More
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
