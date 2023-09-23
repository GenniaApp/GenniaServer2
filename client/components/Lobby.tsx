import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  ButtonGroup,
  CircularProgress,
} from '@mui/material';
import { Room, RoomPool } from '@/lib/types';
import { useTranslation } from 'next-i18next';
import StorageIcon from '@mui/icons-material/Storage';
import { AddHomeOutlined, MapOutlined } from '@mui/icons-material';

function Lobby() {
  const [rooms, setRooms] = useState<RoomPool>({});
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [username, setUsername] = useState('');
  const [serverStatus, setServerStatus] = useState(true);
  const router = useRouter();

  const { t } = useTranslation();

  useEffect(() => {
    console.log('fetching rooms from: ', process.env.NEXT_PUBLIC_SERVER_API);
    const fetchRooms = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_API}/get_rooms`
        );

        const rooms = await res.json();
        setRooms(rooms);
        setLoading(false);
        setServerStatus(true);
      } catch (err: any) {
        setLoading(false);
        setSnackOpen(true);
        setSnackMessage(err.message);
        setServerStatus(false);
      }
    };
    fetchRooms();
    let fetchInterval = setInterval(fetchRooms, 2000);
    return () => {
      clearInterval(fetchInterval);
    };
  }, []);

  useEffect(() => {
    let tmp: string | null = localStorage.getItem('username');
    if (!tmp) {
      router.push('/');
    } else {
      setUsername(tmp);
    }
  }, [setUsername, router]);

  const handleRoomClick = async (roomName: string) => {
    setJoinLoading(true);
    await router.push(`/rooms/${roomName}`);
  };

  const handleCreateRoomClick = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API}/create_room`
      );
      let data = await res.json();
      if (res.status === 200) {
        router.push(`/rooms/${data.roomId}`);
      } else {
        setSnackOpen(true);
        setSnackMessage(data.message);
        setServerStatus(true);
      }
    } catch (err: any) {
      setSnackOpen(true);
      setSnackMessage(err.message);
      setServerStatus(false);
    }
  };

  return (
    <>
      <Snackbar
        open={snackOpen}
        autoHideDuration={1000}
        onClose={() => {
          setSnackOpen(!snackOpen);
        }}
      >
        <Alert severity='error' sx={{ width: '100%' }}>
          {snackMessage}
        </Alert>
      </Snackbar>
      <div className='app-container'>
        <div className='center-layout'>
          <Box
            sx={{
              width: {
                xs: '90vw',
                md: '55vw',
                lg: '45vw',
              },
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant='h4'
              component='h1'
              color='primary'
              fontWeight='bold'
              gutterBottom
              sx={{ padding: '20px' }}
            >
              {t('greet') + username}
            </Typography>
            <List className='menu-container' sx={{ width: '100%', boxShadow: 1 }}>
              <ListItem>
                <ListItemIcon>
                  <StorageIcon />
                </ListItemIcon>
                <ListItemText
                  id='gennia-server'
                  primary={t('gserver')}
                  secondary={process.env.NEXT_PUBLIC_SERVER_API}
                />
                <Box sx={{ position: 'relative', right: 0 }}>
                  <Box
                    component='span'
                    sx={{
                      bgcolor: serverStatus ? 'green' : 'red',
                      width: '0.7em',
                      height: '0.7em',
                      borderRadius: '50%',
                      display: 'inline-block',
                      marginRight: 1,
                    }}
                  />
                  <Typography fontSize='0.9rem' sx={{ display: 'inline' }}>
                    {serverStatus ? t('online') : t('offline')}
                  </Typography>
                </Box>
              </ListItem>
            </List>
            <TableContainer
              className='menu-container'
              component={Paper}
              sx={{
                maxHeight: '50vh'
              }}
            >
              <Table
                size='medium'
                sx={{
                  '& .MuiTableCell-root': {
                    fontSize: '1rem',
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    {/* <TableCell></TableCell> */}
                    {/* <TableCell>{t('room-id')}</TableCell> */}
                    <TableCell>{t('room-name')}</TableCell>
                    <TableCell align='center'>{t('game-speed')}</TableCell>
                    <TableCell align='center'>{t('players')}</TableCell>
                    <TableCell align='center'>{t('status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {joinLoading && (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        <Typography variant='h6'>
                          {t('joining-room')}
                        </Typography>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  )}
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : Object.keys(rooms).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        {t('no-rooms-available')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    Object.values(rooms).map((room: Room) => (
                      <TableRow
                        hover
                        key={room.id}
                        onClick={() => handleRoomClick(room.id)}
                        sx={{
                          cursor: 'pointer',
                        }}
                      >
                        <TableCell
                          sx={{
                            whiteSpace: 'nowrap',
                            maxWidth: '20vw',
                            overflowX: 'hidden',
                          }}
                        >
                          {room.roomName}
                        </TableCell>
                        <TableCell align='center'>{room.gameSpeed}</TableCell>
                        <TableCell align='center'>{`${room.players.length}/${room.maxPlayers}`}</TableCell>
                        <TableCell align='center'>
                          <Typography
                            variant='body2'
                            color={room.gameStarted ? 'yellow' : 'green'}
                          >
                            {room.gameStarted ? t('started') : t('waiting')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddHomeOutlined />}
              sx={{
                marginTop: 2,
                width: '100%',
                height: '60px',
                fontSize: '20px',
                whiteSpace: 'nowrap',
              }}
              onClick={handleCreateRoomClick}
            >
              {t('create-room')}
            </Button>
            <Button
              variant='contained'
              color='secondary'
              startIcon={<MapOutlined />}
              sx={{
                marginTop: 2,
                width: '100%',
                height: '60px',
                fontSize: '20px',
                whiteSpace: 'nowrap',
              }}
              onClick={() => {
                router.push('/mapcreator');
              }}
            >
              {t('create-map')}
            </Button>
          </Box>
        </div>
      </div>
    </>
  );
}

export default Lobby;
