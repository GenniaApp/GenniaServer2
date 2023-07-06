import { useMemo } from 'react';
import { useIsValidPositiveInteger } from '@/hooks/index';

export default function usePlayerStateValidation(player) {
  const isStateDefined = useMemo(
    () => player !== null && player !== undefined,
    [player]
  );

  const isValidState = useMemo(() => Array.isArray(player), [player]);

  if (isStateDefined && !isValidState) {
    throw new Error('State must be an array');
  }

  const [id, name, color, unitiesCount, landsCount] = player || [];

  const isValidId = useMemo(() => {
    const isInteger = Number.isInteger(id);

    return isInteger;
  }, [id]);

  if (isStateDefined && !isValidId) {
    throw new Error('Player ID is not valid');
  }

  const isValidName = useMemo(() => {
    const isString = typeof name === 'string';
    const isNotEmpty = isString && name.length > 0;

    return isString && isNotEmpty;
  }, [name]);

  if (isStateDefined && !isValidName) {
    throw new Error('Player name is not valid');
  }

  const isValidColor = useIsValidPositiveInteger(color);

  if (isStateDefined && !isValidColor) {
    throw new Error('Player color is not valid');
  }

  const isValidUnitiesCount = useIsValidPositiveInteger(unitiesCount);

  if (isStateDefined && !isValidUnitiesCount) {
    throw new Error('Unities count is not valid');
  }

  const isValidLandsCount = useIsValidPositiveInteger(landsCount);

  if (isStateDefined && !isValidLandsCount) {
    throw new Error('Lands count is not valid');
  }

  return { id, name, color, unitiesCount, landsCount };
}
