import { styled } from '@mui/material/styles';
import React, { useState, useEffect, useRef } from 'react';
import { InputBase, Divider } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Socket } from 'socket.io-client';
import { Message } from '@/lib/types';
import { ColorArr } from '@/lib/constants';

import useMediaQuery from '@mui/material/useMediaQuery';

const ChatBoxContainer = styled('div')`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 350px;
  height: 40vh;
  overflow: auto;
  z-index: 1003;
  backdrop-filter: blur(3px);
  background-color: #d0bcff !important;
  border-radius: 24px 0 0 0;
  box-shadow:
    0px 2px 4px -1px rgba(0, 0, 0, 0.2),
    0px 4px 5px 0px rgba(0, 0, 0, 0.14),
    0px 1px 10px 0px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  transition: all .2s ease-in-out;
  &.shrink {
    opacity: 0.5;
    width: 300px;
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
  padding: 10px;
  line-height: 1.5em;
  &.shrink {
    height: 10vh;
  }
  &:hover {
    cursor: pointer;
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
  const [isExpand, setIsExpand] = useState(false);
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
    <ChatBoxContainer
      className={isExpand ? '' : 'shrink'}
      onClick={() => {
        if (!isExpand) setIsExpand(true);
      }}
    >
      <ChatBoxMessages
        onClick={() => {
          if (isExpand) setIsExpand(false);
        }}
      >
        {messages.map((message, index) => (
          <ChatBoxMessage key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </ChatBoxMessages>
      {socket && (
        <>
          <Divider />
          <ChatBoxInput>
            <InputBase
              margin='none'
              sx={{
                width: '100%',
                padding: '5px 10px',
              }}
              placeholder={t('type-a-message')}
              size='medium'
              value={inputValue}
              onChange={handleInputChange}
              inputRef={textFieldRef}
              onKeyDown={handleInputKeyDown}
            />
          </ChatBoxInput>
        </>
      )}
    </ChatBoxContainer>
  );
});
