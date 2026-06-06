"use client";
import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';
import { useProfile } from '../hooks/useProfile';

export const Header = () => {
  const { token, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Получаем данные пользователя через React Query
  const { data: user } = useProfile();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Формируем отображаемое имя: Имя Фамилия, либо просто Email
  const displayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : user?.login;

  // --- Мобильное меню (Drawer) ---
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold' }}>
        🖼️ Моя Галерея
      </Typography>
      <Divider />
      
      {token && user && (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, bgcolor: '#f8f9fa' }}>
          <Avatar src={user.avatarUrl} sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '2rem' }}>
            {displayName?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold">
            {displayName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user.login}
          </Typography>
        </Box>
      )}
      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/feed" selected={pathname === '/feed'}>
            <ListItemIcon><HomeIcon color={pathname === '/feed' ? 'primary' : 'inherit'} /></ListItemIcon>
            <ListItemText primary="Лента публикаций" />
          </ListItemButton>
        </ListItem>

        {token ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/" selected={pathname === '/'}>
                <ListItemIcon><PhotoLibraryIcon color={pathname === '/' ? 'primary' : 'inherit'} /></ListItemIcon>
                <ListItemText primary="Мои картинки" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/profile" selected={pathname === '/profile'}>
                <ListItemIcon><PersonIcon color={pathname === '/profile' ? 'primary' : 'inherit'} /></ListItemIcon>
                <ListItemText primary="Профиль" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={logout} sx={{ color: 'error.main' }}>
                <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                <ListItemText primary="Выйти" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/login">
              <ListItemIcon><LoginIcon /></ListItemIcon>
              <ListItemText primary="Войти" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        {/* Логотип (виден всегда) */}
        <Typography 
          variant="h6" 
          component={Link} 
          href="/" 
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
        >
          🖼️ Моя Галерея
        </Typography>
        
        {/* Десктопное меню (скрыто на экранах меньше md) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
          <Link href="/feed" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography 
              variant="body1" 
              fontWeight={pathname === '/feed' ? 'bold' : 'normal'}
              sx={{ opacity: pathname === '/feed' ? 1 : 0.8, '&:hover': { opacity: 1 } }}
            >
              Лента
            </Typography>
          </Link>

          {token ? (
            <>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography 
                  variant="body1" 
                  fontWeight={pathname === '/' ? 'bold' : 'normal'}
                  sx={{ opacity: pathname === '/' ? 1 : 0.8, '&:hover': { opacity: 1 } }}
                >
                  Мои картинки
                </Typography>
              </Link>
              <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Box display="flex" alignItems="center" gap={1} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
                  <Avatar key={user?.avatarUrl} src={user?.avatarUrl} sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '1rem' }}>
                    {displayName?.[0]?.toUpperCase()}
                  </Avatar>
                  <Typography variant="body1" fontWeight="medium">
                    {displayName}
                  </Typography>
                </Box>
              </Link>
              <Button color="inherit" onClick={logout} variant="outlined" size="small">
                Выйти
              </Button>
            </>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Button color="inherit" variant="outlined" size="small">
                Войти
              </Button>
            </Link>
          )}
        </Box>

        {/* Иконка Гамбургера (видна только на мобильных) */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="end"
          onClick={handleDrawerToggle}
          sx={{ display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* Выезжающее боковое меню */}
      <Drawer
        anchor="right"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Лучше для производительности на мобильных
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};
