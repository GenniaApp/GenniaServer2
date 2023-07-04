import { useCallback, useMemo } from 'react';
import { usePlayerState, useTileState } from '@/hooks/index';

export default function useMapTileState({
  players,
  tile,
  rowIndex,
  columnIndex,
  selectedMapPosition,
  onChangeSelectedMapPosition,
  possibleNextMapPositions,
  notRevealedFill = '#363636',
  notOwnedArmyFill = '#D7D7D7',
  notOwnedSpawnerFill = '#757575',
  blankFill = '#B3B3B3',
  selectedStroke = '#fff',
  revealedStroke = '#000',
}) {
  const tileState = useTileState(tile);
  const {
    isOwned,
    playerId,
    typeImageUrl,
    unitiesCount,
    isRevealed,
    isSpawnerType,
    isBlankType,
    isArmyType,
  } = tileState;

  const isNextPossibleMove = useMemo(() => {
    const isNextPossibleMapPosition = Object.values(
      possibleNextMapPositions
    ).some((maybeNextMapPosition) => {
      return (
        maybeNextMapPosition &&
        maybeNextMapPosition.rowIndex === rowIndex &&
        maybeNextMapPosition.columnIndex === columnIndex
      );
    });

    return isNextPossibleMapPosition && !isBlankType;
  }, [possibleNextMapPositions, rowIndex, columnIndex, isBlankType]);

  const player = useMemo(() => {
    if (isOwned) {
      return players[playerId];
    }
  }, [isOwned, players, playerId]);

  const { color: playerColor } = usePlayerState(player);
  const fill = useMemo(() => {
    if (isOwned) {
      return playerColor;
    }

    if (!isRevealed) {
      return notRevealedFill;
    }

    if (isArmyType) {
      return notOwnedArmyFill;
    }

    if (isSpawnerType) {
      return notOwnedSpawnerFill;
    }

    if (isBlankType) {
      return blankFill;
    }
    return '#363636'; // TODO
  }, [
    isOwned,
    playerColor,
    isRevealed,
    notRevealedFill,
    isArmyType,
    notOwnedArmyFill,
    isSpawnerType,
    notOwnedSpawnerFill,
    isBlankType,
    blankFill,
  ]);

  const isSelected = useMemo(() => {
    return (
      rowIndex === selectedMapPosition.rowIndex &&
      columnIndex === selectedMapPosition.columnIndex
    );
  }, [selectedMapPosition, rowIndex, columnIndex]);

  const stroke = useMemo(() => {
    if (isSelected) {
      return selectedStroke;
    }

    if (isRevealed) {
      return revealedStroke;
    }
  }, [isSelected, selectedStroke, isRevealed, revealedStroke]);

  const canMove = useMemo(() => {
    return isOwned || isNextPossibleMove;
  }, [isOwned, isNextPossibleMove]);

  const handleClick = useCallback(() => {
    if (canMove) {
      onChangeSelectedMapPosition({ rowIndex, columnIndex });
    }
  }, [canMove, rowIndex, columnIndex, onChangeSelectedMapPosition]);

  const isHighlight = isNextPossibleMove;

  return {
    image: typeImageUrl,
    text: unitiesCount,
    fill,
    stroke,
    canMove,
    onClick: handleClick,
    highlight: isHighlight,
  };
}
