"use client";
import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Avatar,
  Dialog,
  CircularProgress,
} from "@mui/material";
import { translateError } from "../../utils/error-mapper";
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
} from "../../hooks/useProfile";

export default function Profile() {
  // Получаем данные через React Query
  const { data: user, isLoading, isError, error } = useProfile();

  // Получаем мутации
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [gender, setGender] = useState("");

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Заполняем форму, когда данные загрузились или обновились
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setMiddleName(user.middleName || "");
      setGender(user.gender || "");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfileMutation.mutate(
      {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        middleName: middleName || undefined,
        gender: gender || undefined,
      },
      {
        onSuccess: () => {
          setToast({
            open: true,
            message: "Профиль успешно обновлен!",
            severity: "success",
          });
        },
        onError: (err) => {
          setToast({
            open: true,
            message: `❌ ${translateError(err.message)}`,
            severity: "error",
          });
        },
      },
    );
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadAvatarMutation.mutate(file, {
      onSuccess: () => {
        setToast({
          open: true,
          message: "Аватар успешно обновлен!",
          severity: "success",
        });
      },
      onError: (err) => {
        setToast({
          open: true,
          message: `❌ ${translateError(err.message)}`,
          severity: "error",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flex={1}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <Box p={4} display="flex" justifyContent="center">
          <Alert severity="error">{translateError(error.message)}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box
        component="main"
        sx={{ flex: 1, p: 4, display: "flex", justifyContent: "center" }}
      >
        <Paper
          elevation={3}
          sx={{ p: 4, width: "100%", maxWidth: 600, height: "fit-content" }}
        >
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            mb={3}
            textAlign="center"
          >
            Настройки профиля
          </Typography>

          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Avatar
              key={user?.avatarUrl}
              src={user?.avatarUrl}
              sx={{
                width: 120,
                height: 120,
                mb: 2,
                fontSize: "3rem",
                bgcolor: "primary.main",
                cursor: user?.originalAvatarUrl ? "pointer" : "default",
                transition: "opacity 0.2s",
                "&:hover": { opacity: user?.originalAvatarUrl ? 0.8 : 1 },
              }}
              onClick={() =>
                user?.originalAvatarUrl &&
                setLightboxImage(user.originalAvatarUrl)
              }
            >
              {user?.firstName?.[0] || user?.login?.[0]?.toUpperCase()}
            </Avatar>
            <Button
              component="label"
              variant="outlined"
              size="small"
              disabled={uploadAvatarMutation.isPending}
            >
              {uploadAvatarMutation.isPending ? "Загрузка..." : "Изменить фото"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </Button>
          </Box>

          <Box mb={3} p={2} bgcolor="#f8f9fa" borderRadius={1}>
            <Typography variant="body2" color="textSecondary">
              Email (Логин)
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {user?.login}
            </Typography>
          </Box>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <TextField
              label="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Отчество"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Пол</InputLabel>
              <Select
                value={gender}
                label="Пол"
                onChange={(e) => setGender(e.target.value)}
              >
                <MenuItem value="">
                  <em>Не указан</em>
                </MenuItem>
                <MenuItem value="мужской">Мужской</MenuItem>
                <MenuItem value="женский">Женский</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              disabled={updateProfileMutation.isPending}
              size="large"
              sx={{ mt: 2 }}
            >
              {updateProfileMutation.isPending
                ? "Сохранение..."
                : "Сохранить изменения"}
            </Button>
          </form>
        </Paper>
      </Box>

      <Dialog
        open={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        maxWidth="sm"
        fullWidth
      >
        <Box
          position="relative"
          bgcolor="#000"
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage || ""}
            alt="Full size avatar"
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />
          <Button
            onClick={() => setLightboxImage(null)}
            sx={{ position: "absolute", top: 8, right: 8 }}
            variant="contained"
            color="error"
          >
            Закрыть
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
