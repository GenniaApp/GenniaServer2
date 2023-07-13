import React, { useCallback, useEffect, useState } from 'react';
import Dialog from './Dialog';
import { Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useGame } from '@/context/GameContext';

export default function SurrenderDialog({
  handleSurrender,
}: {
  handleSurrender: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { openOverDialog } = useGame();
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isOpen && !openOverDialog) {
        setIsOpen(true);
      }
    },
    [isOpen, openOverDialog]
  );

  const handleCloseSurrender = useCallback(() => {
    setIsOpen(false);
    handleSurrender();
  }, [handleSurrender]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      title={t('are-you-sure-to-surrender')}
    >
      <div className='DialogButtons'>
        <Button variant='contained' onClick={handleCloseSurrender}>
          {t('surrender')}
        </Button>
      </div>
    </Dialog>
  );
}
