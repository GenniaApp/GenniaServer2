import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
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

  shape: {
    borderRadius: 10
  }
});

theme = responsiveFontSizes(theme);

export default theme;
