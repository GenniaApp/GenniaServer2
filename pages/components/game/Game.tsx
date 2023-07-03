import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import SurrenderDialog from './SurrenderDialog';
import TurnsCount from './TurnsCount';
import Map from './Map';
import Players from './Players';
import OverDialog from './OverDialog';

interface TurnsCountProps {
  count: number;
}

interface Player {
  id: string;
  name: string;
  color: string;
}

interface PlayersProps {
  players: Player[];
}

type Tile = (number | boolean)[];

interface MapProps {
  map: Tile[];
  selectedTile?: {
    rowIndex: number;
    columnIndex: number;
  };
  onTileClick?: (rowIndex: number, columnIndex: number) => void;
}

interface GameProps {
  className?: string;
  turnsCount: TurnsCountProps['count'];
  map: MapProps['map'];
  players: PlayersProps['players'];
  roomId: string;
}

function Game(props: GameProps) {
  const { className, turnsCount, map, players, roomId, ...restProps } = props;
  const [didOver, setDidOver] = useState(false);
  const [didWin, setDidWin] = useState(false);
  const handleOverDialogClose = useCallback(() => {
    // TODO
    setDidOver(false);
  }, []);

  const handleSurrender = useCallback(() => {
    // TODO emit surrender event
    setDidWin(false);
    setDidOver(true);
  }, []);

  return (
    <div {...restProps} className={classNames('Game', className)}>
      <TurnsCount className='Game__TurnsCount' count={turnsCount} />
      <Map className='Game__Map' map={map} players={players} />
      <Players className='Game__Players' players={players} />
      <SurrenderDialog onSurrender={handleSurrender} />
      <OverDialog
        open={didOver}
        didWin={didWin}
        onClose={handleOverDialogClose}
        roomId={roomId}
      />
    </div>
  );
}

export default Game;
