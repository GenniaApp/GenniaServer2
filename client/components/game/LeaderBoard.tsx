import {
  Box,
  TableContainer,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
} from '@mui/material';
import { LeaderBoardTable } from '@/lib/types';
import { ColorArr } from '@/lib/constants';
import { useGame } from '@/context/GameContext';

interface LeaderBoardProps {
  leaderBoardTable: LeaderBoardTable | null;
}


type LeaderBoardData = {
  color: number;
  username: string | null;
  armyCount: number;
  landsCount: number;
}[];

export default function LeaderBoard(props: LeaderBoardProps) {
  const { room } = useGame();
  let { leaderBoardTable } = props;
  if (!leaderBoardTable) return null;

  const fetchUsernameByColor = function (color: number) {
    let res = room.players.filter((player) => player.color === color);
    if (res.length) return res[0].username;
    else return null;
  }

  let leaderBoardData: LeaderBoardData = leaderBoardTable.map((row) => {
    return {
      color: row[0],
      username: fetchUsernameByColor(row[0]),
      armyCount: row[1],
      landsCount: row[2]
    };
  });
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'transparent' }}>
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
              <TableCell>{player.username}</TableCell>
              <TableCell>{player.armyCount}</TableCell>
              <TableCell>{player.landsCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
