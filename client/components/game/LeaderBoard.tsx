import {
  Box,
  TableContainer,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Checkbox,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';
import { Player, LeaderBoardTable, UserData } from '@/lib/types';
import { ColorArr } from '@/lib/constants';

interface LeaderBoardProps {
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
  const { players, leaderBoardTable, checkedPlayers, setCheckedPlayers } =
    props;
  const [gameDockExpand, setGameDockExpand] = useState(true);
  const { t } = useTranslation();

  const isSmallScreen = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (!checkedPlayers) setGameDockExpand(!isSmallScreen);
  }, [isSmallScreen, checkedPlayers]);

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
      onClick={() => {
        if (!checkedPlayers) setGameDockExpand(!gameDockExpand);
      }}
    >
      <TableContainer>
        <Table
          className='menu-container'
          sx={{
            position: 'absolute',
            right: '1px',
            top: '60px',
            width: 'min-content',
            zIndex: '110',
            overflow: 'hidden',
            '& .MuiTableCell-root': {
              paddingY: '0.6rem',
              paddingX: gameDockExpand ? '0.8rem' : '0.4rem',
            },
          }}
        >
          <TableHead>
            <TableRow
              sx={{ backgroundColor: 'transparent', whiteSpace: 'nowrap' }}
            >
              {checkedPlayers && setCheckedPlayers && (
                <TableCell>View</TableCell>
              )}
              {gameDockExpand ? (
                <TableCell>{t('player')}</TableCell>
              ) : (
                <TableCell sx={{ padding: '1px' }}></TableCell>
              )}
              <TableCell>{t('army')}</TableCell>
              <TableCell>{t('land')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderBoardData.map((player, index) => (
              <TableRow key={index} sx={{ backgroundColor: 'transparnet' }}>
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
                {gameDockExpand ? (
                  <TableCell
                    sx={{
                      backgroundColor: ColorArr[player.color],
                    }}
                  >
                    {player.username}
                  </TableCell>
                ) : (
                  <TableCell
                    sx={{
                      padding: '3px',
                      backgroundColor: ColorArr[player.color],
                    }}
                  ></TableCell>
                )}
                <TableCell>{player.armyCount}</TableCell>
                <TableCell>{player.landsCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
