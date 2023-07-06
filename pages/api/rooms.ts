import { roomPool } from '@/lib/room-pool';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.status(200).json(roomPool);
  } catch (err) {
    res.status(500).end();
  }
}

export default handler;
