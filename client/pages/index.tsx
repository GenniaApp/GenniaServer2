import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState, useEffect, StrictMode } from 'react';
import { ThemeProvider } from '@mui/material/styles';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Login from '../components/Login';

import Lobby from '../components/Lobby';
import theme from '../components/theme';
import Head from 'next/head';

export default function Home() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handlePlayClick = (username: string) => {
    setUsername(username);
    if (typeof window !== 'undefined') {
      localStorage.setItem('username', username);
      localStorage.removeItem('playerId');
    }
  };

  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <Head>
          <title>Home | Gennia</title>
        </Head>
        <Navbar />
        {!username && (
          <Login username={username} handlePlayClick={handlePlayClick} />
        )}
        {username && <Lobby />}
        <Footer />
      </ThemeProvider>
    </StrictMode>
  );
}

export async function getStaticProps(context: any) {
  // extract the locale identifier from the URL
  const { locale } = context;

  return {
    props: {
      // pass the translation props to the page component
      ...(await serverSideTranslations(locale)),
    },
  };
}
