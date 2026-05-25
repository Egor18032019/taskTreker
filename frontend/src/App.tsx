import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

import { ProjectsPage } from './pages/ProjectsPage';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProjectTasksPage } from './pages/ProjectTasksPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { AppLayout } from './components/AppLayout';
import { RecommendedTasksPage } from './pages/RecommendedTasksPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#1976d2' },
        secondary: { main: '#9c27b0' },
    },
});

function App() {
    return (
        <NotificationProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter>
                        <AppBar position="static">
                            <Toolbar>
                                <Button color="inherit" component={Link} to="/tasks/recommended">Рекомендации</Button>
                                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                    <Button color="inherit" component={Link} to="/projects">Проекты
                                    </Button>
                                </Typography>
                                <Button color="inherit" component={Link} to="/profile">Профиль</Button>

                            </Toolbar>
                        </AppBar>

                        <Box component="main" sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                            <Routes>
                                <Route
                                    path="/tasks/recommended"
                                    element={<RecommendedTasksPage />}
                                />
                                <Route path="/" element={<Navigate to="/tasks/recommended" replace />} />
                                <Route path="/projects" element={
                                    <AppLayout>
                                        <ProjectsPage />
                                    </AppLayout>
                                } />
                                <Route path="/tasks" element={
                                    <AppLayout>
                                        <ProjectTasksPage />
                                    </AppLayout>
                                } />
                                <Route path="/tasks/:id" element={<TaskDetailPage />} />
                                <Route path="/profile" element={
                                    <div>
                                        <div>The content of the profile page will be available here...</div>
                                        <div>Содержимое страницы профиля будет доступно здесь...</div>
                                    </div>
                                } />
                                <Route path="*" element={<Navigate to="/projects" replace />} />
                            </Routes>
                        </Box>
                    </BrowserRouter>
                </ThemeProvider>
            </QueryClientProvider>
        </NotificationProvider>
    );
}

export default App;