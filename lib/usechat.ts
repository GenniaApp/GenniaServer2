import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { UserData, User, Message } from './types';

import {
  USER_JOIN_CHAT_EVENT,
  USER_LEAVE_CHAT_EVENT,
  NEW_CHAT_MESSAGE_EVENT,
} from './eventconst';

export default function useChat(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<UserData>();
  const socketRef = useRef<any>();

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch('https://api.randomuser.me/');
      const result = await response.json();

      let username = localStorage.getItem('username');
      // 设置匿名 username
      if (username === undefined) {
        username = 'Anonymous';
      }

      setUser({
        // name: result.results[0].name.first,
        name: username,
        picture: result.results[0].picture.thumbnail,
      });
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/users`);
        const result = await response.json();
        setUsers(result.users);
        console.log(` /api/rooms/${roomId}/users result.users ${result.users}`);
      } catch (err) {
        console.log(` /api/rooms/${roomId}/users error ${err}`);
      }
    };

    fetchUsers();
  }, [roomId]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`/api/rooms/${roomId}/messages`);
      const result = await response.json();
      setMessages(result.messages);
    };

    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    if (!user) {
      return;
    }
    fetch('/api/socketio').finally(() => {
      socketRef.current = io({
        query: { roomId, name: user.name, picture: user.picture },
      });

      socketRef.current.on('connect', () => {
        console.log(`socket connect: ${socketRef.current.id}`);
      });

      socketRef.current.on(USER_JOIN_CHAT_EVENT, (user: User) => {
        if (user.id === socketRef.current.id) return;
        setUsers((users) => [...users, user]);
      });

      socketRef.current.on(USER_LEAVE_CHAT_EVENT, (user: User) => {
        setUsers((users) => users.filter((u) => u.id !== user.id));
      });

      socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, (message: Message) => {
        const incomingMessage = {
          ...message,
          ownedByCurrentUser: message.senderId === socketRef.current.id,
        };
        setMessages((messages) => [...messages, incomingMessage]);
      });

      return () => {
        socketRef.current.disconnect();
      };
    });
  }, [roomId, user]);

  const sendMessage = (messageBody: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
      body: messageBody,
      senderId: socketRef.current.id,
      user: user,
    });
  };

  return {
    messages,
    user,
    users,
    sendMessage,
  };
}
