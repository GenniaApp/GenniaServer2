import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { UserData, RoomUiStatus } from '@/lib/types';
import { useGame, useGameDispatch } from '@/context/GameContext';
import {
  Box,
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
      subtitle = `${t('captured-by')}: ${userData[0]?.username}`;
    }
    if (game_status === 'game_ended') {
      title =
        userData.filter((x) => x?.id === myPlayerId).length > 0
          ? t('you-win')
          : t('game-over');
      subtitle = `${t('winner')}: ${userData
        .map((x) => x?.username)
        .join(', ')}!`;
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
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{subtitle}</DialogContent>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Button sx={{ width: '100%' }} onClick={handleBackRoom}>
          {room.gameStarted ? t('spectate') : t('play-again')}
        </Button>
        {replayLink && (
          <Button sx={{ width: '100%' }} onClick={handleWatchReplay}>
            {t('watch-replay')}
          </Button>
        )}
        <Button sx={{ width: '100%' }} onClick={handleExit}>
          {t('exit')}
        </Button>
        <Button
          sx={{ width: '100%' }}
          onClick={() => {
            setOpenOverDialog(false);
          }}
        >
          {t('cancel')}
        </Button>
      </Box>
    </Dialog>
  );
}
