import { useState, useEffect, useRef, useMemo } from 'react';
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
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import TerrainIcon from '@mui/icons-material/Terrain';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import WaterIcon from '@mui/icons-material/Water';
import GroupIcon from '@mui/icons-material/Group';

import SliderBox from '@/components/SliderBox';
import { io } from 'socket.io-client';
import { ThemeProvider } from '@mui/material/styles';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import ChatBox from '@/components/ChatBox';
import Footer from '@/components/Footer';
import Swal from 'sweetalert2';

import { ColorArr, forceStartOK, SpeedOptions } from '@/lib/constants';
import { Room, Message, Player } from '@/lib/types';
import Point from '@/lib/point';
import theme from '@/components/theme';
import Navbar from '@/components/Navbar';

import { Radio, RadioGroup, FormControlLabel } from '@mui/material';

interface PlayerTableProps {
  myPlayerId: string;
  players: Player[];
  handleChangeHost: any;
  disabled_ui: boolean;
}

function PlayerTable(props: PlayerTableProps) {
  const { myPlayerId, players, handleChangeHost, disabled_ui } = props;
  return (
    <Box sx={{ display: 'flex' }}>
      {players.map((player) => (
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
              player.id === myPlayerId ? ColorArr[player.color] : 'transparent',
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
              color: player.id === myPlayerId ? '#fff' : ColorArr[player.color],
              textDecoration: player.forceStart ? 'underline' : 'none',
            }}
          >
            {player.username}
          </Typography>
        </Button>
      ))}
    </Box>
  );
}

