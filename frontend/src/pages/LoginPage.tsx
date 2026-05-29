import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, Typography, TextField, Button, Alert,
  Paper, CircularProgress, Link
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggingIn } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(form);
      // Редирект на страницу, с которой перенаправили, или на /
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5" align="center" gutterBottom>
            🔐 Вход в TaskTracker
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Логин"
              fullWidth
              margin="normal"
              value={form.username}
              onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
              autoComplete="username"
              required
              disabled={isLoggingIn}
            />
            <TextField
              label="Пароль"
              type="password"
              fullWidth
              margin="normal"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              required
              disabled={isLoggingIn}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
              disabled={isLoggingIn || !form.username || !form.password}
            >
              {isLoggingIn ? <CircularProgress size={24} /> : 'Войти'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Нет аккаунта?{' '}
              <Link component={RouterLink} to="/register">
                Зарегистрироваться
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};