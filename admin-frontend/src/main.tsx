import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App.tsx";

// Определяем базовый путь для роутинга
// На GitHub Pages это /gallery-app/admin, локально — /
const basename =
  import.meta.env.VITE_IS_GITHUB_PAGES === "true" ? "/gallery-app/admin" : "/";

// Создаем кастомную тему для админки
const theme = createTheme({
  palette: {
    primary: { main: "#007bff" },
    secondary: { main: "#6c757d" },
    background: { default: "#f4f6f8" },
  },
  typography: {
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Сбрасывает дефолтные стили браузера */}
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
