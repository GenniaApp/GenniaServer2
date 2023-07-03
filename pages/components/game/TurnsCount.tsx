import React from 'react';
import classNames from 'classnames';

interface TurnsCountProps {
  className?: string;
  count: number;
}

function TurnsCount(props: TurnsCountProps) {
  const { className, count, ...restProps } = props;

  return (
    <div {...restProps} className={classNames('TurnsCount', className)}>
      Turn {count}
    </div>
  );
}

export default TurnsCount;
