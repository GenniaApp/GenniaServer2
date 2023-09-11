import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { GoogleAnalytics } from 'nextjs-google-analytics';

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <GoogleAnalytics trackPageViews />
    </>
  );
}

export default appWithTranslation(App);
