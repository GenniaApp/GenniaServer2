import React, { useMemo } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { playersPropTypes } from './types';
import PlayerState from './PlayerState';

export default function Players(props) {
  const { className, players, ...restProps } = props;
  const playerList = useMemo(() => {
    return Object.values(players);
  }, [players]);

  return (
    <table {...restProps} className={classNames('Players', className)}>
      <thead>
        <tr>
          <th>Player</th>
          <th>Army</th>
          <th>Land</th>
        </tr>
      </thead>
      <tbody>
        {playerList.map((player, index) => (
          <PlayerState key={index} player={player} />
        ))}
      </tbody>
    </table>
  );
}

Players.propTypes = {
  className: PropTypes.string,
  players: playersPropTypes,
};
