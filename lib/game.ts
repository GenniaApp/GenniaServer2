// todo
import GameMap from './map';
import { Socket } from 'socket.io';

class Game {
  map: GameMap;
  lobby: Lobby;
  players: Player[];

  constructor(
    gameSpeed: number,
    mapWidth: number,
    mapHeight: number,
    mountain: number,
    city: number,
    swamp: number
  ) {
    this.map = new GameMap(mapWidth, mapHeight);
    this.lobby = new Lobby();
    this.players = [];

    setInterval(this.update.bind(this), 1000 / gameSpeed);
  }

  public handleInput(socket: Socket, command: string): void {
    const playerID = socket.id;
    const deque = this.lobby.deques.get(playerID);
    deque.push(command);
  }

  update(): void {
    this.map.updateTurn();
    this.map.updateUnit();

    if (this.map.turn % 50 === 0) {
      console.info(`Turn ${this.map.turn}`);
    }
  }
}

export default Game;