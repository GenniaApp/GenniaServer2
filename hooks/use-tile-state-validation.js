import { useMemo } from 'react';
import { useIsValidPositiveInteger, useTileStateTypes } from '@/hooks/index';

export default function useTileStateValidation(tile) {
  const { typeKeys } = useTileStateTypes();
  const isStateNotAnArray = useMemo(() => !Array.isArray(tile), [tile]);

  if (isStateNotAnArray) {
    throw new Error('State must be an array');
  }

  const [typeKey, isRevealed, playerId, unitiesCount] = tile;

  const isValidTypeKey = useMemo(
    () =>
      Number.isInteger(typeKey) && typeKey >= 0 && typeKey < typeKeys.length,
    [typeKey, typeKeys]
  );

  if (!isValidTypeKey) {
    throw new Error('Type is not valid');
  }

  if (typeof isRevealed !== 'boolean') {
    throw new Error('Revealed is not valid');
  }

  const isPlayerIdPositiveInteger = useIsValidPositiveInteger(playerId);
  const isValidPlayerId = useMemo(() => {
    const isNull = playerId === null;

    return isNull || isPlayerIdPositiveInteger;
  }, [playerId, isPlayerIdPositiveInteger]);

  if (!isValidPlayerId) {
    throw new Error('Player ID is not valid');
  }

  const isValidUnitiesCount = useIsValidPositiveInteger(unitiesCount);

  if (!isValidUnitiesCount) {
    throw new Error('Unities count is not valid');
  }

  return { typeKey, isRevealed, playerId, unitiesCount };
}
