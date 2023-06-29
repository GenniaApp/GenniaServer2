import { FiUsers, FiMessageSquare } from "react-icons/fi";

interface MessageCenterProps {
  messages: string[];
  message: string;
  handleMessageChange: (event: any) => void;
  handleSendMessage: (event: any) => void;
}

const MessageCenter = ({
  messages,
  message,
  handleMessageChange,
  handleSendMessage,
}: MessageCenterProps) => {
  return (
    <>
      <div className="bg-gray-100 py-4">
        <div className="flex justify-center items-center h-full">
          <div className="w-full max-w-3xl">
            <div className="bg-white shadow-lg rounded-lg px-4 py-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-bold text-gray-700">
                  <FiMessageSquare className="inline-block mr-2" />
                  Message Center
                </div>
              </div>
              <div className="mb-4">
                <div className="flex flex-col">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 rounded-lg px-4 py-2 mb-2"
                    >
                      {message}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg py-2 px-4 mr-2"
                  placeholder="Click to chat (Enter to send)"
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSendMessage(event);
                    }
                  }}
                />
                <button
                  className="bg-black text-white py-2 px-4 rounded-lg"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageCenter;
