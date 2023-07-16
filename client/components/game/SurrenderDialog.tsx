import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useGame } from '@/context/GameContext';

export default function SurrenderDialog({
  handleSurrender,
}: {
  handleSurrender: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { openOverDialog } = useGame();
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isOpen && !openOverDialog) {
        setIsOpen(true);
      }
    },
    [isOpen, openOverDialog]
  );

  const handleCloseSurrender = useCallback(() => {
    setIsOpen(false);
    handleSurrender();
  }, [handleSurrender]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth='md'
      aria-labelledby='Surrender Dialog'
      aria-describedby='Ensure user wants to surrender'
    >
      <DialogTitle id='surrender-dialog-title'>
        {t('are-you-sure-to-surrender')}
      </DialogTitle>
      <DialogActions sx={{ width: '300px' }}>
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button onClick={handleCloseSurrender}>{t('surrender')}</Button>
      </DialogActions>
    </Dialog>
  );
}
