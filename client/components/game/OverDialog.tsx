import React from 'react';
import classNames from 'classnames';
import Dialog from './Dialog';
import Button from './Button';
import Router from 'next/router';

interface OverDialogProps {
  className?: string;
  didWin: boolean;
  roomName: string;
  open: boolean;
  onClose: () => void;
}

function OverDialog(props: OverDialogProps) {
  const { className, didWin, roomName, open, onClose } = props;

  const handleExit = () => {
    Router.push('/');
  };

  const handleBackRoom = () => {
    Router.push(`/rooms/${roomName}`);
  };

  const dialogTitile = didWin ? 'You won!' : 'Game Over!';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classNames('OverDialog', className)}
      title={<h1 className='OverDialog__Title'>{dialogTitile}</h1>}
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
