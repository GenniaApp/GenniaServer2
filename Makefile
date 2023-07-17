.PHONY: install
install:
	cd client && pnpm install
	cd server && pnpm install
	pnpm install pm2 -g

.PHONY: install_in_china
install_in_china:
	pnpm config set registry https://registry.npmmirror.com/
	pnpm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"
	pnpm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"
	pnpm install sharp

.PHONY: deploy # change `client/.env.production` & `server/.env` to your own settings, for example, change gennia.io to gennia.cn
deploy:
	cd client && pnpm run build
	cd client && pm2 start pnpm --time --name "gennia-client" -- start --port 3000
	cd server && pm2 start pnpm --time --name "gennia-server" -- start --port 3001

.PHONY: restart
restart:
	cd client && pnpm run build
	pm2 restart gennia-client
	pm2 restart gennia-server
