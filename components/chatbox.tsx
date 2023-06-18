import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/router";
import useChat from "@/lib/usechat";
import ChatMessage from "@/components/chatmessage";
import NewMessageForm from "@/components/newmessageform";
import Users from "@/components/users";
import UserAvatar from "@/components/useravatar";

const ChatBox = ({ roomid }: { roomid: string }) => {
  const router = useRouter();
  const { messages, user, users, sendMessage } = useChat(roomid as string);
  const [newMessage, setNewMessage] = useState("");
  const [timeDiff, setTimeDiff] = useState(0);
  const [isChatBoxVisible, setIsChatBoxVisible] = useState(true); // Add state for chatbox visibility
  const scrollTarget = useRef(null);

  useEffect(() => {
    fetch("/api/currenttime")
      .then((response) => response.json())
      .then((data) => {
        setTimeDiff(Date.now() - data.current);
      })
      .catch((error) => {
        // Handle error
      });
  }, []);

  const handleNewMessageChange = (event: FormEvent<HTMLInputElement>) => {
    setNewMessage(event.currentTarget.value.replace(/<\/?[^>]*>/g, ""));
  };

  const handleSendMessage = (event: FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (newMessage.length != 0) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  useEffect(() => {
    if (scrollTarget.current) {
      (scrollTarget.current as any).scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const toggleChatBoxVisibility = () => {
    setIsChatBoxVisible(!isChatBoxVisible);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg fixed bottom-0 right-0 mb-8 mr-8">
      <button
        onClick={toggleChatBoxVisibility}
        className="bg-gray-700 hover:bg-gray-500 text-white font-bold p-2 rounded-md"
      >
        {isChatBoxVisible ? "Hide Chat" : "Show Chat"}
      </button>
      {isChatBoxVisible && ( // Render chatbox only if it's visible
        <div className="bg-gray-800 rounded-lg p-4">
          <Users users={users}></Users>
          <ol className="flex-1 flex flex-col max-h-96 max-w-md overflow-y-auto">
            {messages.map((message, i) => {
              message.sentAt += timeDiff;
              return (
                <li key={i}>
                  <ChatMessage message={message}></ChatMessage>
                </li>
              );
            })}
            <div ref={scrollTarget}></div>
          </ol>
          <div className="mt-4">
            <NewMessageForm
              newMessage={newMessage}
              handleNewMessageChange={handleNewMessageChange}
              handleSendMessage={handleSendMessage}
            ></NewMessageForm>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
