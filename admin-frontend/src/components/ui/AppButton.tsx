import { Button, ButtonProps } from "@mui/material";

// Обертка над кнопкой MUI. Позволяет задать дефолтные стили для всего проекта.
export const AppButton = (props: ButtonProps) => {
  return <Button variant="contained" disableElevation {...props} />;
};
