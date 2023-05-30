import { usePlayerStateValidation } from "@/hooks/index";

/**
 * usePlayerState
 *
 * @param {Array<Array>} player
 *
 * player Array<[id, name, color, unitiesCount, landsCount]>
 *    id {number}
 *    name {string}
 *    color {string}
 *    unitiesCount {number}
 *    landsCount {number}
 *
 * @returns {object}
 *    id:           {number}
 *    name:         {string}
 *    color:        {string}
 *    unitiesCount: {number}
 *    landsCount:   {number}
 */
export default function usePlayerState(player) {
  const { id, name, color, unitiesCount, landsCount } =
    usePlayerStateValidation(player);

  return {
    id,
    name,
    color,
    unitiesCount,
    landsCount,
  };
}
