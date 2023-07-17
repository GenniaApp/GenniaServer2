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
import { useRouter } from 'next/router';

export default function SurrenderDialog({
  handleSurrender,
}: {
  handleSurrender: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { openOverDialog, isSurrendered } = useGame();
  const { t } = useTranslation();
  const router = useRouter();

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

  const handleExit = useCallback(() => {
    setIsOpen(false);
    router.push('/');
  }, []);

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
      <DialogTitle>
        {isSurrendered
          ? t('are-you-sure-to-exit')
          : t('are-you-sure-to-surrender')}
      </DialogTitle>
      <DialogActions sx={{ width: '300px' }}>
        {isSurrendered ? (
          <Button onClick={handleExit}>{t('exit')}</Button>
        ) : (
          <>
            <Button onClick={handleClose}>{t('cancel')}</Button>
            <Button onClick={handleCloseSurrender}>{t('surrender')}</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
