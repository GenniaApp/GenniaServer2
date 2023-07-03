export interface MapPosition {
  rowIndex: number;
  columnIndex: number;
}

export type TileProp = (number | boolean)[];

export type TilesProp = TileProp[];

export type MapProp = TilesProp[];

// id, name, color, unitiesCount, landsCount
export type PlayerProp = [number, string, string, number, number];

export type PlayersProp = Record<string, PlayerProp>;
