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
    <Box>
      <TableContainer>
        <Table
          className='menu-container'
          sx={{
            position: 'absolute',
            right: '0px',
            top: '0px',
            width: 'min-content',
            zIndex: '110',
            overflow: 'hidden',
            borderRadius: '24px 0 0 24px !important',
            borderCollapse: 'unset', // remove border safari
            '& .MuiTableCell-root': {
              transition: 'all .2s ease-in-out',
              borderRadius: '24px !important',
              border: 'unset !important',
              paddingY: {
                xs: '0rem',
                md: '0.5rem',
              },
              paddingX: gameDockExpand
                ? { xs: '0.6rem', md: '0.8rem' }
                : { xs: '0.4rem', md: '0.6rem' },
            },
            boxShadow: 1,
          }}
        >
          <TableHead>
            <TableRow
              sx={{ backgroundColor: 'transparent', whiteSpace: 'nowrap' }}
              onClick={() => {
                setGameDockExpand(!gameDockExpand);
              }}
            >
              <TableCell
                align='center'
                sx={{ display: warringStatesMode ? '' : 'none' }}
              >
                {t('country')}
              </TableCell>
              <TableCell
                align='center'
                sx={{
                  display:
                    gameDockExpand && checkedPlayers && setCheckedPlayers
                      ? ''
                      : 'none',
                }}
              >
                {t('view')}
              </TableCell>
              <TableCell
                align='center'
                sx={{ display: gameDockExpand ? '' : 'none' }}
              >
                {t('player')}
              </TableCell>
              <TableCell
                align='center'
                sx={{ display: gameDockExpand ? 'none' : '', padding: '1px' }}
              ></TableCell>
              <TableCell align='center'>{t('army')}</TableCell>
              <TableCell align='center'>{t('land')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderBoardData.map((player, index) => (
              <TableRow key={index}>
                {warringStatesMode && (
                  <TableCell align='center'>
                    {WarringStates[player.color]}
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    display:
                      gameDockExpand && checkedPlayers && setCheckedPlayers
                        ? ''
                        : 'none',
                  }}
                >
                  <Checkbox
                    defaultChecked={false}
                    sx={{
                      width: '1.5rem',
                      height: '1.5rem',
                    }}
                    onChange={(event: any) => {
                      if (!checkedPlayers || !setCheckedPlayers) return;
                      if (event.target.checked) {
                        let newCheckedPlayers = [
                          ...(checkedPlayers as UserData[]),
                          {
                            username: player.username,
                            color: player.color,
                          } as UserData,
                        ];
                        setCheckedPlayers(newCheckedPlayers);
                      } else {
                        setCheckedPlayers(
                          checkedPlayers.filter((p) => p.color !== player.color)
                        );
                      }
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    display: gameDockExpand ? '' : 'none',
                    backgroundColor: ColorArr[player.color],
                  }}
                  onClick={() => {
                    setGameDockExpand(!gameDockExpand);
                  }}
                >
                  {player.username}
                </TableCell>
                <TableCell
                  sx={{
                    display: gameDockExpand ? 'none' : '',
                    padding: '3px',
                    backgroundColor: ColorArr[player.color],
                  }}
                  onClick={() => {
                    setGameDockExpand(!gameDockExpand);
                  }}
                ></TableCell>
                <TableCell
                  align='center'
                  onClick={() => {
                    setGameDockExpand(!gameDockExpand);
                  }}
                >
                  {player.armyCount}
                </TableCell>
                <TableCell
                  align='center'
                  onClick={() => {
                    setGameDockExpand(!gameDockExpand);
                  }}
                >
                  {player.landsCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
