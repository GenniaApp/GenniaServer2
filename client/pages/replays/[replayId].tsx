import { ThemeProvider } from '@mui/material/styles';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import theme from '@/components/theme';
import GameReplay from '@/components/game/GameReplay';
import Head from 'next/head';

function ReplayPage() {
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Replay | Gennia</title>
      </Head>
      <GameReplay />
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
