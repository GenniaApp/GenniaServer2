import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import SurrenderDialog from './SurrenderDialog';
import TurnsCount from './TurnsCount';
import GameMap from './GameMap';
import LeaderBoard from './LeaderBoard';
import OverDialog from './OverDialog';
import { useGame, useGameDispatch } from '@/context/GameContext';
import { useTranslation } from 'next-i18next';

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
  const { setOpenOverDialog, setDialogContent } = useGameDispatch();
  const { t } = useTranslation();

  const handleSurrender = useCallback(() => {
    socketRef.current.emit('surrender', myPlayerId);
    setDialogContent([null, 'game_surrender']);
    setOpenOverDialog(true);
  }, []);

  return (
    <Box className='Game'>
      <TurnsCount count={turnsCount} />
      <GameMap />
      <LeaderBoard leaderBoardData={leaderBoardData} />
      <SurrenderDialog handleSurrender={handleSurrender} />
      <OverDialog
        open={openOverDialog}
        dialogContent={dialogContent}
        onClose={() => {
          setOpenOverDialog(false);
        }}
      />
    </Box>
  );
}
