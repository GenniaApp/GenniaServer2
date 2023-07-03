export interface MapPosition {
  rowIndex: number;
  columnIndex: number;
}

export type TileProp = (number | boolean)[];

export type TilesProp = TileProp[];

export type MapProp = TilesProp[];

export type PlayerProp = any[];

export type PlayersProp = Record<string, PlayerProp>;
