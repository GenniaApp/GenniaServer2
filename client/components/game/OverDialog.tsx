import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { UserData, RoomUiStatus } from '@/lib/types';
import { useGame, useGameDispatch } from '@/context/GameContext';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Typography,
} from '@mui/material';

export default function OverDialog() {
  const { myPlayerId, room, dialogContent, openOverDialog } = useGame();
  const { setRoomUiStatus, setOpenOverDialog } = useGameDispatch();
  const [replayLink, setReplayLink] = React.useState('');
  const { t } = useTranslation();
  const router = useRouter();

  let title: string = '';
  let subtitle: string = '';
  let [userData, game_status, replay_link] = dialogContent;

  if (game_status === 'game_surrender') {
    title = t('you-surrender');
    subtitle = '';
  }
  if (userData) {
    if (game_status === 'game_over') {
      title = t('game-over');
      subtitle = `${t('captured-by')}: ${userData.username}`;
    }
    if (game_status === 'game_ended') {
      title = userData.id === myPlayerId ? t('you-win') : t('game-over');
      subtitle = `${t('winner')}: ${userData.username}!`;
    }
  }

  useEffect(() => {
    let [userData, game_status, replay_link] = dialogContent;
    if (game_status === 'game_ended' && replay_link) {
      setReplayLink(replay_link);
    }
  }, [dialogContent]);

  const handleExit = () => {
    router.push('/');
    setOpenOverDialog(false);
  };

  const handleBackRoom = () => {
    if (!room.gameStarted) setRoomUiStatus(RoomUiStatus.gameSetting);
    setOpenOverDialog(false);
  };

  const handleWatchReplay = () => {
    router.push(`/replays/${replayLink}`);
    setOpenOverDialog(false);
  };

  return (
    <Dialog
      open={openOverDialog}
      onClose={(event: any, reason) => {
        if (reason === 'backdropClick') return;
        setOpenOverDialog(false);
      }}
      sx={{
        '& .MuiDialog-paper': {
          backdropFilter: 'blur(3px)',
          backgroundColor: 'rgb(18 18 18 / 78%) !important',
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{subtitle}</DialogContent>
      <DialogActions sx={{ width: '300px' }}>
        <Button onClick={handleBackRoom}>
          {room.gameStarted ? t('spectate') : t('play-again')}
        </Button>
        {replayLink && (
          <Button onClick={handleWatchReplay}>{t('watch-replay')}</Button>
        )}
        <Button onClick={handleExit}>{t('exit')}</Button>
        <Button
          onClick={() => {
            setOpenOverDialog(false);
          }}
        >
          {t('cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
