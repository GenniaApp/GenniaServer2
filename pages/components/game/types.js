import PropTypes from "prop-types";

const turnsCountPropTypes = PropTypes.number;
const playerPropTypes = PropTypes.arrayOf(PropTypes.any);
const playersPropTypes = PropTypes.object;
const tilePropTypes = PropTypes.arrayOf(
  PropTypes.oneOfType([PropTypes.number, PropTypes.bool])
);
const tilesPropTypes = PropTypes.arrayOf(tilePropTypes);
const mapPropTypes = PropTypes.arrayOf(tilesPropTypes);
const mapPositionPropTypes = PropTypes.shape({
  rowIndex: PropTypes.number,
  columnIndex: PropTypes.number,
});

export {
  turnsCountPropTypes,
  playerPropTypes,
  playersPropTypes,
  tilePropTypes,
  tilesPropTypes,
  mapPropTypes,
  mapPositionPropTypes,
};
