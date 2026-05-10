import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#c62828",
      light: "#ef5350",
      dark: "#b71c1c",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});
