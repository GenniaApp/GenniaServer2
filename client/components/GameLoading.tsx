import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'next-i18next';

interface GameLoadingProps {}

const GameLoading: React.FC<GameLoadingProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Box
      className='menu-container'
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant='h3'>{t('game-starting')}</Typography>
      <CircularProgress />
    </Box>
  );
};

export default GameLoading;
