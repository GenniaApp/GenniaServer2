import { Box, IconButton } from '@mui/material';
import { useTranslation } from 'next-i18next';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
interface TurnsCountProps {
  count: number;
  handleReturnClick: any;
}

function TurnsCount(props: TurnsCountProps) {
  const { count, handleReturnClick } = props;
  const { t } = useTranslation();

  const displayTurnsCount = Math.floor(count / 2);

  return (
    <Box
      className='menu-container'
      style={{
        position: 'absolute',
        left: '5px',
        top: '60px',
        zIndex: '110',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <IconButton onClick={handleReturnClick} color='primary'>
        <ArrowBackRoundedIcon />
      </IconButton>
      <div
        style={{
          display: 'inline-block',
          fontSize: '1em',
        }}
      >
        {t('turn')}: {displayTurnsCount}
      </div>
    </Box>
  );
}

export default TurnsCount;
