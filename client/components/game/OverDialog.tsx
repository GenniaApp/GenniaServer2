import React from 'react';
import classNames from 'classnames';
import Dialog from './Dialog';
import Button from './Button';
import Router from 'next/router';
import { useTranslation } from 'next-i18next';
import { Player } from '@/lib/types';

interface OverDialogProps {
  className?: string;
  myPlayerId: string;
  dialogContent: [Player | null, string];
  roomId: string;
  open: boolean;
  onClose: () => void;
}

function OverDialog(props: OverDialogProps) {
  const { className, myPlayerId, dialogContent, roomId, open, onClose } = props;
  const { t } = useTranslation();

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
  }

  const handleExit = () => {
    Router.push('/');
  };

  const handleBackRoom = () => {
    Router.push(`/rooms/${roomId}`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classNames('OverDialog', className)}
      title={<h1 className='OverDialog__Title'>{title}</h1>}
      subtitle={<h6 className='OverDialog__Title'>{subtitle}</h6>}
    >
      <div className='DialogButtons'>
        <Button variant='primary' onClick={handleBackRoom}>
          Play Again
        </Button>
        <Button variant='primary' size='big' onClick={handleExit}>
          Exit
        </Button>
      </div>
    </Dialog>
  );
}

export default OverDialog;
