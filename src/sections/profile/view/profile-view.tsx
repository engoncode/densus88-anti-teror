// src/sections/profile/view/profile-view.tsx
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import { useAuth } from 'src/contexts/AuthContext';
import authService from 'src/services/authService';

import type { User } from 'src/types/common';

// ----------------------------------------------------------------------

export function ProfileView() {
  const { user: authUser, setUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // Password form
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch profile from API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfile(data);
      setName(data.name || '');
      setUsername(data.username || '');
      setEmail(data.email || '');
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load profile',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const updatedUser = await authService.updateProfile({ name, username, email });
      setProfile(updatedUser);
      setUser(updatedUser);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New password and confirmation do not match',
        severity: 'error',
      });
      return;
    }

    if (newPassword.length < 8) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 8 characters',
        severity: 'error',
      });
      return;
    }

    try {
      setSaving(true);
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      setSnackbar({
        open: true,
        message: 'Password changed successfully',
        severity: 'success',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to change password',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4 }}>
          Profile
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
                  <Skeleton variant="circular" width={120} height={120} />
                  <Skeleton width="60%" height={32} />
                  <Skeleton width="80%" height={24} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Skeleton width="40%" height={40} sx={{ mb: 2 }} />
                <Skeleton width="100%" height={56} sx={{ mb: 2 }} />
                <Skeleton width="100%" height={56} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 4 }}>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: 48,
                    bgcolor: 'primary.main',
                  }}
                >
                  {profile?.name?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <Box textAlign="center">
                  <Typography variant="h6">{profile?.name || 'Admin'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{profile?.username}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 'primary.lighter',
                      color: 'primary.dark',
                      display: 'inline-block',
                    }}
                  >
                    {profile?.role?.name?.toUpperCase() || 'USER'}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    Email
                  </Typography>
                  <Typography variant="body2">{profile?.email}</Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    Workspace
                  </Typography>
                  <Typography variant="body2">{profile?.workspace?.name || '-'}</Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    Account Expiry
                  </Typography>
                  <Typography variant="body2">
                    {profile?.expired ? new Date(profile.expired).toLocaleString() : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    Joined
                  </Typography>
                  <Typography variant="body2">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : '-'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* Basic Info */}
            <Card>
              <CardHeader title="Basic Information" subheader="Update your profile information" />
              <Divider />
              <CardContent>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon icon="solar:user-bold-duotone" width={24} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon icon="solar:user-id-bold-duotone" width={24} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon icon="solar:letter-bold-duotone" width={24} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      startIcon={<Icon icon="solar:diskette-bold-duotone" />}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader
                title="Change Password"
                subheader="Update your password to keep your account secure"
              />
              <Divider />
              <CardContent>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon icon="solar:lock-password-bold-duotone" width={24} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            <Icon
                              icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    helperText="Minimum 8 characters"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon icon="solar:lock-bold-duotone" width={24} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={confirmPassword !== '' && newPassword !== confirmPassword}
                    helperText={
                      confirmPassword !== '' && newPassword !== confirmPassword
                        ? 'Passwords do not match'
                        : ''
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon icon="solar:lock-bold-duotone" width={24} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleChangePassword}
                      disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                      startIcon={<Icon icon="solar:key-bold-duotone" />}
                    >
                      {saving ? 'Updating...' : 'Change Password'}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
