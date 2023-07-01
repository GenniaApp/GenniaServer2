import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useState, useEffect } from "react";

import { useRouter } from 'next/router'

import { ThemeProvider } from '@mui/material/styles';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/login';

import Lobby from './components/lobby';
import theme from './components/theme';



export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const { t } = useTranslation()

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handlePlayClick = (username) => {
    setUsername(username);
    if (typeof window !== "undefined") {
      localStorage.setItem("username", username);
    }
  };



  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      {!username && (
        <Login username={username} handlePlayClick={handlePlayClick} />
      )}
      {username && (
        <div>
          <Lobby />
          {/* <ChatBox roomid="lobby" /> */}
        </div>
      )}
      {/* <Footer /> */}
    </ThemeProvider>
  )
}

export async function getStaticProps(context) {
  // extract the locale identifier from the URL
  const { locale } = context

  return {
    props: {
      // pass the translation props to the page component
      ...(await serverSideTranslations(locale)),
    },
  }
}
