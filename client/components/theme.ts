import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4',
    },
    secondary: {
      main: '#625B71',
    },
  },

  typography: {
    fontFamily: `"Nunito", "Noto Sans FC"`,
  },

  shape: {
    borderRadius: 24,
  },
});

theme = responsiveFontSizes(theme);

export default theme;
