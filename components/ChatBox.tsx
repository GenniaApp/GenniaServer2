import React from 'react';
import { styled } from '@mui/material/styles';
import { useState, useEffect, useRef } from 'react';
import { TextField, Button, IconButton, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useTranslation } from 'next-i18next';
import { text } from 'node:stream/consumers';

import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessRoundedIcon from '@mui/icons-material/UnfoldLessRounded';

const ChatBoxContainer = styled('div')`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 300px;
  height: 500px;
  overflow: auto;
  background-color: rgb(89, 105, 117, 70%) !important;
  /* border: 1px solid black; */
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  &.hidden {
    height: min-content;
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
  padding: 10px;
  color: white;
  &.hidden {
    display: none;
  }
`;

const ChatBoxInput = styled('div')`
  display: flex;
  align-items: center;
  background-color: black;
  padding: 10px;
`;

const ChatBoxTextField = styled(TextField)`
  flex: 1;
`;

const ChatBoxButton = styled(Button)`
  margin-left: 10px;
`;

const ChatBox = () => {
  const [messages, setMessages] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isExpand, setIsExpand] = React.useState(true);
  const textFieldRef = React.useRef(null);

  const { t } = useTranslation();

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleGlobalKeyDown = (event) => {
    //   Enter to focus
    if (event.keyCode === 13 && textFieldRef.current) {
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

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      setMessages([...messages, inputValue]);
      setInputValue('');
    }
  };

  return (
    <ChatBoxContainer className={isExpand ? '' : 'hidden'}>
      <ChatBoxHeader>
        <ChatIcon color='primary' />
        <Typography>
          {t('message-center')}
        </Typography>
        <IconButton onClick={() => setIsExpand(!isExpand)}>
          {isExpand ? <UnfoldLessRoundedIcon /> : <UnfoldMoreRoundedIcon />}
        </IconButton>
      </ChatBoxHeader>
      <ChatBoxMessages className={isExpand ? '' : 'hidden'}>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </ChatBoxMessages>
      <ChatBoxInput>
        <ChatBoxTextField
          autoFocus
          hiddenLabel
          placeholder='Type a message, Enter to send'
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
    </ChatBoxContainer>
  );
};

export default ChatBox;
