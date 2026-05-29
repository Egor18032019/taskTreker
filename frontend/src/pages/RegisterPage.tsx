import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, Typography, TextField, Button, Alert,
  Paper, CircularProgress, Link
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';


export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isRegistering } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (form.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" align="center" gutterBottom>
            📝 Регистрация
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField label="Логин" fullWidth margin="normal"
              value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} required />
            <TextField label="Email" type="email" fullWidth margin="normal"
              value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
            <TextField label="Пароль" type="password" fullWidth margin="normal"
              value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} required />
            <TextField label="Повторите пароль" type="password" fullWidth margin="normal"
              value={form.confirmPassword} onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }}
              disabled={isRegistering}>
              {isRegistering ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
            </Button>
          </form>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Уже есть аккаунт? <Link component={RouterLink} to="/login">Войти</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};