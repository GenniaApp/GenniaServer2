import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Dialog from './Dialog';
import DialogButtons from './DialogButtons';
import Button from './Button';
import Router from 'next/router';

function OverDialog(props) {
  const { className, didWin, roomId, ...restProps } = props;

  const handleExit = () => {
    Router.push('/');
  };

  const handleBackRoom = () => {
    Router.push(`/games/${roomId}`);
  };

  const dialogTitile = didWin ? 'You won!' : 'Game Over!';

  return (
    <Dialog
      {...restProps}
      className={classNames('OverDialog', className)}
      title={<h1 className='OverDialog__Title'>{dialogTitile}</h1>}
    >
      <DialogButtons>
        <Button variant='primary' onClick={handleBackRoom}>
          Play Again
        </Button>
        <Button variant='primary' size='big' onClick={handleExit}>
          Exit
        </Button>
      </DialogButtons>
    </Dialog>
  );
}

OverDialog.propTypes = {
  className: PropTypes.string,
};

export default OverDialog;
