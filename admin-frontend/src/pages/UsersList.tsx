import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Avatar,
  SelectChangeEvent,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { AppTable, TableColumn } from "../components/ui/AppTable";
import { AppButton } from "../components/ui/AppButton";
import { AppLoader } from "../components/ui/AppLoader";
import { AppConfirmDialog } from "../components/ui/AppConfirmDialog";
import { translateError } from "../utils/error-mapper";
import { MOCK_USERS } from "../utils/mock-data";

const IS_STATIC = import.meta.env.VITE_IS_STATIC === "true";

interface User {
  id: string;
  login: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

interface ConfirmDialogState {
  open: boolean;
  title: string;
  content: string;
  confirmColor: "error" | "warning" | "success";
  action: () => Promise<void>;
}

interface ApiResponse {
  node?: User[];
  message?: string;
}

export const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    content: "",
    confirmColor: "error",
    action: async () => {},
  });

  const showToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  const fetchUsers = useCallback(async (): Promise<void> => {
    if (!token) return;

    setLoading(true);

    if (IS_STATIC) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers(MOCK_USERS);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/users?pageNo=1&perPage=50&sortField=${sortField}&sortOrder=${sortOrder}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.status === 401) {
        logout();
        return;
      }

      const data = (await res.json()) as ApiResponse;
      if (res.ok) {
        setUsers(data.node || []);
      } else {
        showToast(translateError(data.message || "Unknown error"), "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }, [token, sortField, sortOrder, logout]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleBlockToggle = useCallback(
    (login: string, isBlocked: boolean): void => {
      const actionName = isBlocked ? "unblock" : "block";

      setConfirmDialog({
        open: true,
        title: `${isBlocked ? "Unblock" : "Block"} User`,
        content: `Are you sure you want to ${actionName} user ${login}?`,
        confirmColor: isBlocked ? "success" : "warning",
        action: async () => {
          if (IS_STATIC) {
            setUsers((prev) =>
              prev.map((u) =>
                u.login === login ? { ...u, isBlocked: !isBlocked } : u,
              ),
            );
            showToast(`User successfully ${actionName}ed (Mock)`, "success");
            setConfirmDialog((prev) => ({ ...prev, open: false }));
            return;
          }
          try {
            const res = await fetch("/api/users/block", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ login }),
            });

            if (res.status === 401) {
              logout();
              return;
            }

            if (res.ok) {
              showToast(`User successfully ${actionName}ed`, "success");
              await fetchUsers();
            } else {
              const data = (await res.json()) as ApiResponse;
              showToast(
                translateError(data.message || "Unknown error"),
                "error",
              );
            }
          } catch {
            showToast("Network error", "error");
          } finally {
            setConfirmDialog((prev) => ({ ...prev, open: false }));
          }
        },
      });
    },
    [token, logout, fetchUsers],
  );

  const handleDelete = useCallback(
    (login: string): void => {
      setConfirmDialog({
        open: true,
        title: "Delete User",
        content: `DANGER: Are you sure you want to permanently delete user ${login}? This action cannot be undone.`,
        confirmColor: "error",
        action: async () => {
          if (IS_STATIC) {
            setUsers((prev) => prev.filter((u) => u.login !== login));
            showToast("User successfully deleted (Mock)", "success");
            setConfirmDialog((prev) => ({ ...prev, open: false }));
            return;
          }
          try {
            const res = await fetch(`/api/users/${login}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
              logout();
              return;
            }

            if (res.ok) {
              showToast("User successfully deleted", "success");
              await fetchUsers();
            } else {
              const data = (await res.json()) as ApiResponse;
              showToast(
                translateError(data.message || "Unknown error"),
                "error",
              );
            }
          } catch {
            showToast("Network error", "error");
          } finally {
            setConfirmDialog((prev) => ({ ...prev, open: false }));
          }
        },
      });
    },
    [token, logout, fetchUsers],
  );

  const handleSortFieldChange = (event: SelectChangeEvent): void => {
    setSortField(event.target.value);
  };

  const handleSortOrderChange = (event: SelectChangeEvent): void => {
    setSortOrder(event.target.value);
  };

  const handleRefresh = (): void => {
    void fetchUsers();
  };

  const columns: TableColumn<User>[] = [
    {
      id: "avatar",
      label: "Avatar",
      render: (u) => (
        <Avatar
          src={u.avatarUrl}
          sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
        >
          {u.login[0]?.toUpperCase() || "?"}
        </Avatar>
      ),
    },
    {
      id: "id",
      label: "ID",
      render: (u) => (
        <Typography
          variant="body2"
          fontFamily="monospace"
          color="textSecondary"
        >
          {u.id}
        </Typography>
      ),
    },
    { id: "login", label: "Email (Login)" },
    {
      id: "role",
      label: "Role",
      render: (u) => (
        <Chip
          label={u.role}
          color={u.role === "admin" ? "warning" : "default"}
          size="small"
        />
      ),
    },
    {
      id: "status",
      label: "Status",
      render: (u) => (
        <Chip
          label={u.isBlocked ? "Blocked" : "Active"}
          color={u.isBlocked ? "error" : "success"}
          size="small"
        />
      ),
    },
    {
      id: "createdAt",
      label: "Created At",
      render: (u) => (
        <Typography variant="body2">
          {new Date(u.createdAt).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: "updatedAt",
      label: "Last Updated",
      render: (u) => (
        <Typography variant="body2">
          {new Date(u.updatedAt).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      render: (u) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <AppButton
            size="small"
            color="info"
            onClick={() => navigate(`/users/${u.login}`)}
          >
            View
          </AppButton>
          <AppButton
            size="small"
            color={u.isBlocked ? "success" : "warning"}
            onClick={() => {
              handleBlockToggle(u.login, u.isBlocked);
            }}
            disabled={u.role === "admin"}
          >
            {u.isBlocked ? "Unblock" : "Block"}
          </AppButton>
          <AppButton
            size="small"
            color="error"
            disabled={u.role === "admin"}
            onClick={() => {
              handleDelete(u.login);
            }}
          >
            Delete
          </AppButton>
        </Box>
      ),
    },
  ];

  if (loading && users.length === 0) return <AppLoader />;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Users Management</Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortField}
              label="Sort By"
              onChange={handleSortFieldChange}
            >
              <MenuItem value="id">ID</MenuItem>
              <MenuItem value="login">Email</MenuItem>
              <MenuItem value="createdAt">Created At</MenuItem>
              <MenuItem value="updatedAt">Updated At</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              label="Order"
              onChange={handleSortOrderChange}
            >
              <MenuItem value="ASC">Ascending</MenuItem>
              <MenuItem value="DESC">Descending</MenuItem>
            </Select>
          </FormControl>

          <AppButton
            onClick={handleRefresh}
            color="secondary"
            variant="outlined"
          >
            🔄 Refresh
          </AppButton>
        </Box>
      </Box>

      <AppTable columns={columns} data={users} keyExtractor={(row) => row.id} />

      <AppConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        content={confirmDialog.content}
        confirmColor={confirmDialog.confirmColor}
        onConfirm={() => {
          void confirmDialog.action();
        }}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

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
};
