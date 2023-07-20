import React from 'react';
import { Box, Backdrop, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';

interface GameLoadingProps {}

const GameLoading: React.FC<GameLoadingProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open
    >
      <Box
        sx={{
          width: '200px',
          height: '100px',
          display: 'flex',
          background: 'transparent',
          alignItems: 'center!important',
          justifyContent: 'center!important',
        }}
      >
        <CircularProgress size={30} />
        <Typography variant='body1' sx={{ marginX: 1 }}>
          {t('game-loading')}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default GameLoading;
