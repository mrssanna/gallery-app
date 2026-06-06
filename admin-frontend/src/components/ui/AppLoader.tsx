import { CircularProgress, Box } from "@mui/material";

// Универсальный лоадер по центру экрана/контейнера
export const AppLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" p={4}>
    <CircularProgress />
  </Box>
);
