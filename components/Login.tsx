import { Avatar, Box, Typography, Button, TextField } from '@mui/material';
import Image from 'next/image';

import { useTranslation } from 'next-i18next';

import { useState } from 'react';

interface LoginProps {
  username: string;
  handlePlayClick: (username: string) => void;
}

const Login: React.FC<LoginProps> = (props) => {
  const { username, handlePlayClick } = props;
  const { t } = useTranslation();
  const [inputname, setInputName] = useState(username);

  const handleUsernameChange = (event: any) => {
    setInputName(event.target.value);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '16vh',
        }}
      >
        <Avatar
          src='/img/favicon.png'
          sx={{
            width: 150,
            height: 150,
            borderRadius: 5,
            boxShadow: 2,
            zIndex: 100,
          }}
        />
        <Box
          className='menu-container'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: '80vw', md: '40vw' },
            marginTop: '-40px !important',
            zIndex: '10 !important',
          }}
        >
          <Typography variant='h4' color='white' sx={{ padding: 4 }}>
            {t('welcome')}
          </Typography>
          <TextField
            sx={{ width: '100%' }}
            id='outlined-basic'
            placeholder={t('username-placeholder')}
            value={inputname}
            color='primary'
            focused
            variant='filled'
            hiddenLabel
            onChange={handleUsernameChange}
          />
          {/* todo 临时解决 tailwindcss 和 mui 冲突 */}
          <Button
            className='bg-[#d24396]'
            variant='contained'
            onClick={() => handlePlayClick(inputname)}
            sx={{ margin: 2, width: '100%', height: '40px', fontSize: '15px' }}
          >
            {t('play')}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Login;