function GamingRoom() {
  const { t } = useTranslation();
  // todo 考虑合并所有状态到 roomInfo 并使用 useReducer 更新
  const [value, setValue] = useState(0);
  const [roomName, setRoomName] = useState<string>('');
  const [gameSpeed, setGameSpeed] = useState(3);
  const [maxPlayerNum, setMaxPlayerNum] = useState(2);
  const [mapWidth, setMapWidth] = useState(0.5);
  const [mapHeight, setMapHeight] = useState(0.5);
  const [mountain, setMountain] = useState(0.5);
  const [city, setCity] = useState(0.5);
  const [swamp, setSwamp] = useState(0.5);
  const [forceStartNum, setForceStartNum] = useState(0);
  const [forceStart, setForceStart] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string>('');

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackTitle, setSnackTitle] = useState('');
  const [snackMessage, setSnackMessage] = useState('');
  const socketRef = useRef<any>();

  const router = useRouter();
  const roomId = router.query.roomId as string;

  const disabled_ui = useMemo(() => {
    if (myPlayerId && players) {
      for (let i = 0; i < players.length; ++i) {
        if (players[i].id === myPlayerId) {
          return !players[i].isRoomHost;
        }
      }
    }
    return true;
  }, [myPlayerId, players]);

  useEffect(() => {
    setUsername(localStorage.getItem('username') || t('anonymous'));
  }, []);

  useEffect(() => {
    setShareLink(window.location.href);
  }, []);

  const handleSnackMessage = (title: string, message: string) => {
    setSnackTitle(title);
    setSnackMessage(message);
    setSnackOpen(true);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const navToHome = () => {
    router.push(`/`);
  };

  const handleLeaveRoom = () => {
    socketRef.current.emit('leave_game');
    socketRef.current.disconnect();
    navToHome();
  };

  const handleChangeHost = (playerId: string, username: string) => {
    console.log(`change host to ${username}, id ${playerId}`);
    socketRef.current.emit('change_host', playerId);
  };

  const handleClickForceStart = () => {
    setForceStart(!forceStart);
    socketRef.current.emit('force_start');
  };

  const handleSettingChange =
    (setter: (value: number) => void, emit_name: string) =>
    (event: Event, newValue: number) => {
      setter(newValue);
      console.log(`socket emit name: ${emit_name}, ${newValue}`);
      socketRef.current.emit(emit_name, newValue);
    };

  const updateRoomInfo = (room: Room) => {
    console.log(`room: ${JSON.stringify(room)}`);

    setRoomName(room.roomName);
    setGameStarted(room.gameStarted);
    setForceStartNum(room.forceStartNum);

    setMaxPlayerNum(room.maxPlayers);
    setGameSpeed(room.gameSpeed);
    setMapWidth(room.mapWidth);
    setMapHeight(room.mapHeight);
    setMountain(room.mountain);
    setCity(room.city);
    setSwamp(room.swamp);

    setPlayers(room.players);
  };

  useEffect(() => {
    if (!roomId) return;
    if (!username) return;
    fetch('/api/gserver').finally(() => {
      socketRef.current = io({ query: { roomId: roomId, username: username } });
      let socket = socketRef.current;
      socket.emit('get_room_info');

      // set up socket event listeners
      socket.on('connect', () => {
        console.log(`socket client connect to server: ${socket.id}`);
        if (localStorage.getItem('playerId'))
          socket.emit('reconnect', myPlayerId);
      });
      socket.on('set_player_id', (id: string) => {
        if (!localStorage.getItem('playerId')) {
          setMyPlayerId(id);
          localStorage.setItem('playerId', id);
        }
      });
      socket.on('delete_local_reconnect', () => {
        localStorage.removeItem('playerId');
        router.reload();
      });
      socket.on('room_info_update', updateRoomInfo);
      socket.on('error', (title: string, message: string) => {
        handleSnackMessage(title, message);
      });

      socket.on('room_message', (player: Player, content: string) => {
        console.log(`room_message: ${content}`);
        setMessages((messages) => [...messages, new Message(player, content)]);
      });

      // socket.on('game_update', (gameMap, width, height, turn, leaderBoard) => {
      //   // Update game map state
      //   setGameMap(JSON.parse(gameMap)); // todo
      //   console.log(gameMap);
      //   console.log(`width ${width}`);
      //   console.log(`height ${height}`);
      //   console.log(`leaderBoard ${leaderBoard}`);
      // });

      // todo 设置颜色

      socket.on('reject_join', (message: string) => {
        Swal.fire({
          title: t('reject-join'),
          text: message,
          icon: 'error',
          showDenyButton: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'OK',
        }).then((result) => {
          navToHome();
        });
      });

      socket.on('connect_error', (error: Error) => {
        console.log('\nConnection Failed: ' + error);
        socket.emit('leave_game');
        socket.disconnect();
        Swal.fire({
          title: "Can't connect to the server",
          text: 'Please reflush the App.',
          icon: 'error',
          showDenyButton: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'OK',
        }).then((result) => {
          navToHome();
        });
      });

      socket.on('disconnect', () => {
        handleSnackMessage('Reconnecting...', 'Disconnected from the server');
        //   title: 'Disconnected from the server',
        //   html: 'Please reflush the App.',
        //   icon: 'error',
        //   showDenyButton: false,
        //   showCancelButton: false,
        //   allowOutsideClick: false,
        //   confirmButtonText: 'Quit',
        // }).then((result) => {
        //   /* Read more about isConfirmed, isDenied below */
        //   navToHome();
        // });
        console.log('Disconnected from server.');
      });

      socket.on('reconnect', () => {
        console.log('Reconnected to server.');
        if (gameStarted && myPlayerId) {
          socket.emit('reconnect', myPlayerId);
        } else {
          socket.emit('get_room_info');
        }
      });

      return () => {
        console.log('use effect leave room');
        socket.emit('leave_game');
        socket.disconnect();
      };
    });
  }, [roomId, username]);

  function handleKeyDown(event: KeyboardEvent) {
    const withinMap = (point: Point) => {
      // Check if point is within game map boundaries
      return (
        point.x >= 0 &&
        point.x < gameMap.length &&
        point.y >= 0 &&
        point.y < gameMap[0].length
      );
    };

    const handleMove = (direction) => {
      let newPoint;
      if (direction === 'left') {
        newPoint = { x: selectedTd.x, y: selectedTd.y - 1 };
      } else if (direction === 'up') {
        newPoint = { x: selectedTd.x - 1, y: selectedTd.y };
      } else if (direction === 'right') {
        newPoint = { x: selectedTd.x, y: selectedTd.y + 1 };
      } else if (direction === 'down') {
        newPoint = { x: selectedTd.x + 1, y: selectedTd.y };
      }

      if (withinMap(newPoint)) {
        setQueue([
          ...queue,
          {
            from: selectedTd,
            to: newPoint,
            half: selectedTd.half,
          },
        ]);
        setSelectedTd(newPoint);
      }
    };

    switch (event.key) {
      case 'a':
      case 'ArrowLeft':
        handleMove('left');
        break;
      case 'w':
      case 'ArrowUp':
        handleMove('up');
        break;
      case 'd':
      case 'ArrowRight':
        handleMove('right');
        break;
      case 's':
      case 'ArrowDown':
        handleMove('down');
        break;
      default:
        break;
    }
  }

  function handleAttackFailure(from, to) {
    setQueue((prevQueue) => {
      // Remove last item from queue
      const newQueue = [...prevQueue];
      newQueue.pop();

      // Remove any items in queue that have the same 'to' point as the failed attack
      let lastPoint = to;
      while (newQueue.length > 0) {
        const point = newQueue[newQueue.length - 1].from;
        if (point.x === lastPoint.x && point.y === lastPoint.y) {
          newQueue.pop();
          lastPoint = point;
        } else {
          break;
        }
      }

      return newQueue;
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <Box
        sx={{
          width: {
            xs: '90vw',
            md: '55vw',
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
                handleSnackMessage(t('copied'));
              }}
            >
              <ShareIcon />
            </IconButton>
          }
        >
          <Typography variant='h5'>
            {roomId} : {roomName}{' '}
          </Typography>
        </Alert>
        <Snackbar
          open={snackOpen}
          autoHideDuration={1000}
          onClose={() => {
            setSnackOpen(!snackOpen);
          }}
          title={snackTitle}
          message={snackMessage}
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
              <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
                <Typography sx={{ mr: 2, whiteSpace: 'nowrap' }}>
                  {t('game-speed')}
                </Typography>

                <RadioGroup
                  aria-label='game-speed'
                  name='game-speed'
                  value={gameSpeed}
                  row
                  onChange={handleSettingChange(
                    setGameSpeed,
                    'change_game_speed'
                  )}
                >
                  {SpeedOptions.map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio />}
                      label={`${value}x`}
                      disabled={disabled_ui}
                    />
                  ))}
                </RadioGroup>
              </Box>
              <SliderBox
                label={t('max-player-num')}
                value={maxPlayerNum}
                valueLabelDisplay='auto'
                disabled={disabled_ui}
                min={2}
                max={12}
                step={1}
                marks={Array.from({ length: 11 }, (_, i) => ({
                  value: i + 2,
                  label: `${i + 2}`,
                }))}
                handleChange={handleSettingChange(
                  setMaxPlayerNum,
                  'change_max_player_num'
                )}
              />
            </Box>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <SliderBox
                label={t('width')}
                value={mapWidth}
                disabled={disabled_ui}
                handleChange={handleSettingChange(
                  setMapWidth,
                  'change_map_width'
                )}
              />
              <SliderBox
                label={t('height')}
                value={mapHeight}
                disabled={disabled_ui}
                handleChange={handleSettingChange(
                  setMapHeight,
                  'change_map_height'
                )}
              />
            </Box>
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <SliderBox
                label={t('mountain')}
                value={mountain}
                disabled={disabled_ui}
                handleChange={handleSettingChange(
                  setMountain,
                  'change_mountain'
                )}
                icon={<TerrainIcon />}
              />
              <SliderBox
                label={t('city')}
                value={city}
                disabled={disabled_ui}
                handleChange={handleSettingChange(setCity, 'change_city')}
                icon={<LocationCityIcon />}
              />
              <SliderBox
                label={t('swamp')}
                value={swamp}
                disabled={disabled_ui}
                handleChange={handleSettingChange(setSwamp, 'change_swamp')}
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
            <PlayerTable
              myPlayerId={myPlayerId}
              players={players}
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
          {t('force-start')}({forceStartNum}/{forceStartOK[maxPlayerNum]})
        </Button>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            variant='contained'
            size='large'
            sx={{ mt: 2, height: '60px', fontSize: '20px' }}
            onClick={handleLeaveRoom}
          >
            {t('leave-room')}
          </Button>
        </Box>
      </Box>
      <ChatBox
        socket={socketRef.current}
        messages={messages}
        setMessages={setMessages}
      />
      <Footer />
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
