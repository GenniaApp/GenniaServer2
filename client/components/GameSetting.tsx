import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Snackbar,
  Box,
  Card,
  Alert,
  CardHeader,
  CardContent,
  Button,
  IconButton,
  Tab,
  Tabs,
  Typography,
  TextField,
  FormGroup,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import TerrainIcon from '@mui/icons-material/Terrain';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import WaterIcon from '@mui/icons-material/Water';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useTranslation } from 'next-i18next';

import SliderBox from './SliderBox';
import PlayerTable from './PlayerTable';

import { forceStartOK, SpeedOptions } from '@/lib/constants';
import { useGame, useGameDispatch } from '@/context/GameContext';

interface GameSettingProps {}

const GameSetting: React.FC<GameSettingProps> = (props) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [isNameFocused, setIsNamedFocused] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [forceStart, setForceStart] = useState(false);

  const { room, socketRef, myPlayerId, snackState } = useGame();
  const { roomDispatch, snackStateDispatch } = useGameDispatch();

  const { t } = useTranslation();

  const router = useRouter();

  useEffect(() => {
    setShareLink(window.location.href);
  }, []);

  const handleRoomNameBlur = (event: any) => {
    setIsNamedFocused(false);
    socketRef.current.emit('change_roomName', room.roomName);
  };

  const handleClickForceStart = () => {
    setForceStart(!forceStart);
    socketRef.current.emit('force_start');
  };

  const disabled_ui: boolean = useMemo(() => {
    // when player is not host
    if (myPlayerId && room.players) {
      for (let i = 0; i < room.players.length; ++i) {
        if (room.players[i].id === myPlayerId) {
          return !room.players[i].isRoomHost;
        }
      }
    }
    return true;
  }, [myPlayerId, room]);

  const handleRoomNameChange = (event: any) => {
    roomDispatch({
      type: 'update_roomName',
      payload: event.target.value,
    });
  };

  const handleSettingChange =
    (property: string) => (event: Event, newValue: number) => {
      console.log(`socket emit name: ${property}, ${newValue}`);
      roomDispatch({
        type: 'update_property',
        payload: {
          property: property,
          value: newValue,
        },
      });
      socketRef.current.emit(`change_${property}`, newValue);
    };
  const handleChangeHost = (playerId: string, username: string) => {
    console.log(`change host to ${username}, id ${playerId}`);
    socketRef.current.emit('change_host', playerId);
  };

  const handleLeaveRoom = () => {
    console.log('Leave Room');
    socketRef.current.disconnect();
    router.push(`/`);
  };

  return (
    <Box
      sx={{
        width: {
          xs: '90vw',
          md: '55vw',
          lg: '45vw',
        },
      }}
    >
      <Snackbar
        open={snackState.open}
        autoHideDuration={1000}
        onClose={() => {
          snackStateDispatch({ type: 'toggle' });
        }}
        title={snackState.title}
        message={snackState.message}
      />
      <Card className='menu-container' sx={{ mb: 2 }}>
        <CardHeader
          avatar={
            <IconButton onClick={handleLeaveRoom} color='primary'>
              <ArrowBackRoundedIcon />
            </IconButton>
          }
          title={
            !isNameFocused || disabled_ui ? (
              <Typography
                sx={{ fontSize: '30px', color: '#FFFFFF' }}
                onClick={() => {
                  !disabled_ui && setIsNamedFocused(true);
                }}
              >
                {room.roomName}
              </Typography>
            ) : (
              <TextField
                autoFocus
                variant='standard'
                inputProps={{ style: { fontSize: '30px' } }}
                value={room.roomName}
                onChange={handleRoomNameChange}
                onBlur={handleRoomNameBlur}
                disabled={disabled_ui}
              />
            )
          }
          action={
            <IconButton
              color='primary'
              onClick={() => {
                navigator.clipboard.writeText(shareLink);

                snackStateDispatch({
                  type: 'update',
                  payload: {
                    open: true,
                    title: '',
                    message: t('copied'),
                  },
                });
              }}
            >
              <ShareIcon />
            </IconButton>
          }
          sx={{ padding: 'sm' }}
        />
        <CardContent
          className='menu-container'
          sx={{
            p: 0,
            '&:last-child': { pb: 0 },
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={(event, value) => setTabIndex(value)}
            variant='fullWidth'
            indicatorColor='primary'
            textColor='inherit'
            aria-label='game settings tabs'
          >
            <Tab label={t('game')} />
            <Tab label={t('map')} />
            <Tab label={t('terrain')} />
          </Tabs>
          <TabPanel value={tabIndex} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                <Typography sx={{ mr: 2, whiteSpace: 'nowrap' }}>
                  {t('game-speed')}
                </Typography>

                <RadioGroup
                  aria-label='game-speed'
                  name='game-speed'
                  value={room.gameSpeed}
                  row
                  // @ts-ignore
                  onChange={handleSettingChange('gameSpeed')}
                >
                  {SpeedOptions.map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio size='small' />}
                      label={`${value}x`}
                      disabled={disabled_ui}
                    />
                  ))}
                </RadioGroup>
              </Box>
              <SliderBox
                label={t('max-player-num')}
                value={room.maxPlayers}
                valueLabelDisplay='auto'
                disabled={disabled_ui}
                min={2}
                max={12}
                step={1}
                marks={Array.from({ length: 11 }, (_, i) => ({
                  value: i + 2,
                  label: `${i + 2}`,
                }))}
                handleChange={handleSettingChange('maxPlayers')}
              />
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={room.fogOfWar}
                      // @ts-ignore
                      onChange={handleSettingChange('fogOfWar')}
                      disabled={disabled_ui}
                    />
                  }
                  label={t('fog-of-war')}
                />
              </FormGroup>
            </Box>
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <SliderBox
                label={t('width')}
                value={room.mapWidth}
                disabled={disabled_ui}
                handleChange={handleSettingChange('mapWidth')}
              />
              <SliderBox
                label={t('height')}
                value={room.mapHeight}
                disabled={disabled_ui}
                handleChange={handleSettingChange('mapHeight')}
              />
            </Box>
          </TabPanel>
          <TabPanel value={tabIndex} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <SliderBox
                label={t('mountain')}
                value={room.mountain}
                disabled={disabled_ui}
                handleChange={handleSettingChange('mountain')}
                icon={<TerrainIcon />}
              />
              <SliderBox
                label={t('city')}
                value={room.city}
                disabled={disabled_ui}
                handleChange={handleSettingChange('city')}
                icon={<LocationCityIcon />}
              />
              <SliderBox
                label={t('swamp')}
                value={room.swamp}
                disabled={disabled_ui}
                handleChange={handleSettingChange('swamp')}
                icon={<WaterIcon />}
              />
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
      <Card className='menu-container' sx={{ mb: 2 }}>
        <CardHeader
          avatar={<GroupIcon color='primary' />}
          title={
            <Typography sx={{ color: 'white' }}>{t('players')}</Typography>
          }
          sx={{ padding: 'sm' }}
        />
        <CardContent
          sx={{
            padding: 0,
            '&:last-child': { pb: 0 },
          }}
        >
          <PlayerTable
            myPlayerId={myPlayerId}
            players={room.players}
            handleChangeHost={handleChangeHost}
            disabled_ui={disabled_ui}
          />
        </CardContent>
      </Card>
      <Button
        variant='contained'
        color={forceStart ? 'primary' : 'secondary'}
        size='large'
        sx={{ width: '100%', height: '60px', fontSize: '20px' }}
        onClick={handleClickForceStart}
      >
        {t('force-start')}({room.forceStartNum}/{forceStartOK[room.maxPlayers]})
      </Button>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      ></Box>
    </Box>
  );
};

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default GameSetting;
