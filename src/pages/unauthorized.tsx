import { Box, Button, Container, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Unauthorized Access</title>
      </Helmet>

      <Container>
        <Box
          sx={{
            py: 12,
            maxWidth: 480,
            mx: 'auto',
            display: 'flex',
            minHeight: '100vh',
            textAlign: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h3" sx={{ mb: 3 }}>
            Unauthorized Access
          </Typography>

          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            You don't have permission to access this page. Please contact your administrator if you
            believe this is a mistake.
          </Typography>

          <Button size="large" variant="contained" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    </>
  );
}
