import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import classNames from 'classnames';
import SurrenderDialog from './SurrenderDialog';
import TurnsCount from './TurnsCount';
import GameMap from './GameMap';
import Players from './Players';
import OverDialog from './OverDialog';
import { MapProp, PlayersProp } from './types-new';

interface GameProps {
  className?: string;
  turnsCount: number;
  mapData: MapProp;
  players: PlayersProp;
  roomName: string;
}

function Game(props: GameProps) {
  const { className, turnsCount, mapData, players, roomName, ...restProps } =
    props;
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
    <Box sx={{ mb: 2 }}>
      <div {...restProps} className={classNames('Game', className)}>
        <TurnsCount count={turnsCount} />
        <GameMap className='Game__Map' mapData={mapData} players={players} />
        <Players players={players} />
        <SurrenderDialog onSurrender={handleSurrender} />
        <OverDialog
          open={didOver}
          didWin={didWin}
          onClose={handleOverDialogClose}
          roomName={roomName}
        />
      </div>
    </Box>
  );
}

export default Game;
