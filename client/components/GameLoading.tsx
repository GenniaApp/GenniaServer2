import React from 'react';
import { Dialog, DialogTitle, CircularProgress } from '@mui/material';
import { useTranslation } from 'next-i18next';

interface GameLoadingProps {}

const GameLoading: React.FC<GameLoadingProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Dialog open>
      <DialogTitle>{t('game-loading')}</DialogTitle>
      <CircularProgress />
    </Dialog>
  );
};

export default GameLoading;
