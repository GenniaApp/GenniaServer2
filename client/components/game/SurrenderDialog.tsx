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
import { RoomUiStatus } from '@/lib/types';

export default function SurrenderDialog({
  isOpen,
  setOpen,
  handleSurrender,
}: {
  isOpen: boolean;
  setOpen: any;
  handleSurrender: () => void;
}) {
  const { openOverDialog, isSurrendered, spectating, roomUiStatus } = useGame();
  const { t } = useTranslation();
  const router = useRouter();

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isOpen && !openOverDialog) {
        setOpen(true);
      }
    },
    [isOpen, openOverDialog]
  );

  const showExitTitle =
    isSurrendered ||
    spectating ||
    roomUiStatus === RoomUiStatus.gameOverConfirm;

  const handleCloseSurrender = useCallback(() => {
    setOpen(false);
    handleSurrender();
  }, [handleSurrender]);

  const handleExit = useCallback(() => {
    setOpen(false);
    router.push('/');
  }, [router]);

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
        {showExitTitle
          ? t('are-you-sure-to-exit')
          : t('are-you-sure-to-surrender')}
      </DialogTitle>
      <DialogActions sx={{ width: '300px' }}>
        {showExitTitle ? (
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
