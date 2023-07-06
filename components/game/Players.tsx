import React, { useMemo } from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
} from '@mui/material';
import { PlayersProp } from './types-new';
import {ColorArr} from '@/lib/constants';

export default function Players(players: PlayersProp) {
  const playerList = useMemo(() => {
    return Object.values(players);
  }, [players]);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell>Army</TableCell>
            <TableCell>Land</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {playerList.map((player, index) => (
            <TableRow
              key={index}
              sx={{ backgroundColor: ColorArr[player.color] }}
            >
              <TableCell>{player.name}</TableCell>
              <TableCell>{player.armiesCount}</TableCell>
              <TableCell>{player.unitiesCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
