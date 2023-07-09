import {
  Box,
  TableContainer,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
} from '@mui/material';
import { LeaderBoardData } from '@/lib/types';
import { ColorArr } from '@/lib/constants';

interface LeaderBoardProps {
  leaderBoardData: LeaderBoardData;
}

export default function LeaderBoard(props: LeaderBoardProps) {
  const { leaderBoardData } = props;
  return (
    <TableContainer
      sx={{
        position: 'absolute',
        right: '5px',
        top: '0px',
        width: 'min-content',
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'black' }}>
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
