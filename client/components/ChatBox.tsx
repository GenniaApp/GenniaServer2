import { styled } from '@mui/material/styles';
import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, IconButton, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useTranslation } from 'next-i18next';
import { Socket } from 'socket.io-client';
import { Message } from '@/lib/types';
import { ColorArr } from '@/lib/constants';

import useMediaQuery from '@mui/material/useMediaQuery';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessRoundedIcon from '@mui/icons-material/UnfoldLessRounded';

const ChatBoxContainer = styled('div')`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 300px;
  height: 500px;
  overflow: auto;
  z-index: 1001;
  backdrop-filter: blur(3px);
  background-color: rgb(99 97 141 / 68%);
  /* border: 1px solid black; */
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  &.hidden {
    height: min-content;
  }
  @media (max-width: 900px) {
    width: 100%;
    height: 200px;
  }
`;

const ChatBoxHeader = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  padding: 10px;
  font-size: 20px;
  font-weight: bold;
`;

const ChatBoxMessages = styled('div')`
  flex: 1;
  overflow-y: auto;
  padding: 5px;
  color: white;
  &.hidden {
    display: none;
  }
`;

const ChatBoxInput = styled('div')`
  display: flex;
  align-items: center;
  padding: 10px;
  &.hidden {
    display: none;
  }
`;

const ChatBoxTextField = styled(TextField)`
  flex: 1;
`;

const ChatBoxButton = styled(Button)`
  margin-left: 10px;
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
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <ChatBoxContainer className={isExpand ? '' : 'hidden'}>
      <ChatBoxHeader>
        <ChatIcon color='primary' />
        <Typography>{t('message-center')}</Typography>
        <IconButton onClick={() => setIsExpand(!isExpand)}>
          {isExpand ? <UnfoldLessRoundedIcon /> : <UnfoldMoreRoundedIcon />}
        </IconButton>
      </ChatBoxHeader>
      <ChatBoxMessages className={isExpand ? '' : 'hidden'}>
        {messages.map((message, index) => (
          <ChatBoxMessage key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </ChatBoxMessages>
      {socket && (
        <ChatBoxInput className={isExpand ? '' : 'hidden'}>
          <ChatBoxTextField
            hiddenLabel
            label={t('type-a-message')}
            variant='outlined'
            size='small'
            value={inputValue}
            onChange={handleInputChange}
            inputRef={textFieldRef}
            onKeyDown={handleInputKeyDown}
          />
          {/* <ChatBoxButton variant='contained' onClick={handleSendMessage}>
          {t('send')}
        </ChatBoxButton> */}
        </ChatBoxInput>
      )}
    </ChatBoxContainer>
  );
});
