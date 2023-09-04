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
import { ColorArr, WarringStates } from '@/lib/constants';

interface LeaderBoardProps {
  players: Player[];
  leaderBoardTable: LeaderBoardTable | null;
  checkedPlayers?: UserData[];
  setCheckedPlayers?: (value: UserData[]) => void;
  warringStatesMode?: boolean;
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
    leaderBoardTable,
    checkedPlayers,
    setCheckedPlayers,
    warringStatesMode = false,
  } = props;
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
              paddingX: gameDockExpand ? '0.6rem' : '0.4rem',
            },
          }}
        >
          <TableHead>
            <TableRow
              sx={{ backgroundColor: 'transparent', whiteSpace: 'nowrap' }}
            >
              {warringStatesMode && (
                <TableCell align='center'>{t('country')}</TableCell>
              )}
              {checkedPlayers && setCheckedPlayers && (
                <TableCell align='center'>{t('view')}</TableCell>
              )}
              {gameDockExpand ? (
                <TableCell align='center'>{t('player')}</TableCell>
              ) : (
                <TableCell align='center' sx={{ padding: '1px' }}></TableCell>
              )}
              <TableCell align='center'>{t('army')}</TableCell>
              <TableCell align='center'>{t('land')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderBoardData.map((player, index) => (
              <TableRow key={index} sx={{ backgroundColor: 'transparnet' }}>
                {warringStatesMode && (
                  <TableCell align='center'>
                    {WarringStates[player.color]}
                  </TableCell>
                )}
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
                <TableCell align='center'>{player.armyCount}</TableCell>
                <TableCell align='center'>{player.landsCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
