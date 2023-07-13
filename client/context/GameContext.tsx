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
  Player,
  MapData,
  MapQueueData,
  LeaderBoardData,
  RoomUiStatus,
  PlayerPrivateInfo,
} from '@/lib/types';

interface SnackState {
  open: boolean;
  title: string;
  message: string;
}

interface GameContext {
  room: Room;
  socketRef: any;
  mapData: MapData;
  mapQueueData: MapQueueData | null;
  roomUiStatus: RoomUiStatus;
  myPlayerId: string;
  turnsCount: number;
  leaderBoardData: LeaderBoardData | null;
  dialogContent: [Player | null, string];
  openOverDialog: boolean;
  snackState: SnackState;
  attackQueueRef: any; // AttackQueue
  selectedMapTileInfo: SelectedMapTileInfo;
  playerPrivateInfo: PlayerPrivateInfo | null;
}

interface GameDispatch {
  roomDispatch: React.Dispatch<any>;
  mapDataDispatch: React.Dispatch<any>;
  mapQueueDataDispatch: React.Dispatch<any>;
  setRoomUiStatus: React.Dispatch<React.SetStateAction<RoomUiStatus>>;
  setMyPlayerId: React.Dispatch<React.SetStateAction<string>>;
  setTurnsCount: React.Dispatch<React.SetStateAction<number>>;
  setLeaderBoardData: React.Dispatch<any>;
  setDialogContent: React.Dispatch<
    React.SetStateAction<[Player | null, string]>
  >;
  setOpenOverDialog: React.Dispatch<React.SetStateAction<boolean>>;
  snackStateDispatch: React.Dispatch<any>;
  setSelectedMapTileInfo: React.Dispatch<
    React.SetStateAction<SelectedMapTileInfo>
  >;
  setPlayerPrivateInfo: React.Dispatch<any>;
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
    null
  );
  const socketRef = useRef<any>();
  const attackQueueRef = useRef<any>();
  const [roomUiStatus, setRoomUiStatus] = useState(RoomUiStatus.gameSetting);
  const [snackState, snackStateDispatch] = useReducer(snackStateReducer, {
    open: false,
    title: '',
    message: '',
  });
  const [myPlayerId, setMyPlayerId] = useState('');
  const [playerPrivateInfo, setPlayerPrivateInfo] =
    useState<PlayerPrivateInfo | null>(null);
  const [turnsCount, setTurnsCount] = useState(0);
  const [leaderBoardData, setLeaderBoardData] = useState(null);
  const [dialogContent, setDialogContent] = useState<[Player | null, string]>([
    null,
    '',
  ]);
  const [openOverDialog, setOpenOverDialog] = useState(false);
  const [selectedMapTileInfo, setSelectedMapTileInfo] =
    useState<SelectedMapTileInfo>({
      x: -1,
      y: -1,
      half: false,
      unitsCount: 0,
    });

  return (
    <GameContext.Provider
      value={{
        room,
        socketRef,
        mapData,
        mapQueueData,
        roomUiStatus,
        myPlayerId,
        turnsCount,
        leaderBoardData,
        dialogContent,
        openOverDialog,
        snackState,
        attackQueueRef,
        selectedMapTileInfo,
        playerPrivateInfo,
      }}
    >
      <GameDispatch.Provider
        value={{
          roomDispatch,
          mapDataDispatch,
          mapQueueDataDispatch,
          setRoomUiStatus,
          setMyPlayerId,
          setTurnsCount,
          setLeaderBoardData,
          setDialogContent,
          setOpenOverDialog,
          snackStateDispatch,
          setSelectedMapTileInfo,
          setPlayerPrivateInfo,
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

const roomReducer = (state: Room, action: any) => {
  switch (action.type) {
    case 'update':
      return action.payload;
    case 'update_roomName':
      return { ...state, roomName: action.payload };
    case 'update_players':
      return { ...state, players: action.payload };
    case 'update_property':
      return { ...state, [action.payload.property]: action.payload.value };
    default:
      throw Error('Unknown action: ' + action.type);
  }
};

const mapDataReducer = (state: MapData, action: any) => {
  switch (action.type) {
    case 'update':
      return action.payload;
    default:
      throw Error('Unknown action: ' + action.type);
  }
};

const mapQueueDataReducer = (state: MapQueueData, action: any) => {
  switch (action.type) {
    case 'init': // init mapQueueData with same size as mapData
      return Array.from(Array(action.width), () =>
        Array(action.height).fill({
          className: '',
          text: '',
        })
      );
    case 'update':
      return action.payload;
    case 'change': // change map[x][y]'s className, when className equal to '50%'
      state[action.x][action.y] = {
        className: action.className,
        text: action.text ? action.text : '',
      };
      return state;
    default:
      throw Error('Unknown action: ' + action.type);
  }
};

const snackStateReducer = (state: SnackState, action: any) => {
  switch (action.type) {
    case 'update':
      return action.payload;
    case 'toggle':
      return { ...state, open: !state.open };
    default:
      throw Error('Unknown action: ' + action.type);
  }
};

export { GameProvider, useGame, useGameDispatch };
