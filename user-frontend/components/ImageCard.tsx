import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import { formatBytes } from '../utils/formatters';

export interface ImageItem {
  id: string;
  title: string;
  author: string;
  url: string;
  thumbnailUrl: string;
  userAvatarUrl?: string;
  format: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

interface ImageCardProps {
  image: ImageItem;
  isOwner?: boolean; // Если true, показываем кнопки редактирования/удаления
  onImageClick: (url: string) => void;
  onEdit?: (image: ImageItem) => void;
  onDelete?: (id: string) => void;
  onPublishToggle?: (id: string, isPublished: boolean) => void;
}

export const ImageCard = ({
  image,
  isOwner = false,
  onImageClick,
  onEdit,
  onDelete,
  onPublishToggle,
}: ImageCardProps) => {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: isOwner ? 360 : 400, // В ленте карточка выше, так как нет кнопок действий
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        }
      }}
    >
      {/* Бейдж публикации (только для владельца) */}
      {isOwner && image.publishedAt && (
        <Chip 
          label="Опубликовано" 
          color="success" 
          size="small" 
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, fontWeight: 'bold', boxShadow: 1 }}
        />
      )}

      {/* Шапка с автором (только для ленты) */}
      {!isOwner && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #eee' }}>
          <Avatar src={image.userAvatarUrl} sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            {(image.author || 'Н')[0].toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" fontWeight="bold" noWrap title={image.author || 'Неизвестен'}>
              {image.author || 'Неизвестен'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {image.publishedAt ? new Date(image.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </Typography>
          </Box>
        </Box>
      )}
      
      <CardMedia
        component="img"
        image={image.thumbnailUrl || image.url}
        alt={image.title || 'Image'}
        sx={{ 
          height: isOwner ? 200 : 250, 
          minHeight: isOwner ? 200 : 250, 
          objectFit: 'cover', 
          cursor: 'pointer', 
          width: '100%' 
        }}
        onClick={() => onImageClick(image.url)}
      />
      
      <CardContent sx={{ flexGrow: 1, overflow: 'hidden', p: 2, pb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold" noWrap title={image.title || 'Без названия'}>
          {image.title || 'Без названия'}
        </Typography>
        
        {isOwner && (
          <>
            <Typography variant="body2" color="textSecondary" noWrap title={image.author || 'Неизвестен'}>
              Автор: {image.author || 'Неизвестен'}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <Typography variant="caption" color="textSecondary" display="block">
                {new Date(image.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                {formatBytes(image.size)}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>

      {/* Кнопки действий (только для владельца) */}
      {isOwner && onEdit && onDelete && onPublishToggle && (
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0, flexWrap: 'wrap', gap: 1 }}>
          <Box display="flex" gap={1}>
            <Button size="small" color="primary" onClick={() => onEdit(image)}>
              Изменить
            </Button>
            <Button size="small" color="error" onClick={() => onDelete(image.id)}>
              Удалить
            </Button>
          </Box>
          <Button 
            size="small" 
            color={image.publishedAt ? "secondary" : "success"} 
            variant={image.publishedAt ? "outlined" : "contained"}
            disableElevation
            onClick={() => onPublishToggle(image.id, !!image.publishedAt)}
            sx={{ width: '100%' }}
          >
            {image.publishedAt ? 'Снять с публикации' : 'Опубликовать'}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
