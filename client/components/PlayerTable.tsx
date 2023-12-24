import { Box, Button, Typography, Tooltip, Paper } from '@mui/material';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import { useTranslation } from 'next-i18next';

import { Player } from '@/lib/types';
import { ColorArr, MaxTeamNum, WarringStates } from '@/lib/constants';

interface PlayerTableProps {
  myPlayerId: string;
  players: Player[];
  handleChangeHost: any;
  disabled_ui: boolean;
  warringStatesMode: boolean;
}

function PlayerTable(props: PlayerTableProps) {
  const {
    myPlayerId,
    players,
    handleChangeHost,
    disabled_ui,
    warringStatesMode,
  } = props;
  const { t } = useTranslation();

  const teams = new Array(MaxTeamNum + 1);
  players.forEach((x) => {
    if (!teams[x.team]) teams[x.team] = [];
    teams[x.team].push(x);
  });

  const getBgcolor = (player: Player) => {
    if (player.team === MaxTeamNum + 1) return '#000';
    return player.id === myPlayerId ? ColorArr[player.color] : 'transparent';
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {teams.map((players, index) => (
        <Paper
          variant='outlined'
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'column',
            margin: 1,
            borderRadius: 0.5,
            backgroundColor: 'transparent',
          }}
        >
          <Typography
            variant='caption'
            display='block'
            gutterBottom
            sx={{ paddingX: 1 }}
          >
            {index <= MaxTeamNum ? 'TEAM ' + index : 'SPECTATORS'}
          </Typography>
          {players.map((player: Player) => (
            <Tooltip
              key={player.id}
              title={disabled_ui ? '' : t('transfer-host')}
              placement='top'
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Button
                variant='outlined'
                key={player.id}
                disabled={disabled_ui}
                onClick={() => {
                  handleChangeHost(player.id, player.username);
                }}
                sx={{
                  borderColor: ColorArr[player.color],
                  backgroundColor: getBgcolor(player),
                  textTransform: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 1,
                  height: '30px',
                  borderRadius: '20px',
                  boxShadow: 1,
                  marginX: 1,
                  mb: 1,
                }}
              >
                {player.isRoomHost && (
                  <StarsRoundedIcon
                    sx={{
                      color:
                        player.id === myPlayerId
                          ? '#fff'
                          : ColorArr[player.color],
                    }}
                  />
                )}
                <Typography
                  variant='body2'
                  sx={{
                    color:
                      player.id === myPlayerId
                        ? '#fff'
                        : ColorArr[player.color],
                    textDecoration: player.forceStart ? 'underline' : 'none',
                  }}
                >
                  {warringStatesMode ? WarringStates[player.color] : ''}
                  {player.username}
                </Typography>
              </Button>
            </Tooltip>
          ))}
        </Paper>
      ))}
    </Box>
  );
}

export default PlayerTable;
