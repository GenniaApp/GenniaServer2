## GenniaServer 2

<h1 align="center">
  <img src="client/public/img/favicon.png" style="height: 90px;"alt="Gennia">
  <br>
  <a href="https://gennia.io"> Gennia</a>
</h1>

> Yet another generals.io clone server & client

![**Gennia Game UI**](gennia.jpg)

What is GenniaServer 2?

- A realtime multiplayer game where the goal is to capture all of the enemy's general without losing your own
- using react/nextjs/socket/express
- inspired by [generals.io](https://generals.io), the game mode will be different from generals.io in the future.

## How to Play

Your goal is to capture other generals.

- Plains produce one unit every 25 turns
- Cities and generals produce one unit every turn
- You can move twice per turn.
- When you capture the enemy general, all his territory belongs to you and his army strength is halved and becomes yours.

| function           | keyboard       |
| ------------------ | -------------- |
| Move Up            | w / ArrowUp    |
| Move Down          | s / ArrowDown  |
| Move Left          | a / ArrayLeft  |
| Move Right         | d / ArrayRight |
| Open Chat          | enter          |
| Undo Move          | e              |
| Clear Queued Moves | q              |
| Select on general  | g              |
| Toggle 50%         | z              |
| Set Zoom to Preset | 1 / 2 / 3      |
| Zoom in / out      | mouse wheel    |
| Surrender          | escape         |

## Development

### client: nextjs

First, run the development server:

```bash
cd client/
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### server: express + socket.io

ps: server side code init from [template](https://github.com/nisicadmir/nodejs-typescript/tree/master/tutorial-5)

```bash
cd server/
pnpm install
pnpm run dev
```

## Deployment

[PM2](https://github.com/Unitech/pm2) is a production process manager for Node.js applications, which is very easy to use.

change `client/.env.production` & `server/.env`

```shell
pnpm install pm2 -g
cd client && pnpm run build
cd client && pm2 start pnpm --name "gennia-client" -- start --port 3000
cd server && pm2 start pnpm --name "gennia-server" -- start --port 3001
```

## [Roadmap](https://github.com/orgs/GenniaApp/projects/1)

## License

Distributed under the GNU GENERAL PUBLIC LICENSE VERSION 3. See `LICENSE.txt` for more information.

## Acknowledgments

- [MadJS](https://github.com/fluffybeastgames/MadJS/)
- [generals-io-webapp](https://github.com/dhyegocalota/generals-io-webapp)
