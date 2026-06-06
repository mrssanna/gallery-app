"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useLogin } from '../../hooks/useAuthQueries';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Используем мутацию из React Query
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Вызываем мутацию, передавая email и пароль
    loginMutation.mutate({ login: email, password });
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          Вход в систему
        </Typography>
        
        {/* Показываем ошибку, если мутация завершилась с ошибкой */}
        {loginMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loginMutation.error.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="off"
          />
          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
          />
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            fullWidth
            size="large"
            sx={{ mt: 1 }}
          >
            {loginMutation.isPending ? 'Вход...' : 'Войти'}
          </Button>
        </form>
        
        <Typography align="center" mt={3} variant="body2" color="textSecondary">
          Нет аккаунта?{' '}
          <Link href="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Зарегистрироваться
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
