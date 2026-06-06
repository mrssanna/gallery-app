import { Outlet, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { AppButton } from './ui/AppButton';

export const Layout = () => {
  const { token, logout } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#2c3e50' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🛡️ Admin Panel
          </Typography>
          <AppButton color="error" onClick={logout}>
            Logout
          </AppButton>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flex: 1, py: 4, maxWidth: '1200px' }}>
        <Outlet />
      </Container>
    </Box>
  );
};
