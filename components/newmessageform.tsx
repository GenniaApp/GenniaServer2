import { FormEvent} from "react";

interface PropsType {
  newMessage: string;
  handleNewMessageChange: (event: FormEvent<HTMLInputElement>) => void;
  handleSendMessage: (event: any) => void;
}

const NewMessageForm = ({
  newMessage,
  handleNewMessageChange,
  handleSendMessage,
}: PropsType) => {

  return (
    <form className="flex items-center">
      <input
        type="text"
        value={newMessage}
        onChange={handleNewMessageChange}
        placeholder="Aa"
        className="flex-1 bg-gray-200 rounded-full py-2 px-4 mr-4 focus:outline-none focus:shadow-outline text-black"
      />
      <button
        type="submit"
        onClick={handleSendMessage}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Send
      </button>
    </form>
  );
};

  
export default NewMessageForm;
  