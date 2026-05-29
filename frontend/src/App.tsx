import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

import { ProjectsPage } from './pages/ProjectsPage';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProjectTasksPage } from './pages/ProjectTasksPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { AppLayout } from './components/AppLayout';
import { RecommendedTasksPage } from './pages/RecommendedTasksPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RequireAuth } from './components/RequireAuth';
import { Header } from './components/Header';
import { ProfilePage } from './pages/ProfilePage';

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

                        <Header />

                        <Box component="main" sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                            <Routes>
                                {/* Публичные маршруты */}
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />


                                <Route path="/tasks/recommended" element={<RequireAuth><RecommendedTasksPage /></RequireAuth>} />
                                <Route path="/projects" element={<RequireAuth><AppLayout><ProjectsPage /></AppLayout></RequireAuth>} />
                                <Route path="/" element={<RequireAuth><Navigate to="/tasks/recommended" replace /></RequireAuth>} />

                                <Route path="/tasks" element={
                                    <RequireAuth>
                                        <AppLayout>
                                            <ProjectTasksPage />
                                        </AppLayout>
                                    </RequireAuth>
                                } />
                                <Route path="/tasks/:id" element={<RequireAuth><TaskDetailPage /></RequireAuth>} />
                                <Route path="/profile/*" element={
                                    <RequireAuth>
                                        <ProfilePage />
                                    </RequireAuth>
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