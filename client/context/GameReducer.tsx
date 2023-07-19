import {
  Room,
  MapData,
  MapDiffData,
  MapQueueData,
  TileType,
  SnackState,
  GameRecordPerTurn,
} from '@/lib/types';

export const roomReducer = (state: Room, action: any) => {
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

interface MapDataAction {
  type: 'init' | 'update' | 'jump-to-turn';
  mapDiff?: MapDiffData;
  mapWidth?: number;
  mapHeight?: number;
  gameRecordTurns?: GameRecordPerTurn[];
  jumpToTurn?: number;
}

export const mapDataReducer = (
  state: MapData,
  action: MapDataAction
): MapData => {
  switch (action.type) {
    case 'init':
      if (!action.mapWidth || !action.mapHeight)
        throw Error('mapWidth or mapHeight is undefined');
      return Array.from(Array(action.mapWidth), () =>
        Array(action.mapHeight).fill([TileType.Fog, null, null])
      );
    case 'update': {
      const { mapDiff } = action;
      let mapWidth = state.length;
      let mapHeight = state[0].length;
      if (!mapDiff) throw Error('mapDiff is undefined');

      let flattened = state.flat();
      for (let i = 0, j = 0; i < mapDiff.length; i++) {
        let tmp = mapDiff[i]; // Ensure that the type inspection can be passed.
        if (typeof tmp === 'number') {
          j += tmp;
        } else {
          flattened[j++] = tmp;
        }
      }
      for (let i = 0; i < mapWidth; ++i) {
        for (let j = 0; j < mapHeight; ++j) {
          state[i][j] = flattened[i * mapHeight + j];
        }
      }
      return state;
    }
    case 'jump-to-turn': {
      const { gameRecordTurns, jumpToTurn } = action;
      let mapWidth = state.length;
      let mapHeight = state[0].length;
      if (!gameRecordTurns || jumpToTurn === undefined)
        throw Error('jump to turn action invalid');

      // init
      let tmp_state = Array.from(Array(mapWidth), () =>
        Array(mapHeight).fill([TileType.Fog, null, null])
      );

      let flattened = tmp_state.flat();
      for (let i = 0; i <= jumpToTurn; ++i) {
        let mapDiff = gameRecordTurns[i].data;

        for (let i = 0, j = 0; i < mapDiff.length; i++) {
          let tmp = mapDiff[i]; // Ensure that the type inspection can be passed.
          if (typeof tmp === 'number') {
            j += tmp;
          } else {
            flattened[j++] = tmp;
          }
        }
      }

      for (let i = 0; i < mapWidth; ++i) {
        for (let j = 0; j < mapHeight; ++j) {
          tmp_state[i][j] = flattened[i * mapHeight + j];
        }
      }

      return tmp_state;
    }
    default:
      throw Error('Unknown action: ' + action.type);
  }
};

export const mapQueueDataReducer = (state: MapQueueData, action: any) => {
  switch (action.type) {
    case 'init': // init mapQueueData with same size as mapData
      return Array.from(Array(action.mapWidth), () =>
        Array(action.mapHeight).fill({
          className: '',
          text: '',
        })
      );
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

export const snackStateReducer = (state: SnackState, action: any) => {
  switch (action.type) {
    case 'update':
      return action.payload;
    case 'toggle':
      return { ...state, open: !state.open };
    default:
      throw Error('Unknown action: ' + action.type);
  }
};
