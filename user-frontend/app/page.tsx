"use client";
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { Header } from '../components/Header';
import { AppConfirmDialog } from '../components/ui/AppConfirmDialog';
import { ImageCard, ImageItem } from '../components/ImageCard';
import { LightboxDialog } from '../components/ui/LightboxDialog';
import { UploadForm } from '../components/UploadForm';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { translateError } from '../utils/error-mapper';
import { 
  useUserImages, 
  useUploadImage, 
  useDeleteImage, 
  useUpdateImage, 
  usePublishImage 
} from '../hooks/useImages';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export default function Home() {
  const { token, logout } = useAuth();
  const queryClient = useQueryClient();
  
  const [pageNo, setPageNo] = useState(1);
  const perPage = 12;

  // Состояния для поиска
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce логика: обновляем реальный поисковый запрос только через 500мс после окончания ввода
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPageNo(1); // При новом поиске всегда сбрасываем на первую страницу
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 1. Получаем данные через React Query (передаем debouncedSearch)
  const { data: imagesData, isLoading, isFetching } = useUserImages(pageNo, perPage, debouncedSearch);
  const images = imagesData?.node || [];
  const totalPages = imagesData?.pageInfo?.totalPageCount || 1;

  // 2. Получаем мутации
  const uploadMutation = useUploadImage();
  const deleteMutation = useDeleteImage();
  const updateMutation = useUpdateImage();
  const publishMutation = usePublishImage();

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'info' | 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'info',
  });
  
  const [editDialog, setEditDialog] = useState({ open: false, id: '', title: '', author: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: '' });
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token: token },
      transports: ['websocket'],
    });

    socket.on('upload_status', (data: { filename: string; status: string; message: string }) => {
      if (data.status === 'processing') {
        setToast({ open: true, message: `⏳ ${data.message}`, severity: 'info' });
      } else if (data.status === 'done') {
        setToast({ open: true, message: `✅ ${data.message}`, severity: 'success' });
        setPageNo(1);
        queryClient.invalidateQueries({ queryKey: ['userImages'] });
      }
    });

    socket.on('error', (err: { message: string }) => {
      setToast({ open: true, message: `❌ Ошибка: ${err.message}`, severity: 'error' });
      if (err.message === 'Token expired') logout();
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token, queryClient, logout]);

  const handleUpload = async (file: File, title: string, author: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (author) formData.append('author', author);

    try {
      await uploadMutation.mutateAsync(formData);
    } catch (err: any) {
      setToast({ open: true, message: `❌ ${translateError(err.message)}`, severity: 'error' });
      throw err;
    }
  };

  const confirmDelete = () => {
    const id = deleteDialog.id;
    setDeleteDialog({ open: false, id: '' });
    
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setToast({ open: true, message: '✅ Картинка удалена', severity: 'success' });
        if (images.length === 1 && pageNo > 1) {
          setPageNo(pageNo - 1);
        }
      },
      onError: () => {
        setToast({ open: true, message: '❌ Ошибка при удалении', severity: 'error' });
      }
    });
  };

  const handleEditSubmit = () => {
    updateMutation.mutate(
      { id: editDialog.id, title: editDialog.title, author: editDialog.author },
      {
        onSuccess: () => {
          setToast({ open: true, message: '✅ Информация обновлена', severity: 'success' });
          setEditDialog({ ...editDialog, open: false });
        },
        onError: (err) => {
          setToast({ open: true, message: `❌ ${translateError(err.message)}`, severity: 'error' });
        }
      }
    );
  };

  const handlePublishToggle = (id: string, isPublished: boolean) => {
    publishMutation.mutate(id, {
      onSuccess: () => {
        setToast({ 
          open: true, 
          message: isPublished ? '✅ Снято с публикации' : '✅ Опубликовано', 
          severity: 'success' 
        });
      },
      onError: (err) => {
        setToast({ open: true, message: `❌ ${translateError(err.message)}`, severity: 'error' });
      }
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <Box component="main" sx={{ flex: 1, p: 4, maxWidth: '1200px', mx: 'auto', width: '100%' }}>
        <UploadForm onUpload={handleUpload} uploading={uploadMutation.isPending} />

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Ваша Галерея
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
        
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : images.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent' }} variant="outlined">
            <Typography color="textSecondary">
              {debouncedSearch ? 'По вашему запросу ничего не найдено.' : 'Картинок пока нет. Загрузите свою первую картинку выше!'}
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {images.map((img) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={img.id}>
                  <ImageCard 
                    image={img} 
                    isOwner={true} 
                    onImageClick={setLightboxImage}
                    onEdit={(img) => setEditDialog({ open: true, id: img.id, title: img.title || '', author: img.author || '' })}
                    onDelete={(id) => setDeleteDialog({ open: true, id })}
                    onPublishToggle={handlePublishToggle}
                  />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination 
                  count={totalPages} 
                  page={pageNo} 
                  onChange={(_, value) => setPageNo(value)} 
                  color="primary" 
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Edit Image Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ ...editDialog, open: false })} fullWidth maxWidth="sm">
        <DialogTitle>Редактировать информацию</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Название"
              value={editDialog.title}
              onChange={(e) => setEditDialog({ ...editDialog, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Автор"
              value={editDialog.author}
              onChange={(e) => setEditDialog({ ...editDialog, author: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog({ ...editDialog, open: false })} color="inherit">
            Отмена
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AppConfirmDialog
        open={deleteDialog.open}
        title="Удаление картинки"
        content="Вы уверены, что хотите удалить эту картинку? Это действие нельзя отменить."
        confirmText="Удалить"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, id: '' })}
      />

      <LightboxDialog 
        imageUrl={lightboxImage} 
        onClose={() => setLightboxImage(null)} 
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
