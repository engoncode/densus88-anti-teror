import type { FormEvent } from 'react';

import { useCallback, useState } from 'react';

import { useGoogleLogin } from '@react-oauth/google';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/AuthContext';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setError(null);
      setLoading(true);

      try {
        await login(email, password);
        console.log('Login successful, redirecting to dashboard...');
        // Use window.location for full page reload to ensure clean state
        window.location.href = '/';
      } catch (err: any) {
        console.error('Login error:', err);
        setError(err.response?.data?.message || err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    },
    [email, password, login]
  );

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(null);
      setLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        window.location.href = '/';
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Google login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google login failed. Please try again.'),
  });

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleSignIn}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        name="email"
        label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="narasainsimpact@gmail.com"
        required
        type="email"
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        required
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

      <Divider sx={{ my: 2.5, width: '100%' }}>
        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
          OR
        </Typography>
      </Divider>

      <Button
        fullWidth
        size="large"
        color="inherit"
        variant="outlined"
        disabled={loading}
        onClick={() => handleGoogleLogin()}
        startIcon={
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
        }
        sx={{ gap: 1.5 }}
      >
        Sign in with Google
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Sign in to Sentiment Analysis</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Monitor and analyze social media sentiment in real-time
        </Typography>
      </Box>
      {renderForm}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          By signing in, you agree to our{' '}
          <Box
            component="a"
            href="/terms-of-service"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Terms of Service
          </Box>
          {' and '}
          <Box
            component="a"
            href="/privacy-policy"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Privacy Policy
          </Box>
        </Typography>
      </Box>
    </>
  );
}
