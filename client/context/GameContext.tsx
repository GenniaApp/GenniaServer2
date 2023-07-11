import React, {
  createContext,
  useReducer,
  useContext,
  useState,
  useRef,
} from 'react';
import {
  Room,
  Message,
  Player,
  MapDataProp,
  LeaderBoardData,
} from '@/lib/types';

interface SnackState {
  open: boolean;
  title: string;
  message: string;
}

interface GameContext {
  room: Room;
  socketRef: any;
  mapData: MapDataProp;
  myPlayerId: string;
  turnsCount: number;
  leaderBoardData: LeaderBoardData;
  dialogContent: [Player | null, string];
  openOverDialog: boolean;
  snackState: SnackState;
}

interface GameDispatch {
  roomDispatch: React.Dispatch<any>;
  mapDataDispatch: React.Dispatch<any>;
  setMyPlayerId: React.Dispatch<React.SetStateAction<string>>;
  setTurnsCount: React.Dispatch<React.SetStateAction<number>>;
  setLeaderBoardData: React.Dispatch<React.SetStateAction<LeaderBoardData>>;
  setDialogContent: React.Dispatch<
    React.SetStateAction<[Player | null, string]>
  >;
  setOpenOverDialog: React.Dispatch<React.SetStateAction<boolean>>;
  snackStateDispatch: React.Dispatch<any>;
}

const GameContext = createContext<GameContext | undefined>(undefined);
const GameDispatch = createContext<GameDispatch | undefined>(undefined);

interface GameProviderProp {
  children: React.ReactNode;
}

const GameProvider: React.FC<GameProviderProp> = ({ children }) => {
  const [room, roomDispatch] = useReducer(roomReducer, new Room(''));
  const [mapData, mapDataDispatch] = useReducer(mapDataReducer, [[]]);
  const socketRef = useRef<any>();
  const [snackState, snackStateDispatch] = useReducer(snackStateReducer, {
    open: false,
    title: '',
    message: '',
  });
  const [myPlayerId, setMyPlayerId] = useState('');
  const [turnsCount, setTurnsCount] = useState(0);
  const [leaderBoardData, setLeaderBoardData] = useState<LeaderBoardData>({});
  const [dialogContent, setDialogContent] = useState<[Player | null, string]>([
    null,
    '',
  ]);
  const [openOverDialog, setOpenOverDialog] = useState(false);

  return (
    <GameContext.Provider
      value={{
        room,
        socketRef,
        mapData,
        myPlayerId,
        turnsCount,
        leaderBoardData,
        dialogContent,
        openOverDialog,
        snackState,
      }}
    >
      <GameDispatch.Provider
        value={{
          roomDispatch,
          mapDataDispatch,
          setMyPlayerId,
          setTurnsCount,
          setLeaderBoardData,
          setDialogContent,
          setOpenOverDialog,
          snackStateDispatch,
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

const mapDataReducer = (state: MapDataProp, action: any) => {
  switch (action.type) {
    case 'update':
      return action.payload;
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
