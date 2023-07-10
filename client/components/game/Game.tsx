import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import SurrenderDialog from './SurrenderDialog';
import TurnsCount from './TurnsCount';
import GameMap from './GameMap';
import LeaderBoard from './LeaderBoard';
import OverDialog from './OverDialog';
import { LeaderBoardData, MapDataProp, Player } from '@/lib/types';

interface GameProps {
  myPlayerId: string;
  turnsCount: number;
  mapData: MapDataProp;
  players: Player[];
  roomId: string;
  leaderBoardData: LeaderBoardData;
  dialogContent: [Player | null, string];
  handleSurrender: any;
  openOverDialog: boolean;
  setOpenOverDialog: any;
}

function Game(props: GameProps) {
  const {
    myPlayerId,
    turnsCount,
    mapData,
    players,
    roomId,
    leaderBoardData,
    dialogContent,
    handleSurrender,
    openOverDialog,
    setOpenOverDialog,
  } = props;

  const handleDialogSurrender = useCallback(() => {
    handleSurrender();
    setOpenOverDialog(true);
  }, []);

  return (
    <Box className='Game'>
      <TurnsCount count={turnsCount} />
      <GameMap mapData={mapData} players={players} />
      <LeaderBoard leaderBoardData={leaderBoardData} />
      <SurrenderDialog onSurrender={handleDialogSurrender} />
      <OverDialog
        myPlayerId={myPlayerId}
        open={openOverDialog}
        dialogContent={dialogContent}
        onClose={() => {
          setOpenOverDialog(false);
        }}
        roomId={roomId}
      />
    </Box>
  );
}

export default Game;
