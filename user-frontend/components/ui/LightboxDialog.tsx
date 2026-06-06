import { Dialog, Box, Button } from '@mui/material';

interface LightboxDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const LightboxDialog = ({ imageUrl, onClose }: LightboxDialogProps) => {
  return (
    <Dialog open={!!imageUrl} onClose={onClose} maxWidth="lg" fullWidth>
      <Box position="relative" bgcolor="#000" display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl || ''} alt="Full size" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
        <Button 
          onClick={onClose} 
          sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }} 
          variant="contained" 
          color="inherit"
        >
          Закрыть
        </Button>
      </Box>
    </Dialog>
  );
};
