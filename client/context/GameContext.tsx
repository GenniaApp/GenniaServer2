import React, {
  createContext,
  useReducer,
  useContext,
  useState,
  useRef,
} from 'react';
import {
  Room,
  SelectedMapTileInfo,
  MapData,
  MapDiffData,
  MapQueueData,
  LeaderBoardTable,
  RoomUiStatus,
  initGameInfo,
  TileType,
  UserData,
  SnackState,
} from '@/lib/types';

import {
  roomReducer,
  mapDataReducer,
  mapQueueDataReducer,
  snackStateReducer,
} from './GameReducer';

// userData, game_status, replay_link
type DialogContentData = [UserData | null, string, string | null];

interface GameContext {
  room: Room;
  socketRef: any;
  mapData: MapData;
  mapQueueData: MapQueueData;
  roomUiStatus: RoomUiStatus;
  myPlayerId: string;
  myUserName: string;
  isSurrendered: boolean;
  spectating: boolean;
  turnsCount: number;
  leaderBoardData: LeaderBoardTable | null;
  dialogContent: DialogContentData;
  openOverDialog: boolean;
  snackState: SnackState;
  attackQueueRef: any; // AttackQueue
  selectedMapTileInfo: SelectedMapTileInfo;
  initGameInfo: initGameInfo | null;
  zoom: number;
}

interface GameDispatch {
  roomDispatch: React.Dispatch<any>;
  mapDataDispatch: React.Dispatch<any>;
  mapQueueDataDispatch: React.Dispatch<any>;
  setRoomUiStatus: React.Dispatch<React.SetStateAction<RoomUiStatus>>;
  setMyPlayerId: React.Dispatch<React.SetStateAction<string>>;
  setMyUserName: React.Dispatch<React.SetStateAction<string>>;
  setIsSurrendered: React.Dispatch<React.SetStateAction<boolean>>;
  setSpectating: React.Dispatch<React.SetStateAction<boolean>>;
  setTurnsCount: React.Dispatch<React.SetStateAction<number>>;
  setLeaderBoardData: React.Dispatch<any>;
  setDialogContent: React.Dispatch<React.SetStateAction<DialogContentData>>;
  setOpenOverDialog: React.Dispatch<React.SetStateAction<boolean>>;
  snackStateDispatch: React.Dispatch<any>;
  setSelectedMapTileInfo: React.Dispatch<
    React.SetStateAction<SelectedMapTileInfo>
  >;
  setInitGameInfo: React.Dispatch<any>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
}

const GameContext = createContext<GameContext | undefined>(undefined);
const GameDispatch = createContext<GameDispatch | undefined>(undefined);

interface GameProviderProp {
  children: React.ReactNode;
}

const GameProvider: React.FC<GameProviderProp> = ({ children }) => {
  const [room, roomDispatch] = useReducer(roomReducer, new Room(''));
  const [mapData, mapDataDispatch] = useReducer(mapDataReducer, [[]]);
  const [mapQueueData, mapQueueDataDispatch] = useReducer(
    mapQueueDataReducer,
    []
  );
  const socketRef = useRef<any>();
  const attackQueueRef = useRef<any>();
  const [roomUiStatus, setRoomUiStatus] = useState(RoomUiStatus.gameSetting);
  const [snackState, snackStateDispatch] = useReducer(snackStateReducer, {
    open: false,
    title: '',
    message: '',
    status: 'error',
    duration: 3000,
  });
  const [myPlayerId, setMyPlayerId] = useState('');
  const [myUserName, setMyUserName] = useState('');
  const [isSurrendered, setIsSurrendered] = useState<boolean>(false);
  const [spectating, setSpectating] = useState<boolean>(false);
  const [initGameInfo, setInitGameInfo] = useState<initGameInfo | null>(null);
  const [turnsCount, setTurnsCount] = useState(0);
  const [leaderBoardData, setLeaderBoardData] = useState(null);
  const [dialogContent, setDialogContent] = useState<DialogContentData>([
    null,
    '',
    null,
  ]);
  const [openOverDialog, setOpenOverDialog] = useState(false);
  const [selectedMapTileInfo, setSelectedMapTileInfo] =
    useState<SelectedMapTileInfo>({
      x: -1,
      y: -1,
      half: false,
      unitsCount: 0,
    });
  const [zoom, setZoom] = useState(1);

  return (
    <GameContext.Provider
      value={{
        room,
        socketRef,
        mapData,
        mapQueueData,
        roomUiStatus,
        myPlayerId,
        myUserName,
        isSurrendered,
        spectating,
        turnsCount,
        leaderBoardData,
        dialogContent,
        openOverDialog,
        snackState,
        attackQueueRef,
        selectedMapTileInfo,
        initGameInfo,
        zoom,
      }}
    >
      <GameDispatch.Provider
        value={{
          roomDispatch,
          mapDataDispatch,
          mapQueueDataDispatch,
          setRoomUiStatus,
          setMyPlayerId,
          setMyUserName,
          setIsSurrendered,
          setSpectating,
          setTurnsCount,
          setLeaderBoardData,
          setDialogContent,
          setOpenOverDialog,
          snackStateDispatch,
          setSelectedMapTileInfo,
          setInitGameInfo,
          setZoom,
        }}
      >
        {children}
      </GameDispatch.Provider>
    </GameContext.Provider>
  );
};

const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

const useGameDispatch = () => {
  const context = useContext(GameDispatch);
  if (context === undefined) {
    throw new Error('useGameDispatch must be used within a GameProvider');
  }
  return context;
};

export { GameProvider, useGame, useGameDispatch };
