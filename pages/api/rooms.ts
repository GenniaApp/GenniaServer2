import { getRoomsInfo } from '@/lib/rooms';
import type { NextApiRequest, NextApiResponse } from 'next';

function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const room_info = getRoomsInfo();
    // console.log("get room_info");
    // console.log(room_info);
    res.status(200).json({ room_info });
  } catch (err) {
    res.status(500).end();
  }
}

export default handler;
