import Head from "next/head";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import Lobby from "@/components/lobby";
import ChatBox from "@/components/chatbox";

const LandingPage: React.FC = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [username, setUsername] = useState<string | null>(null);

  const handleSubmit = () => {
    const username = usernameRef.current?.value;
    if (username) {
      Cookies.set("username", username);
      setUsername(username);
    }
  };

  useEffect(() => {
    const savedUsername = Cookies.get("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  return (
    <div className="bg-gray-900 text-white flex flex-col justify-between min-h-screen">
      <Head>
        <title>CubeBattle</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {username ? (
        <div className="flex flex-col h-screen bg-gray-900">
          <Lobby />
          <ChatBox roomid="lobby" />
        </div>
      ) : (
        <main className="flex flex-col justify-center items-center flex-1">
          <h1 className="text-6xl font-bold mb-8 text-blue-500">CubeBattle</h1>
          <form
            ref={formRef}
            className="flex flex-col items-center"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <label htmlFor="name" className="text-2xl mb-4">
              Enter your name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="px-4 py-2 rounded-lg bg-gray-800 text-white mb-4"
              required
              ref={usernameRef}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold font-lg py-3 px-5 rounded-lg"
              type="submit"
            >
              Play
            </button>
          </form>

        </main>
      )}
    </div>
  );
};

export default LandingPage;
