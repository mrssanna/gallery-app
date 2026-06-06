import { useState } from "react";
import { Paper, Typography, Grid, TextField, Button } from "@mui/material";

interface UploadFormProps {
  onUpload: (file: File, title: string, author: string) => Promise<void>;
  uploading: boolean;
}

export const UploadForm = ({ onUpload, uploading }: UploadFormProps) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    await onUpload(file, title, author);

    // Очищаем форму после успешной отправки (если onUpload не выбросил ошибку)
    setTitle("");
    setAuthor("");
    setFile(null);
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }} variant="outlined">
      <Typography variant="h6" gutterBottom>
        Загрузить новую картинку
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Автор"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              id="fileInput"
              type="file"
              inputProps={{ accept: "image/*" }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFile(e.target.files?.[0] || null)
              }
              fullWidth
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={uploading || !file}
              fullWidth
              size="large"
            >
              {uploading ? "Загрузка..." : "Загрузить"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};
