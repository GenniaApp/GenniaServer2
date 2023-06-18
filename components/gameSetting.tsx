import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { FiUsers, FiSettings, FiLayers, FiMessageSquare } from "react-icons/fi";
import { FaMountain, FaCity, FaWater } from "react-icons/fa";

interface GameSettingProps {
  gameSpeed: number;
  setGameSpeed: (value: number) => void;
  mapWidth: number;
  setMapWidth: (value: number) => void;
  mapHeight: number;
  setMapHeight: (value: number) => void;
  mountain: number;
  setMountain: (value: number) => void;
  city: number;
  setCity: (value: number) => void;
  swamp: number;
  setSwamp: (value: number) => void;
  maxPlayerNum: number;
  setMaxPlayerNum: (value: number) => void;
}

const GameSetting = ({
  gameSpeed,
  setGameSpeed,
  mapWidth,
  setMapWidth,
  mapHeight,
  setMapHeight,
  mountain,
  setMountain,
  city,
  setCity,
  swamp,
  setSwamp,
  maxPlayerNum,
  setMaxPlayerNum,
}: GameSettingProps) => {
  const handleGameSpeedChange = (event: any, value: number | number[]) => {
    setGameSpeed(value as number);
  };

  const handleMapWidthChange = (event: any, value: number | number[]) => {
    setMapWidth(value as number);
  };

  const handleMapHeightChange = (event: any, value: number | number[]) => {
    setMapHeight(value as number);
  };

  const handleMountainChange = (event: any, value: number | number[]) => {
    setMountain(value as number);
  };

  const handleCityChange = (event: any, value: number | number[]) => {
    setCity(value as number);
  };

  const handleSwampChange = (event: any, value: number | number[]) => {
    setSwamp(value as number);
  };

  const handleMaxPlayerNumChange = (event: any, value: number | number[]) => {
    setMaxPlayerNum(value as number);
  };

  return (
    <>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12}>
          <Typography variant="h5" component="h2">
            <FiSettings className="inline-block mr-2" />
            Map Settings
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography id="game-speed-slider" gutterBottom>
            GameSpeed: {gameSpeed}
          </Typography>
          <Slider
            value={gameSpeed}
            onChange={handleGameSpeedChange}
            min={1}
            max={4}
            aria-label="game-speed-slider"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography id="map-width-slider" gutterBottom>
            Width: {mapWidth}
          </Typography>
          <Slider
            value={mapWidth}
            onChange={handleMapWidthChange}
            min={10}
            max={50}
            aria-label="map-width-slider"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography id="map-height-slider" gutterBottom>
            Height: {mapHeight}
          </Typography>
          <Slider
            value={mapHeight}
            onChange={handleMapHeightChange}
            min={10}
            max={50}
            aria-label="map-height-slider"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" component="h2">
            <FiLayers className="inline-block mr-2" />
            Terrain Settings
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FaMountain className="inline-block mr-2" />
          <Typography id="mountain-slider" gutterBottom>
            Mountain: {mountain}
          </Typography>
          <Slider
            value={mountain}
            onChange={handleMountainChange}
            min={0}
            max={100}
            aria-label="mountain-slider"
          />
        </Grid>
        <Grid item xs={12}>
          <FaCity className="inline-block mr-2" />
          <Typography id="city-slider" gutterBottom>
            City: {city}
          </Typography>
          <Slider
            value={city}
            onChange={handleCityChange}
            min={0}
            max={100}
            aria-label="city-slider"
          />
        </Grid>
        <Grid item xs={12}>
          <FaWater className="inline-block mr-2" />
          <Typography id="swamp-slider" gutterBottom>
            Swamp: {swamp}
          </Typography>
          <Slider
            value={swamp}
            onChange={handleSwampChange}
            min={0}
            max={100}
            aria-label="swamp-slider"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" component="h2">
            <FiUsers className="inline-block mr-2" />
            Player Settings
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography id="max-player-num-slider" gutterBottom>
            Max player num: {maxPlayerNum}
          </Typography>
          <Slider
            value={maxPlayerNum}
            onChange={handleMaxPlayerNumChange}
            min={2}
            max={12}
            aria-label="max-player-num-slider"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default GameSetting;
