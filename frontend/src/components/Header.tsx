import { Box, Button, Typography, AppBar, Toolbar, } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
    const { profile, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    TaskTracker
                </Typography>

                {isAuthenticated ? (
                    <>
                        <Button color="inherit" component={Link} to="/tasks/recommended">🎯 Рекомендации</Button>
                        <Button color="inherit" component={Link} to="/projects">Проекты</Button>
                        <Button color="inherit" component={Link} to="/profile">⚙️ Профиль</Button>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="white">
                                {profile?.username}
                            </Typography>
                            <Button color="inherit" size="small" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Button color="inherit" component={Link} to="/login">Войти</Button>
                        <Button color="inherit" component={Link} to="/register">Регистрация</Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};