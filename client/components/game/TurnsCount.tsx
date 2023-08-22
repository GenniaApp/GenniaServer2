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
      style={{
        display: 'inline-block',
        fontSize: '1em',
      }}
    >
      {t('turn')}: {displayTurnsCount}
    </div>
  );
}

export default TurnsCount;
