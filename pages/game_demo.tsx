import Game from '@/components/game/Game';
import { map, players } from "./static-demo-game-state.js";
import ChatBox from '@/components/chatbox';

export default function TextHome() {

  return (
    <>
      <Game turnsCount={192} map={map} players={players} />
      <ChatBox roomid='game'/>
    </>
  )
}
