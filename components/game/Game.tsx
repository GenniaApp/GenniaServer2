import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material'
import classNames from 'classnames';
import SurrenderDialog from './SurrenderDialog';
import TurnsCount from './TurnsCount';
import Map from './Map';
import Players from './Players';
import OverDialog from './OverDialog';
import { MapProp, PlayersProp } from './types-new';

interface GameProps {
  className?: string;
  turnsCount: number;
  map: MapProp;
  players: PlayersProp;
  roomId: string;
}

function Game(props: GameProps) {
  const { className, turnsCount, map, players, roomId, ...restProps } = props;
  const [didOver, setDidOver] = useState(false);
  const [didWin, setDidWin] = useState(false);
  const handleOverDialogClose = useCallback(() => {
    // TODO
    setDidOver(false);
  }, []);

  const handleSurrender = useCallback(() => {
    // TODO emit surrender event
    setDidWin(false);
    setDidOver(true);
  }, []);

  return (
    <Box className='menu-container' sx={{ mb: 2 }}>
      <div {...restProps} className={classNames('Game', className)}>
        <TurnsCount className='Game__TurnsCount' count={turnsCount} />
        <Map className='Game__Map' map={map} players={players} />
        <Players className='Game__Players' players={players} />
        <SurrenderDialog onSurrender={handleSurrender} />
        <OverDialog
          open={didOver}
          didWin={didWin}
          onClose={handleOverDialogClose}
          roomId={roomId}
        />
      </div>
    </Box>
  );
}

export default Game;
