import { useState, useEffect } from 'react';
import {
  Snackbar,
  Box,
  Card,
  Chip,
  Alert,
  AlertTitle,
  CardHeader,
  CardContent,
  Button,
  IconButton,
  Slider,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import TerrainIcon from '@mui/icons-material/Terrain';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import WaterIcon from '@mui/icons-material/Water';
import GroupIcon from '@mui/icons-material/Group';
import { io } from 'socket.io-client';
import { ThemeProvider } from '@mui/material/styles';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import ColorArr from '@/lib/colors';
import theme from '@/components/theme';
import Navbar from '@/components/Navbar';
import ChatBox from '@/components/ChatBox';
import Game from '@/components/game/Game';

import { map, players } from '@/lib/static-demo-game-state'

const socket = io('http://localhost:3000');

interface Player {
  name: string;
  color: number;
  ready_status: boolean;
}

function PlayerTable({ players }: { players: Player[] }) {
  return (
    <Box sx={{ display: 'flex' }}>
      {players.map((player) => (
        <Box
          key={player.name}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            bgcolor: ColorArr[player.color],
            height: '30px',
            borderRadius: '20px',
            boxShadow: 1,
            marginX: 1,
            mb: 1,
          }}
        >
          <Typography
            variant='body2'
            sx={{
              color: '#fff',
              textDecoration: player.ready_status ? 'underline' : 'none',
            }}
          >
            {player.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
const demoPlayers: Player[] = [
  {
    name: 'Player 1',
    color: 0,
    ready_status: true,
  },
  {
    name: 'Player 2',
    color: 1,
    ready_status: false,
  },
  {
    name: 'Player 3',
    color: 2,
    ready_status: true,
  },
];

function GamingRoom() {
  const [value, setValue] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(3);
  const [maxPlayerNum, setMaxPlayerNum] = useState(2);
  const [mapWidth, setMapWidth] = useState(0.5);
  const [mapHeight, setMapHeight] = useState(0.5);
  const [mountain, setMountain] = useState(0.5);
  const [city, setCity] = useState(0.5);
  const [swamp, setSwamp] = useState(0.5);
  const [readyNum, setReadyNum] = useState(0);
  const [forceStart, setForceStart] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [players, setPlayers] = useState<Player[]>(demoPlayers);
  const [roomName, setRoomName] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    {
      setRoomName(localStorage.getItem('roomName') || 'Untitled Room');
    }
  }, []);

  const { t } = useTranslation();

  const handleClose = () => {
    setOpen(false);
  };

  const forceStartOK = [1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7, 8];
  //                    0  1  2  3  4  5  6  7  8  9 10 11 12
  useEffect(() => {
    setShareLink(window.location.href);
  }, []);

  socket.on('force_start_changed', (fsNum) => {
    setReadyNum(fsNum);
  });

  const handleChange = (event: Event, newValue: number) => {
    setValue(newValue);
  };

  const handleSliderChange =
    (setter: (value: number) => void) => (event: Event, newValue: number) => {
      setter(newValue);
      socket.emit(setter.name, newValue);
    };

  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <ChatBox />
      {!forceStart ? <Box
        sx={{
          width: {
            xs: '90vw',
            md: '40vw',
          },
        }}
      >
        <Alert
          color='primary'
          icon={false}
          sx={{ backgroundColor: 'transparent', padding: 0 }}
          action={
            <IconButton
              color='primary'
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                setOpen(true);
              }}
            >
              <ShareIcon />
            </IconButton>
          }
        >
          <Typography variant='h5'>{roomName}</Typography>
        </Alert>
        <Snackbar
          open={open}
          autoHideDuration={1000}
          onClose={handleClose}
          message='Copied!'
        />
        <Box
          className='menu-container'
          sx={{
            mb: 2,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant='fullWidth'
            indicatorColor='primary'
            textColor='inherit'
            aria-label='game settings tabs'
          >
            <Tab label={t('game')} />
            <Tab label={t('map')} />
            <Tab label={t('terrain')} />
          </Tabs>
          <TabPanel value={value} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <SliderBox
                label={t('game-speed')}
                value={gameSpeed}
                valueLabelDisplay='off'
                min={0}
                max={6}
                marks={[
                  { value: 0, label: '0.25x' },
                  { value: 1, label: '0.5x' },
                  { value: 2, label: '0.75x' },
                  { value: 3, label: '1x' },
                  { value: 4, label: '2x' },
                  { value: 5, label: '3x' },
                  { value: 6, label: '4x' },
                ]}
                handleChange={handleSliderChange(setGameSpeed)}
              />
              <SliderBox
                label={t('max-player-num')}
                value={maxPlayerNum}
                valueLabelDisplay='auto'
                min={2}
                max={12}
                marks={Array.from({ length: 11 }, (_, i) => ({
                  value: i + 2,
                  label: i + 2,
                }))}
                handleChange={handleSliderChange(setMaxPlayerNum)}
              />
            </Box>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <SliderBox
                label={t('width')}
                value={mapWidth}
                valueLabelDisplay='on'
                min={0}
                max={1}
                step={0.01}
                handleChange={handleSliderChange(setMapWidth)}
              />
              <SliderBox
                label={t('height')}
                value={mapHeight}
                valueLabelDisplay='on'
                min={0}
                max={1}
                step={0.01}
                handleChange={handleSliderChange(setMapHeight)}
              />
            </Box>
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <SliderBox
                label={t('mountain')}
                value={mountain}
                valueLabelDisplay='on'
                min={0}
                max={1}
                step={0.01}
                handleChange={handleSliderChange(setMountain)}
                icon={<TerrainIcon />}
              />
              <SliderBox
                label={t('city')}
                value={city}
                valueLabelDisplay='on'
                min={0}
                max={1}
                step={0.01}
                handleChange={handleSliderChange(setCity)}
                icon={<LocationCityIcon />}
              />
              <SliderBox
                label={t('swamp')}
                value={swamp}
                valueLabelDisplay='on'
                min={0}
                max={1}
                step={0.01}
                handleChange={handleSliderChange(setSwamp)}
                icon={<WaterIcon />}
              />
            </Box>
          </TabPanel>
        </Box>
        <Card className='menu-container' sx={{ mb: 2 }}>
          <CardHeader
            avatar={<GroupIcon color='primary' />}
            title={
              <Typography sx={{ color: 'white' }}>{t('players')}</Typography>
            }
            sx={{ padding: 'sm' }}
          />
          <CardContent sx={{ padding: 'sm' }}>
            <PlayerTable players={players} />
          </CardContent>
        </Card>
        <Button
          variant='contained'
          color={forceStart ? 'primary' : 'secondary'}
          size='large'
          sx={{ width: '100%', height: '60px', fontSize: '20px' }}
          onClick={() => setForceStart(!forceStart)}
        >
          Force Start ({readyNum}/{forceStartOK[maxPlayerNum]})
        </Button>
      </Box> : <Game turnsCount={11} map={map} players={players} />}
    </ThemeProvider>
  );
}

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

interface SliderBoxProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  valueLabelDisplay?: 'auto' | 'on' | 'off' | undefined;
  marks?: { value: number; label: string }[];
  icon?: React.ReactNode;
  handleChange: any;
}

const SliderBox = ({
  label,
  value,
  min,
  max,
  step = 1,
  valueLabelDisplay,
  marks,
  icon,
  handleChange,
}: SliderBoxProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
      {icon}
      <Typography id={`${label}Label`} sx={{ mr: 2, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
      <Slider
        name={label}
        id={label}
        aria-labelledby={`${label}Label`}
        valueLabelDisplay={valueLabelDisplay}
        step={step}
        min={min}
        max={max}
        defaultValue={value}
        value={value}
        marks={marks}
        onChange={handleChange}
      />
    </Box>
  );
};

export default GamingRoom;

export async function getServerSideProps(context) {
  // extract the locale identifier from the URL
  const { locale } = context;

  return {
    props: {
      // pass the translation props to the page component
      ...(await serverSideTranslations(locale)),
    },
  };
}
