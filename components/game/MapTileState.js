import React from "react";
import PropTypes from "prop-types";
import MapTile from "./MapTile";
import { useMapTileState } from "@/hooks/index";
import { playersPropTypes, tilePropTypes, mapPositionPropTypes } from "./types";

function MapTileState(props) {
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

MapTileState.propTypes = {
  tile: tilePropTypes,
  players: playersPropTypes,
  rowIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  selectedMapPosition: mapPositionPropTypes.isRequired,
  onChangeSelectedMapPosition: PropTypes.func.isRequired,
  possibleNextMapPositions: PropTypes.shape({
    top: mapPositionPropTypes,
    right: mapPositionPropTypes,
    bottom: mapPositionPropTypes,
    left: mapPositionPropTypes,
  }).isRequired,
};

export default MapTileState;
