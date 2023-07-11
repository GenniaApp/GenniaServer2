import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import SurrenderDialog from './SurrenderDialog';
import TurnsCount from './TurnsCount';
import GameMap from './GameMap';
import LeaderBoard from './LeaderBoard';
import OverDialog from './OverDialog';
import { useGame, useGameDispatch } from '@/context/GameContext';

export default function Game() {
  const {
    room,
    socketRef,
    myPlayerId,
    turnsCount,
    leaderBoardData,
    dialogContent,
    openOverDialog,
  } = useGame();
  const { setOpenOverDialog } = useGameDispatch();

  const handleSurrender = () => {
    socketRef.current.emit('surrender', myPlayerId);
  };

  const handleDialogSurrender = useCallback(() => {
    handleSurrender();
    setOpenOverDialog(true);
  }, []);

  return (
    <Box className='Game'>
      <TurnsCount count={turnsCount} />
      <GameMap />
      <LeaderBoard leaderBoardData={leaderBoardData} />
      <SurrenderDialog onSurrender={handleDialogSurrender} />
      <OverDialog
        myPlayerId={myPlayerId}
        open={openOverDialog}
        dialogContent={dialogContent}
        onClose={() => {
          setOpenOverDialog(false);
        }}
        roomId={room.id}
      />
    </Box>
  );
}
