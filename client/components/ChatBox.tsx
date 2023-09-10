import { styled } from '@mui/material/styles';
import React, { useState, useEffect, useRef } from 'react';
import { InputBase } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Socket } from 'socket.io-client';
import { Message } from '@/lib/types';
import { ColorArr } from '@/lib/constants';

import useMediaQuery from '@mui/material/useMediaQuery';

const ChatBoxContainer = styled('div')`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 300px;
  height: 40vh;
  overflow: auto;
  z-index: 1003;
  backdrop-filter: blur(3px);
  background-color: rgb(99 97 141 / 68%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  &.shrink {
    height: 11vh;
    z-index: 1001; // hide behind the game replay dock
  }
  @media (max-width: 600px) {
    width: 60%;
  }
`;

const ChatBoxMessages = styled('div')`
  flex: 1;
  overflow-y: auto;
  padding: 5px;
  color: white;
  &.shrink {
    height: 10vh;
  }
`;

const ChatBoxInput = styled('div')`
  display: flex;
  align-items: center;
`;

const ChatBoxMessage = ({ message }: { message: Message }) => {
  return (
    <div>
      <span
        style={{
          paddingLeft: 10,
          display: 'inline',
          color: ColorArr[message.player.color],
        }}
      >
        {message.player.username}
      </span>
      &nbsp;
      <p style={{ display: 'inline' }}>{message.content}</p>
      &nbsp;
      {message.target && (
        <>
          <span
            style={{
              display: 'inline',
              color: ColorArr[message.target.color],
            }}
          >
            {message.target.username}
          </span>
          <p style={{ display: 'inline' }}>.</p>
        </>
      )}
      <br />
    </div>
  );
};

interface ChatBoxProp {
  socket: Socket | null;
  messages: Message[];
}

export default React.memo(function ChatBox({ socket, messages }: ChatBoxProp) {
  const [inputValue, setInputValue] = useState('');
  const [isExpand, setIsExpand] = useState(true);
  const textFieldRef = useRef<any>(null);
  const messagesEndRef = useRef<any>(null);

  const isSmallScreen = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    messagesEndRef.current.scrollIntoView({});
  }, [messages, isExpand]);

  useEffect(() => {
    setIsExpand(!isSmallScreen);
  }, [isSmallScreen]);

  const { t } = useTranslation();

  const handleInputKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleGlobalKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && textFieldRef.current) {
      event.preventDefault();
      textFieldRef.current.focus();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      setInputValue('');
      if (socket) socket.emit('player_message', inputValue);
    }
  };

  return (
    <ChatBoxContainer className={isExpand ? '' : 'shrink'}>
      <ChatBoxMessages
        onClick={() => {
          setIsExpand((x) => !x);
        }}
      >
        {messages.map((message, index) => (
          <ChatBoxMessage key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </ChatBoxMessages>
      {socket && (
        <ChatBoxInput>
          <InputBase
            margin='none'
            sx={{
              width: '100%',
              padding: '2px 10px',
              boxShadow: '0px -1px 3px 0px rgba(0,0,0,0.35)',
            }}
            placeholder={t('type-a-message')}
            size='small'
            value={inputValue}
            onChange={handleInputChange}
            inputRef={textFieldRef}
            onKeyDown={handleInputKeyDown}
          />
        </ChatBoxInput>
      )}
    </ChatBoxContainer>
  );
});
