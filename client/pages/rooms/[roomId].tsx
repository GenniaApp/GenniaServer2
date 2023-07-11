import { ThemeProvider } from '@mui/material/styles';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import theme from '@/components/theme';
import Navbar from '@/components/Navbar';
import GameRoom from '@/components/GameRoom';
import Footer from '@/components/Footer';
import { GameProvider, useGame, useGameDispatch } from '@/context/GameContext';

function RoomPage() {
  const { t } = useTranslation();

  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <GameProvider>
        <GameRoom />
      </GameProvider>
      <Footer />
    </ThemeProvider>
  );
}

export default RoomPage;

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
