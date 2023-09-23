// cSpell:ignore uuidv gennia
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
import useMap from '@/hooks/useMap';
import MapExplorer from '@/components/game/MapExplorer';
import Loading from '@/components/Loading';
import PublishMapDialog from '@/components/PublishMapDialog';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';
import styled from '@emotion/styled';

const name2TileType: Record<string, TileType> = {
  king: TileType.King,
  city: TileType.City,
  plain: TileType.Plain,
  mountain: TileType.Mountain,
  swamp: TileType.Swamp,
};

const IconBox = styled.div(
  (props: any) => `
  cursor: pointer;
  background-color: ${props.bgcolor};
  &:hover {
    background-color: ${props.bgcolor ? props.bgcolor : 'rgba(255, 85, 85, 0.1)'
    }
  }
`
);

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
  const { t } = useTranslation();
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

  const {
    tileSize,
    position,
    mapRef,
    mapPixelWidth,
    mapPixelHeight,
    zoom,
    setZoom,
  } = useMap({
    mapWidth,
    mapHeight,
  });

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

  const property2var: Record<string, any> = {
    team: team,
    unitsCount: unitsCount,
    priority: priority,
    revealed: '',
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

  const checkSetUnitCount = (value: number) => {
    if (value < property2min.unitsCount) {
      setUnitCount(property2min.unitsCount);
    } else if (value > property2max.unitsCount) {
      setUnitCount(property2max.unitsCount);
    } else {
      setUnitCount(value);
    }
  };
  const checkSetTeam = (value: number) => {
    if (value < property2min.team) {
      setTeam(property2min.team);
    } else if (value > property2max.team) {
      setTeam(property2max.team);
    } else {
      setTeam(value);
    }
  };

  const checkSetPriority = (value: number) => {
    if (value < property2min.priority) {
      setPriority(property2min.priority);
    } else if (value > property2max.priority) {
      setPriority(property2max.priority);
    } else {
      setPriority(value);
    }
  };

  const property2setVar: Record<string, any> = {
    team: checkSetTeam,
    unitsCount: checkSetUnitCount,
    priority: checkSetPriority,
  };

  const handleMapWidthChange = (event: any) => {
    let value = Number(event.target.value);

    if (value < 2) value = 2;
    if (value > 50) value = 50;

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

    if (value < 2) value = 2;
    if (value > 50) value = 50;

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

  const generateCustomMapData = () => {
    // make sure mapName is not empty
    if (mapName === '') {
      snackStateDispatch({
        type: 'update',
        title: 'Error',
        message: t('Map name cannot be empty'),
        duration: null,
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
    if (customMapData)
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
        duration: 5000,
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
            duration: 5000,
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
    return () => { };
  }, [mapRef, editMode, handleKeyDown]);

  return (
    <div
      className='app-container'
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <Snackbar
        open={snackState.open}
        autoHideDuration={snackState.duration}
        onClose={() => {
          console.log(snackState);
          snackStateDispatch({ type: 'toggle', duration: null });
        }}
      >
        <Alert severity={snackState.status} sx={{ width: '100%' }}>
          <AlertTitle>{snackState.title}</AlertTitle>
          {snackState.message}
        </Alert>
      </Snackbar>
      {!editMode && <Loading open={loading} title={t('loading-map')} />}
      {!editMode && (
        <>
          <Box
            className='menu-container'
            sx={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              width: {
                xs: '90vw',
                md: '55vw',
                lg: '45vw',
              },
              transform: `translate(-50%, 0)`,
              minHeight: '10%',
              maxHeight: '30%',
              overflowY: 'auto',
              borderRadius: '24px 24px 0px 0px !important',
              zIndex: 101,
              padding: '13px !important',
            }}
          >
            <Typography variant='h5'>{mapName}</Typography>
            <ReactMarkdown className='react_markdown'>
              {mapDescription}
            </ReactMarkdown>
          </Box>
          <Button
            size='large'
            sx={{
              zIndex: 1001,
              position: 'absolute',
              bottom: '5px',
              left: '50%',
              transform: `translate(-50%, 0)`,
              boxShadow: 3,
            }}
            variant='contained'
            color='primary'
            onClick={handleDownloadMap}
          >
            {t('download')}
          </Button>
        </>
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
            top: '70px',
            bottom: '70px',
            right: 0,
            height: 'calc(100dvh - 60px - 60px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            overflow: 'auto',
            boxShadow: 3,
          }}
        >
          <Button
            sx={{ width: '100%' }}
            variant='contained'
            onClick={handleOpenMapExplorer}
          >
            {t('select-a-custom-map')}
          </Button>

          <Card
            variant='outlined'
            className='menu-container'
            sx={{
              width: '100%',
            }}
          >
            <CardHeader
              avatar={<InfoRounded />}
              title={t('basic-info')}
              sx={{ paddingBottom: 0 }}
            />
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 0,
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
            variant='outlined'
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
          <ButtonGroup size='large' sx={{ width: '100%' }}>
            <Button
              sx={{ width: '100%' }}
              variant='outlined'
              onClick={handleDownloadMap}
            >
              {t('download')}
            </Button>
            <Button
              sx={{ width: '100%' }}
              variant='outlined'
              onClick={handleUploadMap}
            >
              {t('upload')}
            </Button>
          </ButtonGroup>
          <ButtonGroup size='large' sx={{ width: '100%' }}>
            <Button
              sx={{ width: '100%' }}
              variant='outlined'
              onClick={handleSaveDraft}
            >
              {t('save-draft')}
            </Button>
            <Button
              sx={{ width: '100%' }}
              variant='contained'
              onClick={handlePublish}
            >
              {t('publish')}
            </Button>
          </ButtonGroup>
        </Box>
      )}

      {editMode && (
        <Box
          className='menu-container'
          sx={{
            position: 'absolute',
            top: '70px',
            bottom: '70px',
            left: 0,
            width: '90px',
            height: 'calc(100dvh - 60px - 60px)',
            borderRadius: '0 10px 10px 0 !important',
            boxShadow: 3,
          }}
        >
          <Box sx={{ width: '100%', overflowY: 'auto', height: '100%' }}>
            {Object.keys(name2TileType).map((tileName) => (
              <IconBox
                key={tileName}
                className='icon-box'
                bgcolor={
                  selectedTileType === name2TileType[tileName] ? '#6750A4' : ''
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
                <Typography align='center' fontSize='5px'>
                  {t(tileName)}
                </Typography>
              </IconBox>
            ))}

            {Object.keys(property2var).map((property) => (
              <IconBox
                key={property}
                className='icon-box'
                bgcolor={selectedProperty === property ? '#6750A4' : ''}
                onClick={() => {
                  setSelectedProperty(property);
                  setSelectedTileType(null);
                }}
              >
                {property === 'revealed' ? (
                  <LightbulbOutlinedIcon
                    sx={{
                      width: 30,
                      height: 30,
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
                <Typography align='center' fontSize='5px'>
                  {t(property)}
                </Typography>
              </IconBox>
            ))}

            <IconBox
              key='clear-all'
              className='icon-box'
              onClick={() => {
                setMapData(getNewMapData());
              }}
            >
              <ClearIcon
                sx={{
                  width: 30,
                  height: 30,
                  color: 'red !important',
                  cursor: 'pointer',
                }}
              />
              <Typography align='center' fontSize='5px'>
                {t('clear-all')}
              </Typography>
            </IconBox>
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
          width: mapPixelHeight, // game's width and height are swapped
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
                handleClick={editMode ? () => handleTileClick(x, y) : () => { }}
              />
            );
          });
        })}
      </div>
    </div>
  );
}

export default MapEditor;
