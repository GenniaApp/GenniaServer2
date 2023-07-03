import { useMemo } from 'react';
import { useTileStateTypes, useTileStateValidation } from '@/hooks/index';

/**
 * useTileState
 *
 * @param {Array<Array>} tile - An implementation of column/rows
 *
 * tile Array<[type, playerId, unitiesCount]>
 *    type {enum}
 *      0: base
 *      1: spawner
 *      2: fog
 *      3: army
 *      4: blank
 *    isRevealed {boolean}
 *    playerId {number}
 *    unitiesCount {number}
 *
 * @returns {object}
 *    typeKey:      0 | 1 | 2 | 3 | 4
 *    typeValue:    "BASE" | "SPAWNER" | "FOG" | "ARMY" | "BLANK"
 *    typeImageUrl: "https://link.to/the-image"
 *    isRevealed:   {boolean}
 *    playerId:     {number}
 *    unitiesCount: {number}
 */
export default function useTileState(tile) {
  const { typesEnum } = useTileStateTypes();
  const { typeKey, isRevealed, playerId, unitiesCount } =
    useTileStateValidation(tile);

  const typeValue = useMemo(() => typesEnum[typeKey], [typesEnum, typeKey]);
  const typeImageUrl = useMemo(
    () =>
      // FOG: 'question-mark.png'
      ({
        BASE: '/img/crown.png',
        SPAWNER: '/img/city.png',
        FOG: '/img/mountain.png',
        BLANK: '/img/mountain.png',
      }[typeValue]),
    [typeValue]
  );

  const isOwned = useMemo(() => !!playerId, [playerId]);
  const isBaseType = useMemo(() => typeValue === 'BASE', [typeValue]);
  const isSpawnerType = useMemo(() => typeValue === 'SPAWNER', [typeValue]);
  const isFogType = useMemo(() => typeValue === 'FOG', [typeValue]);
  const isArmyType = useMemo(() => typeValue === 'ARMY', [typeValue]);
  const isBlankType = useMemo(() => typeValue === 'BLANK', [typeValue]);

  return {
    typeKey,
    typeValue,
    typeImageUrl,
    isRevealed,
    playerId,
    unitiesCount,
    isOwned,
    isBaseType,
    isSpawnerType,
    isFogType,
    isArmyType,
    isBlankType,
  };
}
