import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import { useTranslation } from 'next-i18next';
import ChatBox from '@/components/ChatBox';
import Swal from 'sweetalert2';

import {
  Room,
  Message,
  UserData,
  MapDiffData,
  LeaderBoardTable,
  Route,
  Position,
  RoomUiStatus,
  initGameInfo,
} from '@/lib/types';
import Game from '@/components/game/Game';
import { useGame, useGameDispatch } from '@/context/GameContext';
import GameSetting from '@/components/GameSetting';
import GameLoading from '@/components/GameLoading';

function GamingRoom() {
  const [messages, setMessages] = useState<Message[]>([]);

  const router = useRouter();
  const roomId = router.query.roomId as string;

  const { t } = useTranslation();

  const {
    room,
    roomUiStatus,
    socketRef,
    myPlayerId,
    attackQueueRef,
    myUserName,
  } = useGame();
  const {
    roomDispatch,
    mapDataDispatch,
    setRoomUiStatus,
    setMyPlayerId,
    setTurnsCount,
    setLeaderBoardData,
    setDialogContent,
    setOpenOverDialog,
    snackStateDispatch,
    mapQueueDataDispatch,
    setSelectedMapTileInfo,
    setInitGameInfo,
    setIsSurrendered,
    setSpectating,
    setMyUserName,
    setZoom,
  } = useGameDispatch();

  useEffect(() => {
    let tmp: string | null = localStorage.getItem('username');
    if (!tmp) {
      router.push('/');
    } else {
      setMyUserName(tmp);
      setMyPlayerId(localStorage.getItem('playerId') || '');
    }
  }, [setMyPlayerId, setMyUserName, router]);

  useEffect(() => {
    // Game Logic Init
    if (!roomId) return;
    if (!myUserName) return;
    class AttackQueue {
      public items: Route[];
      public lastItem: Route | undefined;

      constructor() {
        this.items = new Array<Route>();
        this.lastItem = undefined;
      }

      insert(item: Route): void {
        console.log('Item queued: ', item.to.x, item.to.y);
        this.items.push(item);
      }

      clearFromMap(route: Route): void {
        mapQueueDataDispatch({
          type: 'change',
          x: route.from.x,
          y: route.from.y,
          className: '',
        });
      }

      pop(): Route | undefined {
        let item = this.items.shift();
        if (this.lastItem) {
          this.clearFromMap(this.lastItem);
          this.lastItem = undefined;
        }
        this.lastItem = item;
        return item;
      }

      pop_back(): Route | undefined {
        let item = this.items.pop();
        if (item) {
          this.clearFromMap(item);
          return item;
        }
      }

      front(): Route {
        return this.items[0];
      }

      end(): Route {
        return this.items[this.items.length - 1];
      }

      isEmpty(): boolean {
        return this.items.length == 0;
      }

      size(): number {
        return this.items.length;
      }

      clear(): void {
        this.items.forEach((item) => {
          this.clearFromMap(item);
        });
        this.items.length = 0;
        this.clearLastItem();
      }

      clearLastItem(): void {
        if (this.lastItem) {
          this.clearFromMap(this.lastItem);
          this.lastItem = undefined;
        }
      }
    }

    attackQueueRef.current = new AttackQueue();

    // myPlayerId could be null for first connect
    socketRef.current = io(process.env.NEXT_PUBLIC_SERVER_API, {
      query: { roomId: roomId, username: myUserName, myPlayerId: myPlayerId },
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
    socket.on('game_started', (initGameInfo: initGameInfo) => {
      console.log('Game started:', initGameInfo);
      setInitGameInfo(initGameInfo);
      setIsSurrendered(false);
      if (initGameInfo.mapHeight > 40 || initGameInfo.mapHeight > 40) {
        setZoom(0.5);
      } else if (initGameInfo.mapHeight > 25 || initGameInfo.mapHeight > 25) {
        setZoom(0.75);
      }

      setSelectedMapTileInfo({
        x: initGameInfo.king.x,
        y: initGameInfo.king.y,
        half: false,
        unitsCount: 0,
      });

      mapDataDispatch({
        type: 'init',
        mapWidth: initGameInfo.mapWidth,
        mapHeight: initGameInfo.mapHeight,
      });

      mapQueueDataDispatch({
        type: 'init',
        mapWidth: initGameInfo.mapWidth,
        mapHeight: initGameInfo.mapHeight,
      });
    });
    socket.on('update_room', (room: Room) => {
      console.log('update_room');
      console.log(room);
      // if my player id  equal to room's one of player ,setSpectating from room player
      if (myPlayerId && room.players) {
        let player = room.players.find((player) => player.id === myPlayerId);
        if (player) {
          setSpectating(player.spectating);
        }
      }
      roomDispatch({ type: 'update', payload: room });
    });

    socket.on('error', (title: string, message: string) => {
      snackStateDispatch({
        type: 'update',
        title: title,
        message: message,
      });
    });

    socket.on('room_message', (player: UserData, content: string) => {
      console.log(`room_message: ${player.username} ${content}`);
      setMessages((messages) => [...messages, new Message(player, content)]);
    });
    socket.on('captured', (player1: UserData, player2: UserData) => {
      setMessages((messages) => [
        ...messages,
        new Message(player1, t('captured'), player2),
      ]);
    });
    socket.on('host_modification', (player1: UserData, player2: UserData) => {
      setMessages((messages) => [
        ...messages,
        new Message(player1, t('transfer-host-to'), player2),
      ]);
    });
    socket.on('game_over', (capturedBy: UserData) => {
      console.log(`game_over: ${capturedBy.username}`);
      setOpenOverDialog(true);
      setRoomUiStatus(RoomUiStatus.gameOverConfirm);
      setDialogContent([capturedBy, 'game_over', null]);
    });
    socket.on('game_ended', (winner: UserData, replayLink: string) => {
      console.log(`game_ended: ${winner.username} ${replayLink}`);
      setDialogContent([winner, 'game_ended', replayLink]);
      setOpenOverDialog(true);
      setRoomUiStatus(RoomUiStatus.gameOverConfirm);
    });

    socket.on(
      'game_update',
      (
        mapDiff: MapDiffData,
        turnsCount: number,
        leaderBoardData: LeaderBoardTable
      ) => {
        console.log(`game_update: ${turnsCount}`);
        setRoomUiStatus(RoomUiStatus.gameRealStarted);
        mapDataDispatch({ type: 'update', mapDiff });
        setTurnsCount(turnsCount);
        setLeaderBoardData(leaderBoardData);

        if (!attackQueueRef.current.isEmpty()) {
          let item = attackQueueRef.current.pop();
          socket.emit('attack', item.from, item.to, item.half);
          console.log('emit attack: ', item.from, item.to, item.half);
        } else if (attackQueueRef.current.lastItem) {
          attackQueueRef.current.clearLastItem();
        }
      }
    );

    socket.on(
      'attack_failure',
      (from: Position, to: Position, message: string) => {
        // console.log('attack_failure: ', from, to, message);
        attackQueueRef.current.clearLastItem();
        while (!attackQueueRef.current.isEmpty()) {
          let point = attackQueueRef.current.front().from;
          if (point.x === to.x && point.y === to.y) {
            attackQueueRef.current.pop();
            to = point;
          } else {
            break;
          }
        }
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
        router.push(`/`);
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
        router.push(`/`);
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server.');

      snackStateDispatch({
        type: 'update',
        title: 'Reconnecting...',
        message: 'Disconnected from the server',
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
      //   router.push(`/`);
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
      socketRef.current.disconnect();
    };
  }, [roomId, myUserName]);

  useEffect(() => {
    if (room.gameStarted && roomUiStatus === RoomUiStatus.gameSetting) {
      setRoomUiStatus(RoomUiStatus.loading);
    }
  }, [room, roomUiStatus, setRoomUiStatus]);

  return (
    <div className='app-container'>
      {roomUiStatus === RoomUiStatus.gameSetting && (
        <div className='center-layout'>
          <GameSetting />
        </div>
      )}
      {roomUiStatus === RoomUiStatus.loading && (
        <div className='center-layout'>
          <GameLoading />
        </div>
      )}
      {(roomUiStatus === RoomUiStatus.gameRealStarted ||
        roomUiStatus === RoomUiStatus.gameOverConfirm) && <Game />}
      <ChatBox socket={socketRef.current} messages={messages} />
    </div>
  );
}

export default GamingRoom;
