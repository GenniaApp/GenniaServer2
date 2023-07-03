import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { turnsCountPropTypes } from './types';

function TurnsCount(props) {
  const { className, count, ...restProps } = props;

  return (
    <div {...restProps} className={classNames('TurnsCount', className)}>
      Turn {count}
    </div>
  );
}

TurnsCount.propTypes = {
  className: PropTypes.string,
  count: turnsCountPropTypes,
};

export default TurnsCount;
