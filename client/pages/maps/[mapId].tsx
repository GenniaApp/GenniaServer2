import { ThemeProvider } from '@mui/material/styles';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import theme from '@/components/theme';
import Navbar from '@/components/Navbar';
import MapEditor from '@/components/game/MapEditor';

function ReplayPage() {
  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <MapEditor editMode={false} />
    </ThemeProvider>
  );
}

export default ReplayPage;

export async function getServerSideProps(context: any) {
  // extract the locale identifier from the URL
  const { locale } = context;

  return {
    props: {
      // pass the translation props to the page component
      ...(await serverSideTranslations(locale)),
    },
  };
}
