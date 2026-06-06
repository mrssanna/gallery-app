import { TextField, TextFieldProps } from "@mui/material";

// Обертка над полем ввода MUI.
export const AppTextField = (props: TextFieldProps) => {
  return <TextField variant="outlined" fullWidth margin="normal" {...props} />;
};
