import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d24396',
    },
    secondary: {
      main: '#757575',
    },
  },

  typography: {
    fontFamily: `"Nunito", "Noto Sans FC"`,
  },
});

export default theme;
