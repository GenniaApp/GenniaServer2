import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Group, Rect, Text, Image } from "react-konva";

function MapTile(props) {
  const {
    zoom,
    imageZoom,
    size,
    fill,
    stroke,
    fontSize,
    image,
    text,
    rowIndex,
    columnIndex,
    onChangeSize: triggerChangeSize,
    highlight: isHighlight,
    ...restProps
  } = props;

  const zoomedSize = useMemo(() => size * zoom, [size, zoom]);
  const widthAndHeight = useMemo(
    () => ({
      width: zoomedSize,
      height: zoomedSize,
    }),
    [zoomedSize]
  );

  const zoomedFontSize = useMemo(() => fontSize * zoom, [fontSize, zoom]);
  const tileX = useMemo(
    () => zoomedSize * columnIndex,
    [zoomedSize, columnIndex]
  );

  const tileY = useMemo(() => zoomedSize * rowIndex, [zoomedSize, rowIndex]);

  useEffect(() => {
    if (triggerChangeSize) {
      triggerChangeSize(zoomedSize);
    }
  }, [triggerChangeSize, zoomedSize]);

  const zoomedImageSize = useMemo(
    () => zoomedSize * imageZoom,
    [zoomedSize, imageZoom]
  );

  const widthAndHeightOfImage = useMemo(
    () => ({
      width: zoomedImageSize,
      height: zoomedImageSize,
    }),
    [zoomedImageSize]
  );

  const imageXY = useMemo(
    () => ((zoomedSize - zoomedImageSize) / 2) * -1,
    [zoomedSize, zoomedImageSize]
  );

  return (
    <Group {...restProps} x={tileX} y={tileY} {...widthAndHeight}>
      <Rect fill={fill} stroke={stroke} {...widthAndHeight} />
      {image && (
        <Image
          image={image}
          {...widthAndHeightOfImage}
          offset={{ x: imageXY, y: imageXY }}
          opacity={0.8}
        />
      )}
      {text && (
        <Text
          text={text}
          align="center"
          verticalAlign="middle"
          fill="#fff"
          shadowColor="#000"
          shadowBlur={2}
          shadowOpacity={0.85}
          fontSize={zoomedFontSize}
          {...widthAndHeight}
        />
      )}
      {isHighlight && <Rect fill="#000" {...widthAndHeight} opacity={0.5} />}
    </Group>
  );
}

const image_type = typeof window !== "undefined" ? window.Image : null;

MapTile.propTypes = {
  zoom: PropTypes.number,
  imageZoom: PropTypes.number,
  size: PropTypes.number,
  fill: PropTypes.string,
  stroke: PropTypes.string,
  fontSize: PropTypes.number,
  image: PropTypes.instanceOf(image_type),
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  onChangeSize: PropTypes.func,
  highlight: PropTypes.bool,
};

MapTile.defaultProps = {
  zoom: 1,
  imageZoom: 0.8,
  size: 50,
  fill: "#363636",
  fontSize: 20,
};

export default MapTile;
