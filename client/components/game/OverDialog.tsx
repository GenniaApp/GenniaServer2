import React from 'react';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Player, RoomUiStatus } from '@/lib/types';
import { useGame, useGameDispatch } from '@/context/GameContext';
import Dialog from './Dialog';

interface OverDialogProps {
  dialogContent: [Player | null, string];
  open: boolean;
  onClose: () => void;
}

export default function OverDialog(props: OverDialogProps) {
  const { myPlayerId, room } = useGame();
  const { setRoomUiStatus, setOpenOverDialog } = useGameDispatch();
  const { dialogContent, open, onClose } = props;
  const { t } = useTranslation();
  const router = useRouter();

  let title: string = '';
  let subtitle: string = '';
  let player = dialogContent[0];

  if (player) {
    if (dialogContent[1] === 'game_over') {
      title = t('game-over');
      subtitle = `${t('captured-by')}: ${player.username}`;
    }
    if (dialogContent[1] === 'game_ended') {
      title = player.id === myPlayerId ? t('you-win') : t('game-over');
      subtitle = `${t('winner')}: ${player.username}`;
    }
    if (dialogContent[1] === 'game_surrender') {
      title = t('you-surrender');
      subtitle = '';
    }
  }

  const handleExit = () => {
    router.push('/');
    setOpenOverDialog(false);
  };

  const handleBackRoom = () => {
    setRoomUiStatus(RoomUiStatus.gameSetting);
    setOpenOverDialog(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={<h1 className='OverDialog__Title'>{title}</h1>}
      subtitle={<h4 className='OverDialog__Title'>{subtitle}</h4>}
    >
      <div className='DialogButtons'>
        <Button variant='contained' onClick={handleBackRoom}>
          {t('play-again')}
        </Button>
        <Button variant='contained' onClick={handleExit} sx={{ top: 5 }}>
          {t('exit')}
        </Button>
      </div>
    </Dialog>
  );
}
