import { Html, Head, Main, NextScript } from 'next/document';
import { Router } from 'next/router';
import { useEffect, useState } from 'react';

export default function Document() {
  useEffect(() => {
    Router.events.on('routeChangeComplete', (url) => {
      try {
        // @ts-ignore
        window._hmt.push(['_trackPageview', url]);
      } catch (e) {}
    });
  }, []);
  const getAnalyticsTag = () => {
    return {
      __html: `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?94feacca3c0d1e2d9158a7bfcfacfa5a";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();`,
    };
  };
  return (
    <Html lang='en'>
      <Head>
        <script dangerouslySetInnerHTML={getAnalyticsTag()} />
      </Head>

      <link rel='shortcut icon' href='/img/favicon.png' />

      <meta
        name='description'
        content='A real-time multiplayer game built with Nextjs Socket.IO'
      />
      <meta name='keywords' content='Gennia, multiplayer-game'></meta>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
