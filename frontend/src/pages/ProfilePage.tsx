import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Card, CardContent, Stack,
    TextField, Button, Alert, CircularProgress, Chip, Tooltip
} from '@mui/material';
import { Save, Telegram, Chat, PriorityHigh, CalendarToday, Grade, BarChart, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { WeightsSlider } from '../components/WeightsSlider';
import type { ProfileForm } from '../types';


export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { profile, isLoading, updateProfile, isUpdating } = useProfile();

    const [form, setForm] = useState<ProfileForm>({
        email: '',
        telegramHandle: '',
        maxHandle: '',
        weights: { priority: 0.35, deadline: 0.30, complexity: 0.20, size: 0.15 }
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Заполняем форму при загрузке профиля
    useEffect(() => {
        if (profile) {
            setForm({
                email: profile.email || '',
                telegramHandle: profile.telegramHandle || '',
                maxHandle: profile.maxHandle || '',
                weights: profile.weights ?? { priority: 0.35, deadline: 0.30, complexity: 0.20, size: 0.15 }
            });
        }
    }, [profile]);

    // 🔹 Валидация: сумма весов должна быть ≈ 1.0
    const validateWeights = () => {
        const sum = Object.values(form.weights).reduce((a, b) => (a || 0) + (b || 0), 0);
        return Math.abs(sum - 1.0) < 0.01;
    };

    const handleSave = async () => {
        if (!validateWeights()) {
            setError('⚠️ Сумма весов должна быть равна 100%');
            return;
        }

        setError(null);
        try {
            await updateProfile({
                email: form.email || undefined,
                telegramHandle: form.telegramHandle || undefined,
                maxHandle: form.maxHandle || undefined,
                weights: form.weights
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Ошибка сохранения');
        }
    };

    if (isLoading) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Загрузка профиля...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Хедер */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                    Назад
                </Button>
                <Typography variant="h5">⚙️ Настройки профиля</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>✅ Настройки сохранены!</Alert>}

            <Stack spacing={3}>
                {/* 📱 Контактная информация */}
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>👤 Основная информация</Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Логин: <strong>{profile?.username}</strong>
                        </Typography>

                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={form.email}
                            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                            helperText="Email для уведомлений"
                            sx={{ mb: 2 }}
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="Telegram"
                                placeholder="@username"
                                fullWidth
                                value={form.telegramHandle}
                                onChange={(e) => setForm(f => ({ ...f, telegramHandle: e.target.value }))}
                                slotProps={{
                                    input: {
                                        startAdornment: <Telegram color="action" sx={{ mr: 1 }} />
                                    }
                                }}
                            />
                            <TextField
                                label="Max"
                                placeholder="ваш_ник"
                                fullWidth
                                value={form.maxHandle}
                                onChange={(e) => setForm(f => ({ ...f, maxHandle: e.target.value }))}
                                slotProps={{
                                    input: {
                                        startAdornment: <Chat color="action" sx={{ mr: 1 }} />
                                    }
                                }}
                            />
                        </Stack>
                    </CardContent>
                </Card>

                {/* ⚖️ Веса алгоритма рекомендаций */}
                <Card variant="outlined">
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">🎯 Веса рекомендаций</Typography>
                            <Tooltip title="Алгоритм учитывает эти веса при подборе задач на день">
                                <Chip label="Как это работает?" size="small" variant="outlined" />
                            </Tooltip>
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            Настройте, какие факторы важнее при подборе задач. Сумма = 100%
                        </Typography>

                        <Stack spacing={2}>
                            <WeightsSlider
                                label="Приоритет задачи"
                                value={form.weights.priority || 0}
                                onChange={(v) => setForm(f => ({
                                    ...f, weights: { ...f.weights, priority: v }
                                }))}
                                color="#d32f2f"
                                icon={<PriorityHigh fontSize="small" />}
                            />
                            <WeightsSlider
                                label="Срочность (дедлайн)"
                                value={form.weights.deadline || 0}
                                onChange={(v) => setForm(f => ({
                                    ...f, weights: { ...f.weights, deadline: v }
                                }))}
                                color="#ed6c02"
                                icon={<CalendarToday fontSize="small" />}
                            />
                            <WeightsSlider
                                label="Простота выполнения"
                                value={form.weights.complexity || 0}
                                onChange={(v) => setForm(f => ({
                                    ...f, weights: { ...f.weights, complexity: v }
                                }))}
                                color="#2e7d32"
                                icon={<Grade fontSize="small" />}
                            />
                            <WeightsSlider
                                label="Малый размер"
                                value={form.weights.size || 0}
                                onChange={(v) => setForm(f => ({
                                    ...f, weights: { ...f.weights, size: v }
                                }))}
                                color="#1976d2"
                                icon={<BarChart fontSize="small" />}
                            />
                        </Stack>

                        {/* Индикатор суммы */}
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography
                                variant="caption"
                                color={validateWeights() ? 'success.main' : 'error.main'}
                                sx={{ fontWeight: 600 }}
                            >
                                Сумма: {Math.round(Object.values(form.weights).reduce((a, b) => (a || 0) + (b || 0), 0) * 100)}%
                                {!validateWeights() && ' ⚠️ Должно быть 100%'}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Метаданные */}
                {profile && (
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                📋 Метаданные
                            </Typography>
                            <Stack direction="row" spacing={2}
                                sx={{ flexWrap: 'wrap' }}>
                                <Typography variant="body2">
                                    <strong>ID:</strong> {profile.userId}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Создан:</strong> {new Date(profile.createdAt).toLocaleDateString('ru-RU')}
                                </Typography>
                                {profile.updatedAt && (
                                    <Typography variant="body2">
                                        <strong>Обновлён:</strong> {new Date(profile.updatedAt).toLocaleDateString('ru-RU')}
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                )}
            </Stack>

            {/* Кнопка сохранения */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    startIcon={isUpdating ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleSave}
                    disabled={isUpdating || !validateWeights()}
                >
                    {isUpdating ? 'Сохранение...' : '💾 Сохранить изменения'}
                </Button>
            </Box>
        </Container>
    );
};