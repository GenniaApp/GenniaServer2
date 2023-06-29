import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";

export default function Player(props) {
  const { className, id, name, color, unitiesCount, landsCount, ...restProps } =
    props;

  return (
    <tr {...restProps} className={classNames("Player", className)}>
      <td className="Player__Name" style={{ backgroundColor: color }}>
        {name}
      </td>
      <td>{unitiesCount}</td>
      <td>{landsCount}</td>
    </tr>
  );
}

Player.propTypes = {
  className: PropTypes.string,
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  unitiesCount: PropTypes.number.isRequired,
  landsCount: PropTypes.number.isRequired,
};
