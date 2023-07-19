import { Box } from '@mui/material';
import SurrenderDialog from './SurrenderDialog';
import GameMap from './GameMap';
import LeaderBoard from './LeaderBoard';
import OverDialog from './OverDialog';
import { useGame, useGameDispatch } from '@/context/GameContext';

export default function Game() {
  const { room, socketRef, myPlayerId, turnsCount, leaderBoardData } =
    useGame();
  const { setOpenOverDialog, setDialogContent, setIsSurrendered } =
    useGameDispatch();

  const handleSurrender = () => {
    socketRef.current.emit('surrender', myPlayerId);
    setIsSurrendered(true);
    setDialogContent([null, 'game_surrender', null]);
    setOpenOverDialog(true);
  };

  return (
    <Box className='Game'>
      <LeaderBoard
        leaderBoardTable={leaderBoardData}
        players={room.players}
        turnsCount={turnsCount}
      />
      <GameMap />
      <SurrenderDialog handleSurrender={handleSurrender} />
      <OverDialog />
    </Box>
  );
}
