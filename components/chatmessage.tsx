import UserAvatar from "./useravatar";
import getDateString from '@/lib/getdatestring';
import { Message } from '@/lib/types';

const ChatMessage = ({ message }: {message: Message}) => {
    return (
      <div
        className={`flex items-start rounded-lg mb-1 ${
          message.ownedByCurrentUser ? "justify-end" : "justify-start"
        }`}
      >
        {!message.ownedByCurrentUser && (
          <div className="mr-2">
            <UserAvatar user={message.user}></UserAvatar>
          </div>
        )}
  
        <div className="max-w-60">
          <div className="text-sm text-gray-400">
            {!message.ownedByCurrentUser && message.user.name + ' @ '}
            {getDateString(message.sentAt)}
          </div>
          <div className="text-md bg-blue-500 rounded-md px-2 py-1 text-white">{message.body}</div>
        </div>
      </div>
    );
};
  
export default ChatMessage;