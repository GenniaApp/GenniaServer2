import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Box,
  ButtonGroup,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { TileType, CustomMapTileData, TileType2Image } from '@/lib/types';
import CustomMapTile from '@/components/game/CustomMapTile';
import { useTranslation } from 'next-i18next';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { AspectRatioRounded, InfoRounded } from '@mui/icons-material';

const name2TileType: Record<string, TileType> = {
  king: TileType.King,
  city: TileType.City,
  plain: TileType.Plain,
  mountain: TileType.Mountain,
  swamp: TileType.Swamp,
};

type MapData = CustomMapTileData[][];

type Map = {
  name: string;
  creator: string; // todo: get from username
  createdTime: Date; // todo: get from upload time
  data: MapData;
};

const defaultMapData: MapData = Array.from({ length: 10 }, () =>
  Array.from({ length: 10 }, () => [TileType.Plain, null, 0, false, 0])
);

function MapEditor() {
  const [mapWidth, setMapWidth] = useState(10);
  const [mapHeight, setMapHeight] = useState(10);

  const [team, setTeam] = useState(0);
  const [unitsCount, setUnitCount] = useState(50);
  const [priority, setPriority] = useState(0);

  const [mapData, setMapData] = useState(defaultMapData);
  const [selectedTileType, setSelectedTileType] = useState<TileType | null>(
    TileType.Plain
  );
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [mapName, setMapName] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [tileSize, setTileSize] = useState(40);
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const mapPixelWidth = useMemo(() => tileSize * mapWidth, [tileSize]);
  const mapPixelHeight = useMemo(() => tileSize * mapHeight, [tileSize]);

  const property2var: Record<string, any> = {
    team: team,
    unitsCount: unitsCount,
    priority: priority,
    revealed: '',
  };
  const property2setVar: Record<string, any> = {
    team: setTeam,
    unitsCount: setUnitCount,
    priority: setPriority,
  };

  const property2min: Record<string, any> = {
    team: 0,
    unitsCount: -9999,
    priority: 0,
    revealed: '',
  };

  const property2max: Record<string, any> = {
    team: 100,
    unitsCount: 9999,
    priority: 100,
    revealed: '',
  };

  useEffect(() => {
    // Load map data from server
    // ...
  }, []);

  const handleMapWidthChange = (event: any) => {
    let value = Number(event.target.value);

    setMapWidth(value);
    const newMapData = [...mapData];
    if (value > mapWidth) {
      for (let i = 0; i < value - mapWidth; ++i) {
        newMapData.push(
          Array.from({ length: mapHeight }, () => [
            TileType.Plain,
            null,
            0,
            false,
            0,
          ])
        );
      }
    } else {
      newMapData.splice(value, mapWidth - value);
    }
    setMapData(newMapData);
  };

  const handleMapHeightChange = (event: any) => {
    let value = Number(event.target.value);
    setMapHeight(value);
    const newMapData = [...mapData];
    if (value > mapHeight) {
      for (let i = 0; i < mapWidth; ++i) {
        for (let j = 0; j < value - mapHeight; ++j) {
          newMapData[i].push([TileType.Plain, null, 0, false, 0]);
        }
      }
    } else {
      for (let i = 0; i < mapWidth; ++i) {
        newMapData[i].splice(value, mapHeight - value);
      }
    }
    setMapData(newMapData);
  };

  const handleTileClick = (x: number, y: number) => {
    console.log('handleTileClick', x, y, selectedTileType, selectedProperty);
    const newMapData = [...mapData];

    if (selectedTileType !== null) {
      if (newMapData[x][y][0] === selectedTileType) {
        newMapData[x][y] = [TileType.Plain, null, 0, false, 0];
      } else {
        switch (+selectedTileType) {
          case TileType.King:
            newMapData[x][y] = [selectedTileType, 1, 0, false, 0];
            break;
          case TileType.City:
            newMapData[x][y] = [selectedTileType, null, 40, false, 0];
            break;
          case TileType.Plain:
          case TileType.Mountain:
          case TileType.Swamp:
            newMapData[x][y] = [selectedTileType, null, 0, false, 0];
            break;
          default:
            console.log('Error! no match TileType', selectedTileType);
        }
      }
    }

    if (selectedProperty !== null) {
      switch (selectedProperty) {
        case 'team':
          newMapData[x][y][1] = property2var[selectedProperty] as number;
          break;
        case 'unitsCount':
          newMapData[x][y][2] = property2var[selectedProperty] as number;
          break;
        case 'revealed':
          newMapData[x][y][3] = !newMapData[x][y][3];
          break;
        case 'priority': // todo
          newMapData[x][y][4] = property2var[selectedProperty] as number;
          break;
      }
    }

    setMapData(newMapData);
  };

  const handleSaveDraft = () => {
    // Save draft to local storage
    // ...
    setDraftSaved(true);
  };

  const handlePublish = () => {
    // Send map data to server
    // ...
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Quick select different type of tiles
    switch (event.key) {
      case 'k': // king
      case 'g': // general
        setSelectedTileType(TileType.King);
        setSelectedProperty(null);
        break;
      case 'c': // city
        setSelectedTileType(TileType.City);
        setSelectedProperty(null);
        break;
      case 'p': // plain
        setSelectedTileType(TileType.Plain);
        setSelectedProperty(null);
        break;
      case 'm': // mountain
        setSelectedTileType(TileType.Mountain);
        setSelectedProperty(null);
        break;
      case 's': // swamp
        setSelectedTileType(TileType.Swamp);
        setSelectedProperty(null);
        break;
      case 'r': // revealed
        setSelectedTileType(null);
        setSelectedProperty('revealed');
        break;
      case 't': // team
        setSelectedTileType(null);
        setSelectedProperty('team');
        break;
      case 'u': // unitsCount
        setSelectedTileType(null);
        setSelectedProperty('unitsCount');
        break;
      case 'o': // priority
        setSelectedTileType(null);
        setSelectedProperty('priority');
        break;
      default:
        break;
    }
  }, []);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      setDragging(true);
      setStartPosition({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (dragging && mapRef.current) {
        setPosition({
          x: event.clientX - startPosition.x,
          y: event.clientY - startPosition.y,
        });
      }
    },
    [dragging, mapRef, startPosition]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      setStartPosition({
        x: event.targetTouches[0].clientX - position.x,
        y: event.targetTouches[0].clientY - position.y,
      });
    },
    [position]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (mapRef.current) {
        setPosition({
          x: event.targetTouches[0].clientX - startPosition.x,
          y: event.targetTouches[0].clientY - startPosition.y,
        });
      }
    },
    [mapRef, startPosition]
  );

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.addEventListener('keydown', handleKeyDown);
      mapRef.current.addEventListener('mousedown', handleMouseDown);
      mapRef.current.addEventListener('mousemove', handleMouseMove);
      mapRef.current.addEventListener('mouseup', handleMouseUp);
      mapRef.current.addEventListener('touchstart', handleTouchStart);
      mapRef.current.addEventListener('touchmove', handleTouchMove);
      return () => {
        if (mapRef.current) {
          mapRef.current.removeEventListener('keydown', handleKeyDown);
          mapRef.current.removeEventListener('mousedown', handleMouseDown);
          mapRef.current.removeEventListener('mousemove', handleMouseMove);
          mapRef.current.removeEventListener('mouseup', handleMouseUp);
          mapRef.current.removeEventListener('touchstart', handleTouchStart);
          mapRef.current.removeEventListener('touchmove', handleTouchMove);
        }
      };
    }
  }, [
    mapRef,
    handleKeyDown,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
  ]);

  return (
    <div className='app-container'>
      <Box
        className='menu-container'
        sx={{
          borderRadius: '10px 0 0 10px !important',
          padding: '10px !important',
          position: 'absolute',
          top: '60px',
          bottom: '60px',
          right: 0,
          height: 'calc(100dvh - 60px - 60px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          overflow: 'auto'
        }}
      >
        <Card
          className='menu-container'
          sx={{
            width: '100%',
          }}
        >
          <CardHeader avatar={<InfoRounded />} title={t('basic-info')} />
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <TextField
              id='map-name'
              label='Map Name'
              size='small'
              type='text'
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              sx={{ marginY: '10px' }}
            />
            <TextField
              id='map-desc'
              label='Map Description'
              size='small'
              type='text'
              value={mapDescription}
              onChange={(e) => setMapDescription(e.target.value)}
              multiline
              minRows={3}
              maxRows={8}
            />
          </CardContent>
        </Card>
        <Card
          className='menu-container'
          sx={{
            width: '100%',
          }}
        >
          <CardHeader avatar={<AspectRatioRounded />} title={t('map-size')} />
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <TextField
              id='map-width'
              label='Map Width'
              size='small'
              type='number'
              value={mapWidth}
              onChange={handleMapWidthChange}
              sx={{ marginBottom: '10px' }}
            />
            <TextField
              id='map-height'
              label='Map Height'
              size='small'
              type='number'
              value={mapHeight}
              onChange={handleMapHeightChange}
            />
          </CardContent>
        </Card>
        <ButtonGroup size='large'>
          <Button variant='contained' color='info' onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button variant='contained' onClick={handlePublish}>
            Publish
          </Button>
        </ButtonGroup>
        {draftSaved && <span>Draft saved.</span>}
      </Box>

      <div
        ref={mapRef}
        tabIndex={0}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
          width: mapPixelWidth,
          height: mapPixelHeight,
        }}
      >
        {mapData.map((tiles, x) => {
          return tiles.map((tile, y) => {
            return (
              <CustomMapTile
                key={`${x}/${y}`}
                zoom={zoom}
                size={tileSize}
                x={x}
                y={y}
                tile={tile}
                handleClick={() => handleTileClick(x, y)}
              />
            );
          });
        })}
      </div>

      <Box
        className='menu-container'
        sx={{
          position: 'absolute',
          top: '60px',
          bottom: '60px',
          left: 0,
          width: '90px',
          height: 'calc(100dvh - 60px - 60px)',
          borderRadius: '0 10px 10px 0 !important',
          overflow: 'auto',
        }}
      >
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
          height='100%'
        >
          {Object.keys(name2TileType).map((tileName) => (
            <Box
              key={tileName}
              display='flex'
              flexDirection='column'
              alignItems='center'
              borderRadius='10px'
              padding='5px'
              marginY='5px'
              my={0.5}
              bgcolor={
                selectedTileType === name2TileType[tileName] ? '#c54a95' : ''
              }
              onClick={() => {
                setSelectedTileType(name2TileType[tileName]);
                setSelectedProperty(null);
              }}
              sx={{ cursor: 'pointer' }}
            >
              {tileName === 'plain' ? (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: '#808080',
                    border: '#000 solid 1px',
                  }}
                />
              ) : (
                <Image
                  src={TileType2Image[name2TileType[tileName]]}
                  alt={tileName}
                  width={40}
                  height={40}
                  draggable={false}
                />
              )}
              <Typography align='center'>{t(tileName)}</Typography>
            </Box>
          ))}

          {Object.keys(property2var).map((property) => (
            <Box
              key={property}
              display='flex'
              flexDirection='column'
              alignItems='center'
              borderRadius='10px'
              padding='5px'
              marginY='5px'
              my={0.5}
              bgcolor={selectedProperty === property ? '#c54a95' : ''}
              onClick={() => {
                setSelectedProperty(property);
                setSelectedTileType(null);
              }}
            >
              {property === 'revealed' ? (
                <LightbulbOutlinedIcon
                  sx={{
                    width: 40,
                    height: 40,
                    color: '#fff !important',
                  }}
                />
              ) : (
                <TextField
                  id={property}
                  type='number'
                  variant='standard'
                  hiddenLabel
                  inputProps={{
                    min: property2min[property],
                    max: property2max[property],
                    style: { textAlign: 'center' },
                  }}
                  value={property2var[property]}
                  onChange={(event) =>
                    property2setVar[property](event.target.value)
                  }
                />
              )}
              <Typography align='center'>{t(property)}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </div>
  );
}

export default MapEditor;
