import { Box, Button, Typography, Tooltip } from '@mui/material';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import { useTranslation } from 'next-i18next';

import { Player } from '@/lib/types';
import { ColorArr } from '@/lib/constants';

interface PlayerTableProps {
  myPlayerId: string;
  players: Player[];
  handleChangeHost: any;
  disabled_ui: boolean;
}

function PlayerTable(props: PlayerTableProps) {
  const { myPlayerId, players, handleChangeHost, disabled_ui } = props;
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex' }}>
      {players.map((player) => (
        <Tooltip key={player.id} title={t('transfer-host')} placement='top'>
          <Button
            variant='outlined'
            key={player.id}
            disabled={disabled_ui}
            onClick={() => {
              handleChangeHost(player.id, player.username);
            }}
            sx={{
              borderColor: ColorArr[player.color],
              backgroundColor:
                player.id === myPlayerId
                  ? ColorArr[player.color]
                  : 'transparent',
              textTransform: 'none',
              display: 'flex',
              justifyContent: 'space-between',
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
                    player.id === myPlayerId ? '#fff' : ColorArr[player.color],
                }}
              />
            )}
            <Typography
              variant='body2'
              sx={{
                color:
                  player.id === myPlayerId ? '#fff' : ColorArr[player.color],
                textDecoration: player.forceStart ? 'underline' : 'none',
              }}
            >
              {player.username}
            </Typography>
          </Button>
        </Tooltip>
      ))}
    </Box>
  );
}

export default PlayerTable;
