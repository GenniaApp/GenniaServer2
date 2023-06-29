import Head from 'next/head';

export default function Layout({ children}: {children: JSX.Element}) {
    return (
        <>
           <Head>
             <title>CubeBattle</title>
             <link rel="icon" href="/favicon.ico" />
             <meta
              name="description"
              content="A real-time multiplayer game with Nextjs Socket.IO"
              />
             <meta name="og:title" content="A real-time multiplayer game with Nextjs Socket.IO" />
           </Head>
           <main>
              {children}
           </main>   
        </>
    );
}


