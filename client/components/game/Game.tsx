import React, { useCallback, useState } from 'react';
import { Box, Card, CardHeader, CardContent, IconButton } from '@mui/material';
import SurrenderDialog from './SurrenderDialog';
import GameMap from './GameMap';
import LeaderBoard from './LeaderBoard';
import OverDialog from './OverDialog';
import { useGame, useGameDispatch } from '@/context/GameContext';
import { useTranslation } from 'next-i18next';
import StartRoundedIcon from '@mui/icons-material/StartRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';

export default function Game() {
  const { socketRef, myPlayerId, turnsCount, leaderBoardData } = useGame();
  const { setOpenOverDialog, setDialogContent, setIsSurrendered } =
    useGameDispatch();
  const { t } = useTranslation();
  const [gameDockExpand, setGameDockExpand] = useState(true);

  const handleSurrender = () => {
    socketRef.current.emit('surrender', myPlayerId);
    setIsSurrendered(true);
    setDialogContent([null, 'game_surrender', null]);
    setOpenOverDialog(true);
  };

  return (
    <Box className='Game'>
      <Box
        sx={{
          position: 'absolute',
          width: 'max-content',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <Card
          sx={{
            width: '100%',
            height: 'max-content',
            marginTop: '80px',
            marginBottom: '80px',
            backdropFilter: 'blur(3px)',
            backgroundColor: 'rgb(99 97 141 / 68%)',
            borderRadius: '0 10px 10px 0',
            zIndex: 66,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            overflow: 'auto',
            padding: '0',
          }}
        >
          <CardHeader
            sx={{ width: '100%' }}
            title={gameDockExpand ? `Turn ${turnsCount}` : `${turnsCount}`}
            action={
              <IconButton onClick={() => setGameDockExpand(!gameDockExpand)}>
                {gameDockExpand ? (
                  <MenuOpenRoundedIcon />
                ) : (
                  <StartRoundedIcon />
                )}
              </IconButton>
            }
          />
          <CardContent sx={{ display: gameDockExpand ? '' : 'none' }}>
            <LeaderBoard leaderBoardTable={leaderBoardData} />
          </CardContent>
        </Card>
      </Box>
      <GameMap />
      <SurrenderDialog handleSurrender={handleSurrender} />
      <OverDialog />
    </Box>
  );
}
