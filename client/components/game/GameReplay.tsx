import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
  useReducer,
} from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Slider,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
  TextField,
  FormControlLabel,
} from '@mui/material';

import {
  FastRewindRounded,
  PlayArrowRounded,
  PauseRounded,
  FastForwardRounded,
} from '@mui/icons-material';
import { mapDataReducer } from '@/context/GameReducer';
import CustomMapTile from '@/components/game/CustomMapTile';
import { ReplaySpeedOptions } from '@/lib/constants';
import {
  Position,
  LeaderBoardTable,
  Message,
  UserData,
  TileProp,
  TileType,
} from '@/lib/types';
import TurnsCount from './TurnsCount';
import LeaderBoard from './LeaderBoard';
import { useTranslation } from 'next-i18next';
import GameLoading from '@/components/GameLoading';
import GameRecord from '@/lib/game-record';
import ChatBox from '@/components/ChatBox';
import useMap from '@/hooks/useMap';

export default function GameReplay(props: any) {
  const [gameRecord, setGameRecord] = useState<GameRecord | null>(null);
  const [mapWidth, setMapWidth] = useState(10);
  const [mapHeight, setMapHeight] = useState(10);
  const [playSpeed, setPlaySpeed] = useState(4);
  const [turnsCount, setTurnsCount] = useState(1);
  const [maxTurn, setMaxTurn] = useState(1);
  const [leaderBoardData, setLeaderBoardData] =
    useState<LeaderBoardTable | null>(null);
  const [isPlay, setIsPlay] = useState(false);
  const [mapData, mapDataDispatch] = useReducer(mapDataReducer, [[]]);
  const [limitedView, setLimitedView] = useState<TileProp[][]>([[]]);
  const [checkedPlayers, setCheckedPlayers] = useState<UserData[]>([]);
  const { t } = useTranslation();
  const [notFoundError, setNotFoundError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const intervalId = useRef<any>(undefined);

  const {
    tileSize,
    position,
    mapRef,
    mapPixelWidth,
    mapPixelHeight,
    zoom,
    setZoom,
    handleZoomOption,
  } = useMap({ mapWidth, mapHeight });

  const router = useRouter();
  const replayId = router.query.replayId as string;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      handleZoomOption(event.key);
      switch (event.key) {
        case ' ': // black space
          setIsPlay(!isPlay);
          break;
        default:
          break;
      }
    },
    [isPlay, mapWidth]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    async function fetchReplayData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_API}/get_replay/${replayId}`
        );
        if (response.status === 404) {
          throw new Error('Replay not found');
        }
        const game_record = await response.json();
        // init
        setGameRecord(game_record);
        setMapHeight(game_record.mapHeight);
        setMapWidth(game_record.mapWidth);
        setMaxTurn(game_record.gameRecordTurns.length);

        mapDataDispatch({
          type: 'init',
          mapWidth: game_record.mapWidth,
          mapHeight: game_record.mapHeight,
        });

        const { turn, data, lead } = game_record.gameRecordTurns[0];
        mapDataDispatch({ type: 'update', mapDiff: data });
        setLeaderBoardData(lead);
      } catch (error) {
        console.error(error);
        setNotFoundError('Replay not found');
      }
    }

    fetchReplayData();
  }, [replayId]);

  useEffect(() => {
    if (gameRecord) {
      let tmp_turn = turnsCount;
      if (!tmp_turn) tmp_turn = 1;

      const updateTurn = () => {
        if (tmp_turn > gameRecord.gameRecordTurns.length) {
          clearInterval(intervalId.current);
          setIsPlay(false);
          return;
        }
        const { turn, data, lead } = gameRecord.gameRecordTurns[tmp_turn - 1];
        mapDataDispatch({ type: 'update', mapDiff: data });
        setLeaderBoardData(lead);
        setTurnsCount(tmp_turn);
        setMessages(
          gameRecord.messagesRecord.filter((message) => {
            if (message.turn) return message.turn <= tmp_turn;
            else return true;
          })
        );

        tmp_turn++;
      };
      if (isPlay) {
        intervalId.current = setInterval(updateTurn, 500 / playSpeed);
      } else {
        clearInterval(intervalId.current);
      }
    }
  }, [gameRecord, isPlay, playSpeed]); // don't add turnsCount

  useEffect(() => {
    if (checkedPlayers && checkedPlayers.length > 0) {
      const directions = [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [0, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ];
      let colors = checkedPlayers.map((player) => player.color);
      let tmp = Array.from(Array(mapWidth), () =>
        Array(mapHeight).fill([TileType.Fog, null, null])
      );
      for (let i = 0; i < mapWidth; ++i) {
        for (let j = 0; j < mapHeight; ++j) {
          if (
            mapData[i][j][0] === TileType.City ||
            mapData[i][j][0] === TileType.Mountain
          ) {
            tmp[i][j] = [TileType.Obstacle, null, null];
          }
        }
      }
      for (let i = 0; i < mapWidth; ++i) {
        for (let j = 0; j < mapHeight; ++j) {
          if (mapData[i][j][1] && colors.includes(mapData[i][j][1] as number)) {
            for (let dir of directions) {
              let new_x = i + dir[0];
              let new_y = j + dir[1];
              if (new_x < 0 || new_x >= mapWidth) continue;
              if (new_y < 0 || new_y >= mapHeight) continue;
              tmp[i + dir[0]][j + dir[1]] = mapData[i + dir[0]][j + dir[1]];
            }
          }
        }
      }
      setLimitedView(tmp);
    } else {
      setLimitedView(mapData);
    }
  }, [mapData, checkedPlayers, mapWidth, mapHeight]);

  const changeTurn = (current_turn: number) => {
    if (gameRecord) {
      if (current_turn >= maxTurn) current_turn = maxTurn;

      setIsPlay(false);
      clearInterval(intervalId.current);

      setTurnsCount(current_turn);

      setMessages(
        gameRecord.messagesRecord.filter((message) => {
          if (message.turn) return message.turn <= current_turn;
          else return true;
        })
      );

      mapDataDispatch({
        type: 'jump-to-turn',
        gameRecordTurns: gameRecord.gameRecordTurns,
        jumpToTurn: current_turn - 1,
      });

      const { lead } = gameRecord.gameRecordTurns[current_turn - 1];
      setLeaderBoardData(lead);
    }
  };

  const handleChangeTurn = (event: any) => {
    changeTurn(event.target.value as number);
  };

  if (notFoundError) {
    return (
      <div className='menu-container'>
        <Typography variant='h4'>{t('Replay not found')}</Typography>
      </div>
    );
  }

  if (!gameRecord) {
    return (
      <div className='center-layout'>
        <GameLoading />
      </div>
    );
  } else {
    return (
      <Box className='app-container'>
        <Box className='Game'>
          {/* Replay Control Menu */}
          <Box
            className='menu-container'
            sx={{
              margin: 0,
              padding: '5px',
              position: 'absolute',
              left: '50%',
              transform: 'translate(-50%, 0) translate(0, 0)',
              width: 'max-content',
              height: 'min-content',
              bottom: { xs: '5px', md: '20px' },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              zIndex: 1002,
              boxShadow: '2',
            }}
          >
            <Box
              display='flex'
              flexDirection='row'
              justifyContent='space-between'
              sx={{
                marginBottom: {
                  xs: '-8px',
                  md: '10px',
                },
              }}
            >
              <IconButton
                size='small'
                disabled={turnsCount === 1}
                onClick={() => changeTurn(turnsCount > 1 ? turnsCount - 1 : 1)}
              >
                <FastRewindRounded fontSize='large' />
              </IconButton>
              <IconButton size='small' onClick={() => setIsPlay(!isPlay)}>
                {isPlay ? (
                  <PauseRounded fontSize='large' />
                ) : (
                  <PlayArrowRounded fontSize='large' />
                )}
              </IconButton>
              <IconButton
                size='small'
                disabled={turnsCount === maxTurn}
                onClick={() =>
                  changeTurn(turnsCount < maxTurn ? turnsCount + 1 : maxTurn)
                }
              >
                <FastForwardRounded fontSize='large' />
              </IconButton>
            </Box>
            <Slider
              size='small'
              value={turnsCount}
              min={0}
              step={1}
              max={maxTurn}
              onChange={handleChangeTurn}
              sx={{
                color: '#fff',
                padding: '4px 0px',
                height: 6,
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                  transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                  '&:before': {
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                  },
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px rgb(255 255 255 / 16%)`,
                  },
                  '&.Mui-active': {
                    width: 26,
                    height: 26,
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.28,
                },
              }}
            />
            <RadioGroup
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: {
                  xs: '-8px',
                  md: '10px',
                },
              }}
              aria-label='game-speed'
              name='game-speed'
              value={playSpeed}
              row
              onChange={(event) => {
                setIsPlay(false);
                setPlaySpeed(Number.parseFloat(event.target.value));
              }}
            >
              {ReplaySpeedOptions.map((value) => (
                <FormControlLabel
                  sx={{
                    marginX: {
                      xs: '1px',
                      md: '3px',
                    },
                  }}
                  key={value}
                  value={value}
                  control={<Radio size='small' />}
                  label={<Typography color='white'>{`${value}x`}</Typography>}
                />
              ))}
            </RadioGroup>
          </Box>

          <TurnsCount
            count={turnsCount}
            handleReturnClick={() => {
              router.push('/');
            }}
          />

          <LeaderBoard
            leaderBoardTable={leaderBoardData}
            players={gameRecord.players}
            checkedPlayers={checkedPlayers}
            setCheckedPlayers={setCheckedPlayers}
          />
          <ChatBox socket={null} messages={messages} />
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
            }}
          >
            {limitedView.map((tiles, x) => {
              return tiles.map((tile, y) => {
                return (
                  <CustomMapTile
                    key={`${x}/${y}`}
                    zoom={zoom}
                    size={tileSize}
                    x={x}
                    y={y}
                    tile={[...tile, false, 0]}
                  />
                );
              });
            })}
          </div>
        </Box>
      </Box>
    );
  }
}
