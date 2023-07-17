import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Player, RoomUiStatus } from '@/lib/types';
import { useGame, useGameDispatch } from '@/context/GameContext';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from '@mui/material';

interface OverDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function OverDialog(props: OverDialogProps) {
  const { myPlayerId, room, dialogContent } = useGame();
  const { setRoomUiStatus, setOpenOverDialog } = useGameDispatch();
  const { open, onClose } = props;
  const { t } = useTranslation();
  const router = useRouter();

  let title: string = '';
  let subtitle: string = '';
  let player = dialogContent[0];

  if (dialogContent[1] === 'game_surrender') {
    title = t('you-surrender');
    subtitle = '';
  }
  if (player) {
    if (dialogContent[1] === 'game_over') {
      title = t('game-over');
      subtitle = `${t('captured-by')}: ${player.username}`;
    }
    if (dialogContent[1] === 'game_ended') {
      title = player.id === myPlayerId ? t('you-win') : t('game-over');
      subtitle = `${t('winner')}: ${player.username}`;
    }
  }

  const handleExit = () => {
    router.push('/');
    setOpenOverDialog(false);
  };

  const handleBackRoom = () => {
    if (!room.gameStarted) setRoomUiStatus(RoomUiStatus.gameSetting);
    setOpenOverDialog(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{subtitle}</DialogContent>
      <DialogActions sx={{ width: '300px' }}>
        <Button onClick={handleBackRoom}>
          {room.gameStarted ? t('spectate') : t('play-again')}
        </Button>
        <Button onClick={handleExit}>{t('exit')}</Button>
      </DialogActions>
    </Dialog>
  );
}
