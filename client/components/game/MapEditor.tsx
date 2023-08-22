import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  useReducer,
} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  Box,
  ButtonGroup,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Position,
  TileType,
  CustomMapTileData,
  TileType2Image,
  CustomMapData,
} from '@/lib/types';
import CustomMapTile from '@/components/game/CustomMapTile';
import { useTranslation } from 'next-i18next';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import { AspectRatioRounded, InfoRounded } from '@mui/icons-material';
import { snackStateReducer } from '@/context/GameReducer';
import useMapDrag from '@/hooks/useMapDrag';
import MapExplorer from '@/components/game/MapExplorer';
import Loading from '@/components/Loading';
import PublishMapDialog from '@/components/PublishMapDialog';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

const name2TileType: Record<string, TileType> = {
  king: TileType.King,
  city: TileType.City,
  plain: TileType.Plain,
  mountain: TileType.Mountain,
  swamp: TileType.Swamp,
};

function getNewMapData(): CustomMapTileData[][] {
  return Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => [TileType.Plain, null, 0, false, 0])
  );
}

function MapEditor({ editMode }: { editMode: boolean }) {
  const [mapWidth, setMapWidth] = useState<number>(10);
  const [mapHeight, setMapHeight] = useState<number>(10);
  const [username, setUsername] = useState<string>('');
  const [team, setTeam] = useState<number>(0);
  const [unitsCount, setUnitCount] = useState<number>(50);
  const [priority, setPriority] = useState<number>(0);
  const [mapData, setMapData] = useState<CustomMapTileData[][]>(
    getNewMapData()
  );
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
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [snackState, snackStateDispatch] = useReducer(snackStateReducer, {
    open: false,
    title: '',
    message: '',
    duration: 1000,
    status: 'error',
  });

  const [loading, setLoading] = useState(false);
  const [openMapExplorer, setOpenMapExplorer] = useState(false);
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const [publishMapId, setPublishMapId] = useState('');

  const router = useRouter();
  const mapId = router.query.mapId as string;

  useMapDrag(mapRef, position, setPosition, zoom, setZoom);

  const handleOpenMapExplorer = () => {
    setOpenMapExplorer(true);
  };

  const handleCloseMapExplorer = () => {
    setOpenMapExplorer(false);
  };

  useEffect(() => {
    if (!editMode) return;
    let tmp: string | null = localStorage.getItem('username');
    if (!tmp) {
      setUsername('anonymous');
    } else {
      setUsername(tmp);
    }
    const mapDraft = localStorage.getItem('mapDraft');
    if (mapDraft) {
      const customMapData: CustomMapData = JSON.parse(mapDraft);
      setMapData(customMapData.mapTilesData);
      setMapWidth(customMapData.width);
      setMapHeight(customMapData.height);
      setMapName(customMapData.name);
      setMapDescription(customMapData.description);
    }
  }, [editMode]);

  const getMapDataFromServer = useCallback((custom_mapId: string) => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/maps/${custom_mapId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        return response.json();
      })
      .then((responseData) => {
        console.log(responseData);
        const customMapData: CustomMapData = responseData;
        setMapData(customMapData.mapTilesData);
        setMapWidth(customMapData.width);
        setMapHeight(customMapData.height);
        setMapName(customMapData.name);
        setMapDescription(customMapData.description);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (editMode) return;
    getMapDataFromServer(mapId);
  }, [mapId, editMode, getMapDataFromServer]);

  const handleMapSelect = (mapId: string) => {
    getMapDataFromServer(mapId);
    setOpenMapExplorer(false);
  };

  const mapPixelWidth = useMemo(
    () => tileSize * mapWidth * zoom,
    [tileSize, mapWidth, zoom]
  );
  const mapPixelHeight = useMemo(
    () => tileSize * mapHeight * zoom,
    [tileSize, mapHeight, zoom]
  );

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
    if (!editMode) return;
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

  const generateCustomMapData = () => {
    // make sure mapName is not empty
    if (mapName === '') {
      snackStateDispatch({
        type: 'update',
        title: 'Error',
        message: t('Map name cannot be empty'),
      });
      return;
    }

    let customMapData: CustomMapData = {
      id: uuidv4(),
      name: mapName,
      width: mapWidth,
      height: mapHeight,
      creator: username,
      description: mapDescription,
      mapTilesData: mapData,
    };
    return customMapData;
  };

  const handleSaveDraft = () => {
    // Save draft to local storage
    setDraftSaved(true);
    const customMapData = generateCustomMapData();
    localStorage.setItem('mapDraft', JSON.stringify(customMapData));
  };

  const handlePublish = async () => {
    const customMapData = generateCustomMapData();
    if (!customMapData) return;

    snackStateDispatch({
      type: 'update',
      title: 'info',
      message: 'Map publishing... Please wait',
      status: 'info',
      duration: 5000,
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API}/maps`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customMapData),
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      await response.json();

      setPublishMapId(customMapData.id);
      setOpenPublishDialog(true);
    } catch (error) {
      console.error('Error:', error);

      // Dispatch error snack
      snackStateDispatch({
        type: 'update',
        title: 'Error',
        message: 'Failed to publish map',
      });
    }
  };

  const handleUploadMap = () => {
    // user can upload a json file contain map data
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result as string;
        try {
          const customMapData: CustomMapData = JSON.parse(result);

          setMapData(customMapData.mapTilesData);
          setMapWidth(customMapData.width);
          setMapHeight(customMapData.height);
          setMapName(customMapData.name);
          setMapDescription(customMapData.description);
        } catch (error) {
          snackStateDispatch({
            type: 'update',
            title: 'Error',
            message: t('Error parsing JSON file'),
          });
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  const handleDownloadMap = () => {
    // download MapData as json
    const customMapData = generateCustomMapData();
    if (!customMapData) return;
    // Create a blob from the JSON string
    const blob = new Blob([JSON.stringify(customMapData, null, 2)], {
      type: 'application/json',
    });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `gennia_custom_map_${username}_${mapName}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
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

  useEffect(() => {
    if (!editMode) return;
    const mapNode = mapRef.current;
    if (mapNode) {
      mapNode.addEventListener('keydown', handleKeyDown);
      return () => {
        mapNode.removeEventListener('keydown', handleKeyDown);
      };
    }
    return () => {};
  }, [mapRef, editMode, handleKeyDown]);

  return (
    <div className='app-container' style={{ position: 'relative' }}>
      <Snackbar
        open={snackState.open}
        autoHideDuration={snackState.duration}
        onClose={() => {
          console.log(snackState);
          snackStateDispatch({ type: 'toggle' });
        }}
      >
        <Alert severity={snackState.status} sx={{ width: '100%' }}>
          <AlertTitle>{snackState.title}</AlertTitle>
          {snackState.message}
        </Alert>
      </Snackbar>
      {!editMode && <Loading open={loading} title={t('loading-map')} />}
      {!editMode && (
        <Box
          className='menu-container'
          sx={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            width: {
              xs: '90vw',
              md: '55vw',
              lg: '45vw',
            },
            transform: `translate(-50%, 0)`,
            height: '20vh',
            overflowY: 'auto',
            borderRadius: '0 10px 10px 0 !important',
            zIndex: 101,
          }}
        >
          <Typography variant='h5'>{mapName}</Typography>
          <ReactMarkdown>{mapDescription}</ReactMarkdown>
          <Button variant='contained' color='info' onClick={handleDownloadMap}>
            {t('download')}
          </Button>
        </Box>
      )}
      <PublishMapDialog
        open={openPublishDialog}
        onClose={() => setOpenPublishDialog(false)}
        mapId={publishMapId}
      ></PublishMapDialog>

      <Dialog open={openMapExplorer} onClose={handleCloseMapExplorer}>
        <DialogTitle>{t('choose-map')}</DialogTitle>
        <DialogContent>
          <MapExplorer userId={username} onSelect={handleMapSelect} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMapExplorer}>{t('close')}</Button>
        </DialogActions>
      </Dialog>

      {editMode && (
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
            overflow: 'auto',
          }}
        >
          <Button variant='contained' onClick={handleOpenMapExplorer}>
            {t('select-a-custom-map')}
          </Button>

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
            <Button
              variant='contained'
              color='info'
              onClick={handleDownloadMap}
            >
              {t('download')}
            </Button>
            <Button variant='contained' onClick={handleUploadMap}>
              {t('upload')}
            </Button>
          </ButtonGroup>
          <ButtonGroup size='large'>
            <Button variant='contained' color='info' onClick={handleSaveDraft}>
              {t('save-draft')}
            </Button>
            <Button variant='contained' onClick={handlePublish}>
              {t('publish')}
            </Button>
          </ButtonGroup>
          {draftSaved && <span>Draft saved.</span>}
        </Box>
      )}

      {editMode && (
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
                className='icon-box'
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
                className='icon-box'
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
                      property2setVar[property](+event.target.value)
                    }
                  />
                )}
                <Typography align='center'>{t(property)}</Typography>
              </Box>
            ))}

            <Box
              key='clear-all'
              className='icon-box'
              onClick={() => {
                setMapData(getNewMapData());
              }}
            >
              <ClearIcon
                sx={{
                  width: 40,
                  height: 40,
                  color: '#fff !important',
                }}
              />
              <Typography align='center'>{t('clear-all')}</Typography>
            </Box>
          </Box>
        </Box>
      )}

      <div
        ref={mapRef}
        tabIndex={0}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
          width: mapPixelHeight, // we should swap width and height here
          height: mapPixelWidth,
          backgroundColor: '#495468',
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
    </div>
  );
}

export default MapEditor;
