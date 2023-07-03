import React from 'react';
import MapTile from './MapTile';
import useMapTileState from '@/hooks/use-map-tile-state';
import { PlayerProp, TileProp, MapPosition } from './types-new';

interface MapTileStateProps {
  tile: TileProp;
  players: PlayerProp[];
  rowIndex: number;
  columnIndex: number;
  selectedMapPosition: MapPosition;
  onChangeSelectedMapPosition: (mapPosition: MapPosition) => void;
  possibleNextMapPositions: {
    top: MapPosition;
    right: MapPosition;
    bottom: MapPosition;
    left: MapPosition;
  };
}

function MapTileState(props: MapTileStateProps) {
  const {
    tile,
    players,
    rowIndex,
    columnIndex,
    selectedMapPosition,
    onChangeSelectedMapPosition: handleChangeSelectedMapPosition,
    possibleNextMapPositions,
    ...restProps
  } = props;

  const mapTileState = useMapTileState({
    players,
    tile,
    rowIndex,
    columnIndex,
    selectedMapPosition,
    onChangeSelectedMapPosition: handleChangeSelectedMapPosition,
    possibleNextMapPositions,
  });

  return (
    <MapTile
      {...restProps}
      {...mapTileState}
      rowIndex={rowIndex}
      columnIndex={columnIndex}
    />
  );
}

export default MapTileState;
