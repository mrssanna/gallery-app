import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { AppTextField } from '../components/ui/AppTextField';
import { translateError } from '../utils/error-mapper';
import { z } from 'zod';

const LoginResponseSchema = z.object({
  accessToken: z.string().optional(),
  message: z
    .union([
      z.string(),
      z.object({
        message: z.string(),
      }),
    ])
    .optional(),
});

export const Login = () => {
  const [email, setEmail] = useState('admin@mail.ru');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void performLogin();
  };

  const performLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: email, password }),
      });

      const rawData: unknown = await res.json();

      const data = LoginResponseSchema.parse(rawData);

      if (res.ok && data.accessToken) {
        login(data.accessToken);
        navigate('/');
      } else {
        let errorKey = 'Login failed';
        if (data.message) {
          errorKey =
            typeof data.message === 'string'
              ? data.message
              : data.message.message;
        }
        setError(translateError(errorKey));
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('Validation error:', err.errors);
        setError('Invalid server response format');
      } else {
        setError('Network error. Is backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <AppTextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
          <AppTextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <AppButton
            type="submit"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </AppButton>
        </form>
      </Paper>
    </Box>
  );
};
