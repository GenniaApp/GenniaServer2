import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';

interface PublishMapDialogProps {
  open: boolean;
  onClose: () => void;
  mapId: string;
}

export default function PublishMapDialog({
  open,
  onClose,
  mapId,
}: PublishMapDialogProps) {
  const router = useRouter();
  const [copySuccess, setCopySuccess] = useState(false);
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    setMapUrl(window.location.origin + '/maps/' + mapId);
  }, [mapId]);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(mapUrl);
    setCopySuccess(true);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Custom Map Published!</DialogTitle>
      <DialogContent>
        <Typography> {mapUrl}</Typography>
        <Button onClick={handleCopyClick}>
          {copySuccess ? 'Copied!' : 'Copy'}
        </Button>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            router.push('/maps/' + mapId);
          }}
        >
          View Map
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
