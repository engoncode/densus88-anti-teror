import { Card, CardContent, Stack, Typography, Box } from '@mui/material';
import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'primary' | 'info' | 'success' | 'warning' | 'error';
}

export function StatCard({ title, value, icon, color = 'primary' }: StatCardProps) {
  const colorMap = {
    primary: { bg: 'primary.lighter', text: 'primary.main' },
    info: { bg: 'info.lighter', text: 'info.main' },
    success: { bg: 'success.lighter', text: 'success.main' },
    warning: { bg: 'warning.lighter', text: 'warning.main' },
    error: { bg: 'error.lighter', text: 'error.main' },
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3">{value}</Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 64,
              height: 64,
              display: 'flex',
              borderRadius: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: colorMap[color].bg,
              color: colorMap[color].text,
            }}
          >
            <Icon icon={icon} width={32} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
