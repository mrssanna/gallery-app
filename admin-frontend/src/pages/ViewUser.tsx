import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  Button,
  Avatar,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { AppButton } from "../components/ui/AppButton";
import { AppLoader } from "../components/ui/AppLoader";
import { AppTable, TableColumn } from "../components/ui/AppTable";
import { translateError } from "../utils/error-mapper";
import { formatBytes } from "../utils/formatters";
import { MOCK_USERS, MOCK_USER_IMAGES } from "../utils/mock-data";

const IS_STATIC = import.meta.env.VITE_IS_STATIC === "true";

interface User {
  id: string | number;
  login: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: string;
  role: "admin" | "user";
  isBlocked: boolean;
  avatarUrl?: string;
  originalAvatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Image {
  id: string | number;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  author?: string;
  format: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

interface ApiResponse<T> {
  node?: T[];
  message?: string;
}

interface UserApiResponse {
  message?: string;
}

export const ViewUser = () => {
  const { login } = useParams<{ login: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [error, setError] = useState("");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndImages = async () => {
      if (!token || !login) {
        setLoading(false);
        return;
      }

      setLoading(true);

      if (IS_STATIC) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const foundUser = MOCK_USERS.find((u) => u.login === login);
        if (foundUser) {
          setUser(foundUser as any);
          setImages(MOCK_USER_IMAGES as any);
        } else {
          setError("User not found (Mock)");
        }
        setLoading(false);
        return;
      }

      try {
        const userRes = await fetch(`/api/users/${login}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userRes.status === 401) {
          logout();
          return;
        }

        const userData = (await userRes.json()) as User | UserApiResponse;

        if (userRes.ok) {
          const userDataTyped = userData as User;
          setUser(userDataTyped);

          setImagesLoading(true);
          const imagesRes = await fetch(
            `/api/store/admin/image/${userDataTyped.id}?pageNo=1&perPage=50`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (imagesRes.status === 401) {
            logout();
            setImagesLoading(false);
            return;
          }

          const imagesData = (await imagesRes.json()) as ApiResponse<Image>;

          if (imagesRes.ok) {
            setImages(imagesData.node || []);
          } else {
            setToast({
              open: true,
              message: translateError(imagesData.message),
              severity: "error",
            });
          }
        } else {
          const errorData = userData as UserApiResponse;
          setError(translateError(errorData.message) || "User not found");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
        setImagesLoading(false);
      }
    };

    void fetchUserAndImages();
  }, [login, token, logout]);

  const imageColumns: TableColumn<Image>[] = [
    {
      id: "preview",
      label: "Preview",
      render: (img: Image) => (
        <img
          src={img.thumbnailUrl || img.url}
          alt="preview"
          style={{
            width: 50,
            height: 50,
            objectFit: "cover",
            borderRadius: 4,
            cursor: "pointer",
          }}
          onClick={() => setLightboxImage(img.url)}
        />
      ),
    },
    {
      id: "id",
      label: "Image ID",
      render: (img: Image) => (
        <Typography
          variant="body2"
          fontFamily="monospace"
          color="textSecondary"
        >
          {String(img.id)}
        </Typography>
      ),
    },
    {
      id: "title",
      label: "Title",
      render: (img: Image) => (
        <Typography fontWeight="bold">{img.title || "-"}</Typography>
      ),
    },
    {
      id: "author",
      label: "Author",
      render: (img: Image) => <Typography>{img.author || "-"}</Typography>,
    },
    {
      id: "format",
      label: "Format",
      render: (img: Image) => (
        <Chip label={img.format} size="small" variant="outlined" />
      ),
    },
    {
      id: "size",
      label: "Size",
      render: (img: Image) => (
        <Typography variant="body2">{formatBytes(img.size)}</Typography>
      ),
    },
    {
      id: "createdAt",
      label: "Created At",
      render: (img: Image) => (
        <Typography variant="body2">
          {new Date(img.createdAt).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: "updatedAt",
      label: "Updated At",
      render: (img: Image) => (
        <Typography variant="body2">
          {new Date(img.updatedAt).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: "publishedAt",
      label: "Published At",
      render: (img: Image) => (
        <Typography variant="body2">
          {img.publishedAt ? new Date(img.publishedAt).toLocaleString() : "-"}
        </Typography>
      ),
    },
  ];

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handleCloseLightbox = () => {
    setLightboxImage(null);
  };

  if (loading) return <AppLoader />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user) return <Alert severity="warning">User not found</Alert>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <AppButton variant="outlined" onClick={() => navigate("/")}>
          ← Back
        </AppButton>
        <Typography variant="h4" m={0}>
          User Profile
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={3} mb={4}>
          <Avatar
            src={user.avatarUrl}
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.main",
              fontSize: "2rem",
              cursor: user.originalAvatarUrl ? "pointer" : "default",
              transition: "opacity 0.2s",
              "&:hover": { opacity: user.originalAvatarUrl ? 0.8 : 1 },
            }}
            onClick={() =>
              user.originalAvatarUrl && setLightboxImage(user.originalAvatarUrl)
            }
          >
            {user.login[0]?.toUpperCase() || "U"}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {user.firstName
                ? `${user.firstName} ${user.lastName || ""}`
                : user.login}
            </Typography>
            <Typography color="textSecondary">
              {user.role === "admin" ? "Administrator" : "User"}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography color="textSecondary" fontWeight="bold">
              ID:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography fontFamily="monospace">{String(user.id)}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography color="textSecondary" fontWeight="bold">
              Login (Email):
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography>{user.login}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography color="textSecondary" fontWeight="bold">
              Role:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Chip
              label={user.role}
              color={user.role === "admin" ? "warning" : "default"}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography color="textSecondary" fontWeight="bold">
              Status:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Chip
              label={user.isBlocked ? "Blocked" : "Active"}
              color={user.isBlocked ? "error" : "success"}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography color="textSecondary" fontWeight="bold">
              First Name:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography>{user.firstName || "-"}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography color="textSecondary" fontWeight="bold">
              Middle Name:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography>{user.middleName || "-"}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography color="textSecondary" fontWeight="bold">
              Last Name:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography>{user.lastName || "-"}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography color="textSecondary" fontWeight="bold">
              Gender:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography>{user.gender || "-"}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography color="textSecondary" fontWeight="bold">
              Created At:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography>{new Date(user.createdAt).toLocaleString()}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography color="textSecondary" fontWeight="bold">
              Updated At:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography>{new Date(user.updatedAt).toLocaleString()}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" mb={2}>
        User&apos;s Images ({images.length})
      </Typography>

      {imagesLoading ? (
        <AppLoader />
      ) : images.length === 0 ? (
        <Alert severity="info">
          This user has not uploaded any images yet.
        </Alert>
      ) : (
        <AppTable
          columns={imageColumns}
          data={images}
          keyExtractor={(row) => String(row.id)}
        />
      )}

      <Dialog
        open={!!lightboxImage}
        onClose={handleCloseLightbox}
        maxWidth="md"
        fullWidth
      >
        <Box
          sx={{
            position: "relative",
            bgcolor: "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          <img
            src={lightboxImage || ""}
            alt="Full size"
            style={{
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
          />
          <Button
            onClick={handleCloseLightbox}
            sx={{ position: "absolute", top: 8, right: 8 }}
            variant="contained"
            color="error"
          >
            Close
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
