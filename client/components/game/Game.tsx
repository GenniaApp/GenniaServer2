import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import classNames from 'classnames';
import SurrenderDialog from './SurrenderDialog';
import TurnsCount from './TurnsCount';
import GameMap from './GameMap';
import LeaderBoard from './LeaderBoard';
import OverDialog from './OverDialog';
import { LeaderBoardData, MapDataProp, Player } from '@/lib/types';

interface GameProps {
  turnsCount: number;
  mapData: MapDataProp;
  players: Player[];
  roomName: string;
  leaderBoardData: LeaderBoardData;
}

function Game(props: GameProps) {
  const { turnsCount, mapData, players, roomName, leaderBoardData } = props;
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
    <Box className='Game'>
      <TurnsCount count={turnsCount} />
      <GameMap mapData={mapData} players={players} />
      <LeaderBoard leaderBoardData={leaderBoardData} />
      <SurrenderDialog onSurrender={handleSurrender} />
      <OverDialog
        open={didOver}
        didWin={didWin}
        onClose={handleOverDialogClose}
        roomName={roomName}
      />
    </Box>
  );
}

export default Game;
