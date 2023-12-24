import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { GoogleAnalytics } from 'nextjs-google-analytics';
import Head from 'next/head';
import Snowflakes from 'magic-snowflakes';
import { useEffect } from 'react';

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const snowflakes = new Snowflakes();
    snowflakes.start();
  }, []);
  return (
    <>
      <Head>
        <title>Gennia</title>
      </Head>
      <Component {...pageProps} />
      <GoogleAnalytics trackPageViews />
    </>
  );
}

export default appWithTranslation(App);
