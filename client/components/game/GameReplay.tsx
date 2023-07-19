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
  IconButton,
  Radio,
  RadioGroup,
  Typography,
  TextField,
  FormControlLabel,
} from '@mui/material';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { mapDataReducer } from '@/context/GameReducer';
import CustomMapTile from '@/components/game/CustomMapTile';
import { SpeedOptions } from '@/lib/constants';
import { Position, LeaderBoardTable, Message } from '@/lib/types';
import LeaderBoard from './LeaderBoard';
import { useTranslation } from 'next-i18next';
import GameLoading from '@/components/GameLoading';
import useMapDrag from '@/hooks/useMapDrag';
import GameRecord from '@/lib/game-record';
import ChatBox from '@/components/ChatBox';
import Swal from 'sweetalert2';

export default function GameReplay(props: any) {
  const [gameRecord, setGameRecord] = useState<GameRecord | null>(null);
  const [mapWidth, setMapWidth] = useState(10);
  const [mapHeight, setMapHeight] = useState(10);
  const [playSpeed, setPlaySpeed] = useState(2);
  const [turnsCount, setTurnsCount] = useState(1);
  const [maxTurn, setMaxTurn] = useState(1);
  const [leaderBoardData, setLeaderBoardData] =
    useState<LeaderBoardTable | null>(null);
  const [isPlay, setIsPlay] = useState(false);
  const [mapData, mapDataDispatch] = useReducer(mapDataReducer, [[]]);
  const { t } = useTranslation();
  const [notFounderror, setNotFoundError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [zoom, setZoom] = useState(1);
  const [tileSize, setTileSize] = useState(40);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const intervalId = useRef<any>(undefined);

  useMapDrag(mapRef, position, setPosition, zoom, setZoom);

  const router = useRouter();
  const replayId = router.query.replayId as string;

  const mapPixelWidth = useMemo(
    () => tileSize * mapWidth,
    [tileSize, mapWidth]
  );
  const mapPixelHeight = useMemo(
    () => tileSize * mapHeight,
    [tileSize, mapHeight]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ': // black space
          setIsPlay(!isPlay);
          break;
        default:
          break;
      }
    },
    [isPlay]
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
        console.log('updateTurn', tmp_turn);
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
  }, [gameRecord, isPlay, playSpeed]);

  const handleChangeTurn = (event: any) => {
    if (gameRecord) {
      if (event.target.value === '') {
        setTurnsCount(event.target.value);
        return;
      }
      let current_turn = Number.parseInt(event.target.value);
      if (current_turn >= maxTurn) current_turn = maxTurn;

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
    }
  };

  if (notFounderror) {
    Swal.fire({
      title: 'Replay Not Found',
      text: 'Return to Lobby.',
      icon: 'error',
      showDenyButton: false,
      showCancelButton: false,
      allowOutsideClick: false,
      confirmButtonText: 'OK',
    }).then((result) => {
      router.push(`/`);
    });
    return null;
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
        <Box
          className='menu-container'
          sx={{
            position: 'absolute',
            top: '60px',
            bottom: '60px',
            right: 0,
            width: '90px',
            height: 'calc(100dvh - 60px - 60px)',
            borderRadius: '0 10px 10px 0 !important',
            overflow: 'auto',
          }}
        >
          <IconButton
            onClick={() => {
              setIsPlay(!isPlay);
            }}
          >
            {isPlay ? <StopIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Box
            display='flex'
            flexDirection='column'
            justifyContent='space-between'
          >
            <Typography align='center'>{t('game-speed')}</Typography>
            <RadioGroup
              aria-label='game-speed'
              name='game-speed'
              value={playSpeed}
              row
              onChange={(event) => {
                setIsPlay(false);
                setPlaySpeed(Number.parseFloat(event.target.value));
              }}
            >
              {SpeedOptions.map((value) => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio size='small' />}
                  label={`${value}x`}
                />
              ))}
            </RadioGroup>

            <Typography align='center'>{t('jump-to-turn')}</Typography>
            <TextField
              id='turn'
              type='number'
              variant='standard'
              hiddenLabel
              value={turnsCount}
              onChange={handleChangeTurn}
              inputProps={{
                min: 1,
                max: maxTurn,
                style: { textAlign: 'center' },
              }}
            />
          </Box>
        </Box>

        <LeaderBoard
          leaderBoardTable={leaderBoardData}
          players={gameRecord.players}
          turnsCount={turnsCount}
        />

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
                  tile={[...tile, false, 0]}
                  handleClick={() => {}}
                />
              );
            });
          })}
        </div>
        <ChatBox socket={null} messages={messages} setMessages={setMessages} />
      </Box>
    );
  }
}
