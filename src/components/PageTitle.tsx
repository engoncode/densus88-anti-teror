import { Box, Typography } from '@mui/material';

interface PageTitleProps {
  title: string;
}

export function PageTitle({ title }: PageTitleProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" fontWeight="bold">
        {title}
      </Typography>
    </Box>
  );
}
