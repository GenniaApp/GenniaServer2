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
  CircularProgress,
} from '@mui/material';
import { RoomInfo } from '@/lib/types';
import { useTranslation } from 'next-i18next';

function generateRandomString(length: number) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
}

function Lobby() {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { t } = useTranslation();

  useEffect(() => {
    const fetchRooms = async () => {
      // setLoading(true);
      const res = await fetch('/api/rooms');
      const rooms = await res.json();
      console.log(rooms);
      setRooms(rooms.room_info);
      setLoading(false);
    };
    fetchRooms();
    let fetchInterval = setInterval(fetchRooms, 2000);
    return () => {
      clearInterval(fetchInterval);
    };
  }, []);

  const handleRoomClick = (roomId: string) => {
    router.push(`/rooms/${roomId}`);
  };

  const handleCreateRoomClick = async () => {
    let success = false;
    for (let i = 0; i < 3; i++) {
      let random_roomid = generateRandomString(7);
      const res = await fetch(`/api/rooms/${random_roomid}`); // TODO
      if (res.status === 404) {
        success = true;
        router.push(`/rooms/${random_roomid}`);
        break;
      }
    }
    if (!success) {
      alert('Failed to create room. Please try again later.');
    }
  };

  return (
    <Box
      className='bg-container'
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      sx={{
        width: {
          xs: '90vw',
          md: '50vw',
        },
      }}
    >
      <Typography
        variant='h4'
        component='h1'
        sx={{ color: 'white' }}
        gutterBottom
      >
        {t('lobby')}
      </Typography>
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
            ) : rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  No rooms available
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell
                    component='th'
                    scope='row'
                    onClick={() => handleRoomClick(room.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {room.id}
                  </TableCell>
                  <TableCell>{room.roomId}</TableCell>
                  <TableCell>{room.gameSpeed}</TableCell>
                  <TableCell>{`${room.players}/${room.maxPlayers}`}</TableCell>
                  <TableCell>
                    <Typography
                      variant='body2'
                      color={room.gameStarted ? 'error' : 'success'}
                    >
                      {room.gameStarted ? 'Started' : 'Waiting'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={() => handleRoomClick(room.roomId)}
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
        <Button
          variant='contained'
          color='primary'
          onClick={handleCreateRoomClick}
        >
          {t('create-room')}
        </Button>
      </Box>
    </Box>
  );
}

export default Lobby;
