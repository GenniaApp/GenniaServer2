.PHONY: install
install:
	cd client && pnpm install
	cd server && pnpm install

.PHONY: install_product
install_product:
	pnpm install pm2 -g

.PHONY: deploy
deploy:
	pm2 delete gennia-client
	pm2 delete gennia-server
	cd client && pnpm run build
	cd client && pm2 start pnpm --name "gennia-client" -- start --port 3000
	cd server && pm2 start pnpm --name "gennia-server" -- start --port 3001