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

function Lobby() {
  const [rooms, setRooms] = useState<RoomPool>({});
  const [loading, setLoading] = useState(true);
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

  const handleRoomClick = (roomName: string) => {
    router.push(`/rooms/${roomName}`);
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
              sx={{ color: 'white' }}
              gutterBottom
            >
              {t('greet') + username}
            </Typography>
            <List className='menu-container' sx={{ width: '100%' }}>
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
                      bgcolor: serverStatus ? 'lime' : 'red',
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
            <TableContainer className='menu-container' component={Paper}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('room-id')}</TableCell>
                    <TableCell>{t('room-name')}</TableCell>
                    <TableCell>{t('game-speed')}</TableCell>
                    <TableCell>{t('players')}</TableCell>
                    <TableCell>{t('status')}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
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
                      <TableRow key={room.id}>
                        <TableCell
                          component='th'
                          scope='row'
                          onClick={() => handleRoomClick(room.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {room.id}
                        </TableCell>
                        <TableCell>{room.roomName}</TableCell>
                        <TableCell>{room.gameSpeed}</TableCell>
                        <TableCell>{`${room.players.length}/${room.maxPlayers}`}</TableCell>
                        <TableCell>
                          <Typography
                            variant='body2'
                            color={room.gameStarted ? 'yellow' : 'lime'}
                          >
                            {room.gameStarted ? t('started') : t('waiting')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='contained'
                            color='primary'
                            onClick={() => handleRoomClick(room.id)}
                          >
                            {t('join')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box marginTop={2}>
              <ButtonGroup sx={{ width: '100%' }}>
                <Button
                  variant='contained'
                  color='primary'
                  sx={{
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
                  sx={{
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
              </ButtonGroup>
            </Box>
          </Box>
        </div>
      </div>
    </>
  );
}

export default Lobby;
