import React, { useCallback, useEffect, useState } from 'react';
import SurrenderDialog from './SurrenderDialog';
import GameMap from './GameMap';
import LeaderBoard from './LeaderBoard';
import TurnsCount from './TurnsCount';
import OverDialog from './OverDialog';
import { Box } from '@mui/material';
import { useGame, useGameDispatch } from '@/context/GameContext';

export default function Game() {
  const { room, socketRef, myPlayerId, turnsCount, leaderBoardData } =
    useGame();
  const { setOpenOverDialog, setDialogContent, setIsSurrendered } =
    useGameDispatch();

  const [isSurrenderDialogOpen, setSurrenderDialogOpen] = useState(false);

  const handleReturnClick = () => {
    setSurrenderDialogOpen(true);
  };

  const handleSurrender = () => {
    socketRef.current.emit('surrender', myPlayerId);
    setIsSurrendered(true);
    setDialogContent([null, 'game_surrender', null]);
    setOpenOverDialog(true);
  };

  return (
    <Box className='Game'>
      <TurnsCount count={turnsCount} handleReturnClick={handleReturnClick} />
      <LeaderBoard leaderBoardTable={leaderBoardData} players={room.players} />
      <GameMap />
      <SurrenderDialog
        isOpen={isSurrenderDialogOpen}
        setOpen={setSurrenderDialogOpen}
        handleSurrender={handleSurrender}
      />
      <OverDialog />
    </Box>
  );
}
