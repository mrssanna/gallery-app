"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useRegister } from '../../hooks/useAuthQueries';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Используем мутацию из React Query
  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Вызываем мутацию, передавая email и пароль
    registerMutation.mutate({ login: email, password });
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          Регистрация
        </Typography>
        
        {/* Показываем ошибку, если мутация завершилась с ошибкой */}
        {registerMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {registerMutation.error.message}
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
            helperText="Мин. 8 символов, 1 заглавная, 1 спецсимвол"
            autoComplete="new-password"
          />
          <Button
            type="submit"
            disabled={registerMutation.isPending}
            fullWidth
            size="large"
            sx={{ mt: 1 }}
          >
            {registerMutation.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>
        
        <Typography align="center" mt={3} variant="body2" color="textSecondary">
          Уже есть аккаунт?{' '}
          <Link href="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Войти
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
