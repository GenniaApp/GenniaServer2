import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { TileType, TileType2Image } from '@/lib/types';

interface HowToPlayProps {
  show: boolean;
  toggleShow: any;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ show, toggleShow }) => {
  const { t } = useTranslation('common');

  const tableData = [
    { label: t('howToPlay.move'), value: t('howToPlay.wsad') },
    { label: t('howToPlay.openChat'), value: t('howToPlay.enter') },
    { label: t('howToPlay.surrender'), value: 'Esc' },
    { label: t('howToPlay.selectGeneral'), value: 'G' },
    { label: t('howToPlay.toggle50'), value: 'Z' },
    { label: t('howToPlay.undoMove'), value: 'E' },
    { label: t('howToPlay.clearQueuedMoves'), value: 'Q' },
    { label: t('howToPlay.setZoom'), value: '1 / 2 / 3' },
    { label: t('howToPlay.zoomInOut'), value: t('howToPlay.mouse-wheel') },
  ];

  return (
    <div>
      <Dialog open={show} onClose={toggleShow}>
        <DialogTitle>{t('howToPlay.title')}</DialogTitle>
        <DialogContent>
          <div>
            <div style={{ display: 'flex' }}>
              <Typography variant='body1'>{t('howToPlay.goal')}</Typography>
              <Image
                src={TileType2Image[TileType.King]}
                alt='king'
                width='20'
                height='20'
                style={{
                  backgroundColor: 'white',
                }}
              />
            </div>

            <ul>
              <li>{t('howToPlay.plains')}</li>
              <li>
                <div style={{ display: 'flex' }}>
                  <Image
                    src={TileType2Image[TileType.City]}
                    alt='king'
                    width='20'
                    height='20'
                    style={{
                      backgroundColor: 'white',
                    }}
                  />
                  {t('howToPlay.cities')}
                </div>
              </li>
              <li>{t('howToPlay.moves')}</li>
              <li>{t('howToPlay.capture')}</li>
            </ul>
            <Typography variant='body1'>{t('howToPlay.shortcut')}</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('howToPlay.shortcut')}</TableCell>
                  <TableCell>{t('howToPlay.key')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell>{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HowToPlay;
