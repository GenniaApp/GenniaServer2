import { ThemeProvider } from '@mui/material/styles';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import theme from '@/components/theme';
import Navbar from '@/components/Navbar';
import GameRoom from '@/components/GameRoom';
import { GameProvider } from '@/context/GameContext';

function RoomPage() {
  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <GameProvider>
        <GameRoom />
      </GameProvider>
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
