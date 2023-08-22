import React, { useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import SurrenderDialog from './SurrenderDialog';
import GameMap from './GameMap';
import LeaderBoard from './LeaderBoard';
import TurnsCount from './TurnsCount';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import OverDialog from './OverDialog';
import { useGame, useGameDispatch } from '@/context/GameContext';
import { IconButton } from '@mui/material';

export default function Game() {
  const { room, socketRef, myPlayerId, turnsCount, leaderBoardData } =
    useGame();
  const { setOpenOverDialog, setDialogContent, setIsSurrendered } =
    useGameDispatch();

  const [isSurrenderDialogOpen, setSurrenderDialogOpen] = useState(false);

  const handleSurrender = () => {
    socketRef.current.emit('surrender', myPlayerId);
    setIsSurrendered(true);
    setDialogContent([null, 'game_surrender', null]);
    setOpenOverDialog(true);
  };

  return (
    <Box className='Game'>
      <Box
        className='menu-container'
        style={{
          position: 'absolute',
          left: '5px',
          top: '60px',
          zIndex: '110',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <IconButton
          onClick={() => {
            setSurrenderDialogOpen(true);
          }}
          color='primary'
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <TurnsCount count={turnsCount} />
      </Box>
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
