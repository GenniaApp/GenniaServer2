import { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { useTranslation } from 'next-i18next';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PingTest from '@/components/PingTest';

interface TurnsCountProps {
  count: number;
  handleReturnClick: any;
}

function TurnsCount(props: TurnsCountProps) {
  const { count, handleReturnClick } = props;
  const { t } = useTranslation();
  const [showPingTest, setShowPingTest] = useState(false);

  const displayTurnsCount = Math.floor(count / 2);

  const handleDoubleClick = () => {
    setShowPingTest(!showPingTest);
  };

  return (
    <Box
      style={{
        position: 'absolute',
        left: '1px',
        top: '0px',
        zIndex: '110',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Box
        className='menu-container'
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: '0 10px 10px 0 !important',
        }}
      >
        <IconButton onClick={handleReturnClick} color='primary'>
          <ArrowBackRoundedIcon />
        </IconButton>
        <div
          style={{
            display: 'inline-block',
            fontSize: '1em',
            marginRight: '0.5em',
          }}
        >
          {t('turn')}: {displayTurnsCount}
        </div>
      </Box>
      {showPingTest && <PingTest />}
    </Box>
  );
}

export default TurnsCount;
