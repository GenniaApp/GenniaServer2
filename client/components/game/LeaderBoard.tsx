import {
  Box,
  TableContainer,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Card,
  CardHeader,
  CardContent,
  Checkbox,
  IconButton,
} from '@mui/material';
import StartRoundedIcon from '@mui/icons-material/StartRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';

import { useState } from 'react';
import { Player, LeaderBoardTable, UserData } from '@/lib/types';
import { ColorArr } from '@/lib/constants';

interface LeaderBoardProps {
  turnsCount: number;
  players: Player[];
  leaderBoardTable: LeaderBoardTable | null;
  checkedPlayers?: UserData[];
  setCheckedPlayers?: (value: UserData[]) => void;
}

type LeaderBoardData = {
  color: number;
  username: string | null;
  armyCount: number;
  landsCount: number;
}[];

export default function LeaderBoard(props: LeaderBoardProps) {
  const {
    players,
    turnsCount,
    leaderBoardTable,
    checkedPlayers,
    setCheckedPlayers,
  } = props;
  const [gameDockExpand, setGameDockExpand] = useState(true);
  if (!leaderBoardTable) return null;

  const fetchUsernameByColor = function (color: number) {
    let res = players.filter((player) => player.color === color);
    if (res.length) return res[0].username;
    else return null;
  };

  let leaderBoardData: LeaderBoardData = leaderBoardTable.map((row) => {
    return {
      color: row[0],
      username: fetchUsernameByColor(row[0]),
      armyCount: row[1],
      landsCount: row[2],
    };
  });
  return (
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
              {gameDockExpand ? <MenuOpenRoundedIcon /> : <StartRoundedIcon />}
            </IconButton>
          }
        />
        <CardContent sx={{ display: gameDockExpand ? '' : 'none' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'transparent' }}>
                  {checkedPlayers && setCheckedPlayers && (
                    <TableCell>View</TableCell>
                  )}
                  <TableCell>Player</TableCell>
                  <TableCell>Army</TableCell>
                  <TableCell>Land</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderBoardData.map((player, index) => (
                  <TableRow
                    key={index}
                    sx={{ backgroundColor: ColorArr[player.color] }}
                  >
                    {checkedPlayers && setCheckedPlayers && (
                      <TableCell>
                        <Checkbox
                          defaultChecked={false}
                          onChange={(event: any) => {
                            if (event.target.checked) {
                              let newCheckedPlayers = [
                                ...checkedPlayers,
                                {
                                  username: player.username,
                                  color: player.color,
                                } as UserData,
                              ];
                              setCheckedPlayers(newCheckedPlayers);
                            } else {
                              setCheckedPlayers(
                                checkedPlayers.filter(
                                  (p) => p.color !== player.color
                                )
                              );
                            }
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell>{player.username}</TableCell>
                    <TableCell>{player.armyCount}</TableCell>
                    <TableCell>{player.landsCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
