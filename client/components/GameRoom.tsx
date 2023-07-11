import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import { useTranslation } from 'next-i18next';
import ChatBox from '@/components/ChatBox';
import Swal from 'sweetalert2';

import { Room, Message, Player, MapData, LeaderBoardData } from '@/lib/types';
import Game from '@/components/game/Game';
import { GameProvider, useGame, useGameDispatch } from '@/context/GameContext';
import GameSetting from '@/components/GameSetting';
import GameLoading from '@/components/GameLoading';

function GamingRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const roomId = router.query.roomId as string;

  const { t } = useTranslation();

  const { room, socketRef, mapData, myPlayerId } = useGame();
  const {
    roomDispatch,
    mapDataDispatch,
    setMyPlayerId,
    setTurnsCount,
    setLeaderBoardData,
    setDialogContent,
    setOpenOverDialog,
    snackStateDispatch,
  } = useGameDispatch();

  useEffect(() => {
    setUsername(localStorage.getItem('username') || t('anonymous'));
    setMyPlayerId(localStorage.getItem('playerId') || '');
  }, []);

  const navToHome = () => {
    router.push(`/`);
  };

  const updateRoomInfo = (room: Room) => {
    console.log('update_room');
    console.log(room);
    roomDispatch({ type: 'update', payload: room });
  };

  useEffect(() => {
    if (!roomId) return;
    if (!username) return;
    // myPlayerId could be null for first connect
    socketRef.current = io('localhost:3001', {
      query: { roomId: roomId, username: username, myPlayerId: myPlayerId },
    });
    let socket = socketRef.current;
    socket.emit('get_room_info');

    // set up socket event listeners
    socket.on('connect', () => {
      console.log(`socket client connect to server: ${socket.id}`);
    });
    // get player id when first connect
    socket.on('set_player_id', (playerId: string) => {
      console.log(`set_player_id: ${playerId}`);
      setMyPlayerId(playerId);
      localStorage.setItem('playerId', playerId);
    });
    socket.on('update_room', updateRoomInfo);

    socket.on('error', (title: string, message: string) => {
      snackStateDispatch({
        type: 'update',
        payload: {
          open: true,
          title: title,
          message: message,
        },
      });
    });

    socket.on('room_message', (player: Player, content: string) => {
      console.log(`room_message: ${content}`);
      setMessages((messages) => [...messages, new Message(player, content)]);
    });
    socket.on('game_over', (capturedBy: Player) => {
      console.log(`game_over: ${capturedBy.username}`);
      setOpenOverDialog(true);
      setDialogContent([capturedBy, 'game_over']);
    });
    socket.on('game_ended', (winner: Player) => {
      console.log(`game_ended: ${winner.username}`);
      setDialogContent([winner, 'game_ended']);
      setOpenOverDialog(true);
    });

    socket.on(
      'game_update',
      (
        mapData: MapData,
        turnsCount: number,
        leaderBoardData: LeaderBoardData
      ) => {
        setLoading(false);
        mapDataDispatch({ type: 'update', payload: mapData });
        setTurnsCount(turnsCount);
        setLeaderBoardData(leaderBoardData);
      }
    );

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
      console.log('Disconnected from server.');

      snackStateDispatch({
        type: 'update',
        payload: {
          open: true,
          title: 'Reconnecting...',
          message: 'Disconnected from the server',
        },
      });
      // Swal.fire({
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
    });

    socket.on('reconnect', () => {
      console.log('Reconnected to server.');
      if (room.gameStarted && myPlayerId) {
        socket.emit('reconnect', myPlayerId);
      } else {
        socket.emit('get_room_info');
      }
    });

    return () => {
      console.log('use effect leave room');
      socketRef.current.disconnect();
    };
  }, [roomId, username]);

  return (
    <div>
      {!room.gameStarted && <GameSetting />}
      {room.gameStarted && loading && <GameLoading />}
      {room.gameStarted && !loading && <Game />}
      <ChatBox
        socket={socketRef.current}
        messages={messages}
        setMessages={setMessages}
      />
    </div>
  );
}

export default GamingRoom;
