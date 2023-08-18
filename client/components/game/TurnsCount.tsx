import { useTranslation } from 'next-i18next';
interface TurnsCountProps {
  count: number;
}

function TurnsCount(props: TurnsCountProps) {
  const { count } = props;
  const { t } = useTranslation();

  const displayTurnsCount = Math.floor(count / 2);

  return (
    <div
      className='menu-container'
      style={{
        position: 'absolute',
        left: '5px',
        top: '60px',
        zIndex: '110',
        display: 'inline-block',
        fontSize: '1em',
      }}
    >
      {t('turn')}: {displayTurnsCount}
    </div>
  );
}

export default TurnsCount;
