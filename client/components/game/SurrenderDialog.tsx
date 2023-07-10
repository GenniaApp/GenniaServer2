import React, { useCallback, useEffect, useState } from 'react';
import Dialog from './Dialog';
import Button from './Button';
import { useTranslation } from 'next-i18next';

interface SurrenderDialogProps {
  onSurrender?: () => void;
}

function SurrenderDialog(props: SurrenderDialogProps) {
  const { onSurrender: handleSurrender, ...restProps } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isOpen) {
        setIsOpen(true);
      }
    },
    [isOpen]
  );

  const handleCloseSurrender = useCallback(() => {
    setIsOpen(false);
    handleSurrender?.();
  }, [handleSurrender]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);

  return (
    <Dialog
      {...restProps}
      open={isOpen}
      onClose={handleClose}
      title={t('are-you-sure-to-surrender')}
    >
      <div className='DialogButtons'>
        <Button variant='primary' onClick={handleCloseSurrender}>
          {t('surrender')}
        </Button>
      </div>
    </Dialog>
  );
}

export default SurrenderDialog;
