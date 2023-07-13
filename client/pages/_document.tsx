import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
      <Head />
      <title>Gennia</title>
      <link rel='shortcut icon' href='/img/favicon.png' />
      <link
        href='https://fonts.googleapis.com/css2?family=Nunito&display=optional'
        rel='stylesheet'
      />

      <meta
        name='description'
        content='A real-time multiplayer game with Nextjs Socket.IO'
      />
      <meta name='keywords' content='Gennia, multiplayer-game'></meta>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
