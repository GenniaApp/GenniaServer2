import Game from "./components/game/Game";
import { map, players } from "./static-demo-game-state.js";
import Navbar from "./components/Navbar";

export default function TextHome() {
  return (
    <>
      <Navbar />
      <Game turnsCount={192} map={map} players={players} />
    </>
  );
}
