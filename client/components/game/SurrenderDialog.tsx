import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
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
import { MaxTeamNum } from '@/lib/constants';

export default function SurrenderDialog({
  isOpen,
  setOpen,
  handleSurrender,
}: {
  isOpen: boolean;
  setOpen: any;
  handleSurrender: () => void;
}) {
  const { openOverDialog, isSurrendered, team, roomUiStatus } = useGame();
  const { t } = useTranslation();
  const router = useRouter();

  const handleClose = useCallback(
    (event: any, reason: string) => {
      if (reason === 'backdropClick') return;
      setOpen(false);
    },
    [setOpen]
  );

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isOpen && !openOverDialog) {
        setOpen(true);
      }
    },
    [isOpen, openOverDialog, setOpen]
  );

  const showExitTitle =
    isSurrendered ||
    team === MaxTeamNum + 1 ||
    roomUiStatus === RoomUiStatus.gameOverConfirm;

  const handleCloseSurrender = useCallback(() => {
    setOpen(false);
    handleSurrender();
  }, [handleSurrender, setOpen]);

  const handleExit = useCallback(() => {
    setOpen(false);
    router.push('/');
  }, [router, setOpen]);

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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {showExitTitle ? (
          <Button sx={{ width: '100%' }} onClick={handleExit}>
            {t('exit')}
          </Button>
        ) : (
          <>
            <Button sx={{ width: '100%' }} onClick={handleCloseSurrender}>
              {t('surrender')}
            </Button>
          </>
        )}
        <Button
          sx={{ width: '100%' }}
          onClick={() => {
            setOpen(false);
          }}
        >
          {t('cancel')}
        </Button>
      </Box>
    </Dialog>
  );
}
