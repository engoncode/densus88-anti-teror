import { useState } from 'react';
import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/contexts/AuthContext';

// ----------------------------------------------------------------------

export function LogoutButton() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: 2.5, pb: 2.5 }}>
      <Button
        fullWidth
        variant="outlined"
        color="error"
        onClick={handleLogout}
        disabled={loading}
        startIcon={
          loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <Icon icon="solar:logout-2-bold-duotone" width={20} />
          )
        }
        sx={{
          py: 1,
          borderRadius: 0.75,
          justifyContent: 'flex-start',
          pl: 2,
        }}
      >
        {loading ? 'Logging out...' : 'Logout'}
      </Button>
    </Box>
  );
}
