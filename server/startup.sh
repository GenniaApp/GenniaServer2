#!/bin/sh
cp .env.example ./.env
npx prisma migrate dev
npm run start
