"use client";
import { useEffect, useRef, useCallback, useState } from 'react';
import { Header } from '../../components/Header';
import { ImageCard } from '../../components/ImageCard';
import { LightboxDialog } from '../../components/ui/LightboxDialog';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useFeedImages } from '../../hooks/useImages';

export default function Feed() {
  const perPage = 12;
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Состояния для поиска
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce логика: обновляем реальный поисковый запрос только через 500мс после окончания ввода
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Передаем debouncedSearch в хук React Query
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useFeedImages(perPage, debouncedSearch);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [handleObserver]);

  const images = data ? data.pages.flatMap((page) => page.node) : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      <Header />

      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto', width: '100%' }}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={4} gap={2}>
          <Typography variant="h4" fontWeight="bold" m={0}>
            🌟 Лента публикаций
          </Typography>
          
          {/* Поле поиска */}
          <TextField
            placeholder="Поиск по названию или автору..."
            variant="outlined"
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: '300px' }, bgcolor: 'white' }}
          />
        </Box>
        
        {status === 'pending' ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : status === 'error' ? (
          <Typography color="error" textAlign="center">
            Ошибка загрузки ленты: {error.message}
          </Typography>
        ) : images.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }} elevation={0}>
            <Typography color="textSecondary" variant="h6">
              {debouncedSearch ? 'По вашему запросу ничего не найдено.' : 'В ленте пока нет картинок. Будьте первым, кто опубликует что-нибудь!'}
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={4}>
              {images.map((img) => (
                <Grid item xs={12} md={6} key={img.id}>
                  <ImageCard 
                    image={img} 
                    onImageClick={setLightboxImage} 
                  />
                </Grid>
              ))}
            </Grid>

            <div ref={observerTarget} style={{ height: '40px', margin: '40px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {isFetchingNextPage && (
                <CircularProgress size={30} />
              )}
              {!hasNextPage && images.length > 0 && (
                <Typography color="textSecondary" variant="body2">
                  Вы просмотрели все публикации!
                </Typography>
              )}
            </div>
          </>
        )}
      </Box>

      <LightboxDialog 
        imageUrl={lightboxImage} 
        onClose={() => setLightboxImage(null)} 
      />
    </Box>
  );
}
